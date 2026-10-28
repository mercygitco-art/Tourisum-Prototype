import { useEffect, useState } from 'react'
import ArrowIcon from './ArrowIcon'
import destinations from '../data/destinations'
import {
  buildItinerary,
  defaultTrip,
  formatItinerary,
  formatTripDate,
  isValidSavedPlan,
  tripOptions,
} from '../utils/itinerary'

const interestOptions = [
  { value: 'All', label: 'A little bit of everything' },
  { value: 'Culture', label: 'Culture & heritage' },
  { value: 'Highlands', label: 'Mountains & tea country' },
  { value: 'Coast', label: 'Beaches & ocean' },
  { value: 'Wildlife', label: 'Wildlife & nature' },
]

const savedPlanKey = 'ceylon-saved-trip-v1'

function readSavedPlan() {
  // Restore a saved plan only after validating its shape and destination names.
  try {
    const saved = localStorage.getItem(savedPlanKey)
    if (!saved) return { plan: null, message: '' }

    const parsed = JSON.parse(saved)
    if (!isValidSavedPlan(parsed)) {
      return {
        plan: null,
        message: 'Your saved trip could not be read. Create a new idea to replace it.',
      }
    }

    const stops = parsed.stops.map((savedStop) => {
      const destination = destinations.find(({ name }) => name === savedStop.name)
      return { ...destination, days: savedStop.days }
    })

    return {
      plan: {
        trip: parsed.trip,
        suggestion: {
          ...parsed,
          stops,
        },
      },
      message: 'Your saved trip is ready to continue.',
    }
  } catch {
    return {
      plan: null,
      message: 'Saved trips are unavailable in this browser. You can still download your plan.',
    }
  }
}

function todayAsInputValue() {
  // Produce a local date suitable for a native date input's minimum value.
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function formatDate(value) {
  if (!value) return 'Dates to be decided'
  return formatTripDate(value)
}

function TripPlanner() {
  // Keep the editable trip, generated suggestion, and saved-plan state separate.
  const [restored] = useState(readSavedPlan)
  const [trip, setTrip] = useState(restored.plan?.trip ?? defaultTrip)
  const [suggestion, setSuggestion] = useState(restored.plan?.suggestion ?? null)
  const [saved, setSaved] = useState(Boolean(restored.plan))
  const [selectedDestination, setSelectedDestination] = useState(
    restored.plan?.suggestion?.selectedDestination ?? '',
  )
  const [hasSavedPlan, setHasSavedPlan] = useState(Boolean(restored.plan))
  const [status, setStatus] = useState(restored.message)

  useEffect(() => {
    // Accept selections from the hero, destination cards, and map popups.
    const selectDestination = (event) => {
      const { name, startDate, travelers } = event.detail ?? {}
      const place = destinations.find(({ name: destinationName }) => destinationName === name)
      const validDate = typeof startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
      const validTravelers = ['1', '2', '3', '4', '5'].includes(String(travelers))
      if (!place && !validDate && !validTravelers) return

      setSelectedDestination(place?.name ?? '')
      setTrip((currentTrip) => ({
        ...currentTrip,
        ...(place ? {
          interest: place.category,
          coast: place.route === 'east' ? 'East coast' : currentTrip.coast,
        } : {}),
        ...(validDate ? { startDate } : {}),
        ...(validTravelers ? { travelers: String(travelers) } : {}),
      }))
      window.dispatchEvent(new Event('ceylon:clear-itinerary'))
      setSuggestion(null)
      setSaved(false)
      setStatus(place
        ? `${place.name} is selected as the first stop in your trip idea.`
        : 'Your travel date and party size are ready in the trip planner.')
    }

    window.addEventListener('ceylon:select-destination', selectDestination)
    return () => window.removeEventListener('ceylon:select-destination', selectDestination)
  }, [])

  const updateTrip = (event) => {
    // Update one planner field and invalidate the previous generated suggestion.
    const { name, value } = event.target
    setTrip((currentTrip) => ({ ...currentTrip, [name]: value }))
    window.dispatchEvent(new Event('ceylon:clear-itinerary'))
    if (name === 'interest' || name === 'coast') {
      setSelectedDestination('')
    }
    if (suggestion) setSaved(false)
    setSuggestion(null)
    setStatus(hasSavedPlan
      ? 'Your previous saved trip is unchanged. Save again to replace it.'
      : '')
  }

  const createItinerary = (event) => {
    // Validate the date, build a route, and expose the generated plan to the UI.
    event.preventDefault()
    if (trip.startDate && trip.startDate < todayAsInputValue()) {
      setStatus('Choose a start date today or later, or leave the date open.')
      return
    }

    const stops = buildItinerary(trip, selectedDestination)
    if (stops.length === 0) {
      setStatus('We could not find a route for those preferences. Try another interest.')
      return
    }

    const plan = {
      days: Number(trip.days),
      travelers: Number(trip.travelers),
      startDate: trip.startDate,
      interest: trip.interest,
      coast: trip.coast,
      pace: trip.pace,
      stay: trip.stay,
      selectedDestination,
      stops,
    }
    window.dispatchEvent(new Event('ceylon:clear-itinerary'))
    setSuggestion(plan)
    setSaved(false)
    setStatus('Your route idea is ready. Adjust any option to explore another version.')
  }

  const showItineraryOnMap = () => {
    // Ask the map to display the generated stops and bring that panel into view.
    if (!suggestion) return
    window.dispatchEvent(new CustomEvent('ceylon:show-itinerary', {
      detail: { names: suggestion.stops.map(({ name }) => name) },
    }))
    document.getElementById('destination-map-panel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    setStatus('Your suggested stops are shown on the map.')
  }

  const savePlan = () => {
    // Save the current plan in this browser without sending it to a server.
    if (!suggestion) return
    try {
      localStorage.setItem(savedPlanKey, JSON.stringify({
        version: 1,
        ...suggestion,
        trip,
      }))
      setSaved(true)
      setHasSavedPlan(true)
      setStatus('Trip saved in this browser on this device.')
    } catch {
      setStatus('Could not save in this browser. Download your trip instead.')
    }
  }

  const downloadPlan = () => {
    // Create a local text file so the visitor can keep the plan outside the site.
    if (!suggestion) return
    const file = new Blob([formatItinerary(suggestion)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ceylon-sri-lanka-trip.txt'
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus('Your trip idea has been downloaded.')
  }

  const copyPlan = async () => {
    // Use the browser clipboard when available and report permission failures clearly.
    if (!suggestion) return
    try {
      await navigator.clipboard.writeText(formatItinerary(suggestion))
      setStatus('Trip idea copied to your clipboard.')
    } catch {
      setStatus('Clipboard access is unavailable. Download the trip idea instead.')
    }
  }

  const clearSavedPlan = () => {
    // Remove only this application's saved plan from browser storage.
    try {
      localStorage.removeItem(savedPlanKey)
      setSaved(false)
      setHasSavedPlan(false)
      setStatus('Saved trip removed from this browser.')
    } catch {
      setStatus('Could not remove the saved trip in this browser.')
    }
  }

  return (
    <section className="trip-planner" id="plan">
      <div className="planner-intro">
        <p className="eyebrow">Your island story starts here</p>
        <h2>Make room for<br /><em>the unexpected.</em></h2>
        <p>
          A few details are all it takes to start picturing your Sri Lanka.
          Choose what feels right — you can always change the plan.
        </p>
        <div className="planner-note">
          <span className="planner-note-mark" aria-hidden="true">✳</span>
          <span>The east and south coasts are planned separately to avoid rushed cross-island transfers.</span>
        </div>
      </div>

      <form className="planner-form" onSubmit={createItinerary}>
        {/* Controlled fields keep the generated itinerary synchronized with user choices. */}
        <div className="planner-form-heading">
          <span className="eyebrow">01 — Shape your journey</span>
          <span className="planner-step">A good place to begin</span>
        </div>
        <div className="planner-fields">
          <label className="planner-field">
            <span>When would you like to go?</span>
            <input
              type="date"
              name="startDate"
              min={todayAsInputValue()}
              value={trip.startDate}
              onChange={updateTrip}
            />
          </label>
          <label className="planner-field">
            <span>How long?</span>
            <select name="days" value={trip.days} onChange={updateTrip}>
              <option value="3">A long weekend · 3 days</option>
              <option value="5">A little escape · 5 days</option>
              <option value="7">The classic trip · 7 days</option>
              <option value="10">Take your time · 10 days</option>
              <option value="14">The grand tour · 14 days</option>
            </select>
          </label>
          <label className="planner-field">
            <span>Who is coming?</span>
            <select name="travelers" value={trip.travelers} onChange={updateTrip}>
              <option value="1">Just me</option>
              <option value="2">Two travelers</option>
              <option value="3">Three travelers</option>
              <option value="4">Four travelers</option>
              <option value="5">Five or more</option>
            </select>
          </label>
          <label className="planner-field">
            <span>What are you drawn to?</span>
            <select name="interest" value={trip.interest} onChange={updateTrip}>
              {interestOptions.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          {trip.interest === 'Coast' && (
            <label className="planner-field">
              <span>Which coastline?</span>
              <select name="coast" value={trip.coast} onChange={updateTrip}>
                {tripOptions.coasts.map((coast) => (
                  <option key={coast}>{coast}</option>
                ))}
              </select>
            </label>
          )}
          <label className="planner-field">
            <span>Your travel rhythm</span>
            <select name="pace" value={trip.pace} onChange={updateTrip}>
              {tripOptions.paces.map((pace) => <option key={pace}>{pace}</option>)}
            </select>
          </label>
          <label className="planner-field">
            <span>Stay style</span>
            <select name="stay" value={trip.stay} onChange={updateTrip}>
              {tripOptions.stays.map((stay) => <option key={stay}>{stay}</option>)}
            </select>
          </label>
        </div>
        <div className="planner-submit-row">
          <p>Your choices stay flexible. This is inspiration, not a booking.</p>
          <button className="button button--dark" type="submit">
            Find my route <ArrowIcon />
          </button>
        </div>

        {suggestion && (
          /* The result area appears only after a valid route has been generated. */
          <div className="itinerary-result" aria-label="Suggested itinerary">
            <div className="itinerary-heading">
              <span className="eyebrow">A first sketch of your trip</span>
              <strong>
                {suggestion.days} days · {suggestion.travelers}{' '}
                {suggestion.travelers === 1 ? 'traveler' : 'travelers'}
              </strong>
            </div>
            <p className="itinerary-date">
              {formatDate(suggestion.startDate)} · {suggestion.pace} pace · {suggestion.stay} stays
            </p>
            <ol className="itinerary-stops">
              {suggestion.stops.map((stop, index) => (
                <li key={stop.name}>
                  <span className="itinerary-stop-number">0{index + 1}</span>
                  <span className="itinerary-stop-detail">
                    <strong>{stop.name}</strong>
                    <small>{stop.days} {stop.days === 1 ? 'day' : 'days'} · {stop.region}</small>
                    <small>{stop.description}</small>
                  </span>
                  <a
                    className="map-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name}, Sri Lanka`)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${stop.name} on Google Maps`}
                  >
                    Map <ArrowIcon diagonal />
                  </a>
                </li>
              ))}
            </ol>
            <p className="itinerary-disclaimer">
              Inspiration only — not a transfer schedule. Check local travel times,
              opening hours, weather and availability before booking.
            </p>
            <div className="itinerary-actions">
              <button className="planner-action" type="button" onClick={showItineraryOnMap}>
                Show route on map
              </button>
              <button className="planner-action" type="button" onClick={savePlan}>
                {saved ? 'Update saved trip' : 'Save on this device'}
              </button>
              <button className="planner-action" type="button" onClick={copyPlan}>
                Copy trip
              </button>
              <button className="planner-action" type="button" onClick={downloadPlan}>
                Download .txt
              </button>
              {hasSavedPlan && (
                <button className="planner-action planner-action--quiet" type="button" onClick={clearSavedPlan}>
                  Remove saved
                </button>
              )}
            </div>
          </div>
        )}
        <p className="planner-status" aria-live="polite">{status}</p>
      </form>
      <span className="planner-deco" aria-hidden="true">ශ්‍රී ලංකා</span>
    </section>
  )
}

export default TripPlanner
