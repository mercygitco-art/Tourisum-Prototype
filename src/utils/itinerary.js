import destinations from '../data/destinations.js'

export const tripOptions = {
  days: ['3', '5', '7', '10', '14'],
  travelers: ['1', '2', '3', '4', '5'],
  interests: ['All', 'Culture', 'Highlands', 'Coast', 'Wildlife'],
  paces: ['Slow & easy', 'Balanced', 'See it all'],
  stays: ['Thoughtful value', 'Comfort', 'A little luxury'],
  coasts: ['South coast', 'East coast'],
}

export const defaultTrip = {
  startDate: '',
  days: '7',
  travelers: '2',
  interest: 'All',
  pace: 'Balanced',
  stay: 'Comfort',
  coast: 'South coast',
}

// Select a route, limit its stops according to trip length and pace, then distribute days.
export function buildItinerary(trip, selectedDestination = '') {
  const selectedPlace = destinations.find(({ name }) => name === selectedDestination)
  let stops

  if (selectedPlace) {
    stops = destinations.filter(({ route }) => route === selectedPlace.route)
  } else if (trip.interest === 'All') {
    stops = destinations.filter(({ route }) => route === 'classic')
  } else if (trip.interest === 'Coast') {
    const route = trip.coast === 'East coast' ? 'east' : 'classic'
    stops = destinations.filter((destination) => (
      (
        destination.category === 'Coast'
        || destination.alsoCategories?.includes('Coast')
      ) && destination.route === route
    ))
  } else {
    stops = destinations.filter(({ category }) => category === trip.interest)
  }

  stops.sort((first, second) => first.routeOrder - second.routeOrder)

  if (selectedPlace) {
    const selectedIndex = stops.findIndex(({ name }) => name === selectedPlace.name)
    stops = selectedIndex >= 0 ? stops.slice(selectedIndex) : []
  }

  const days = Number(trip.days)
  const paceAdjustment = trip.pace === 'Slow & easy' ? -1 : trip.pace === 'See it all' ? 1 : 0
  const baseStopCount = days <= 3 ? 1 : days <= 5 ? 2 : days <= 8 ? 3 : days <= 11 ? 4 : 5
  const stopCount = Math.min(stops.length, Math.max(1, baseStopCount + paceAdjustment))
  const dayBalance = Math.floor(days / stopCount)
  const extraDays = days % stopCount

  return stops.slice(0, stopCount).map((destination, index) => ({
    ...destination,
    days: dayBalance + (index < extraDays ? 1 : 0),
  }))
}

export function formatItinerary(plan) {
  // Convert the visual plan into a portable text document with an explicit disclaimer.
  const lines = [
    'CEYLON — A SRI LANKA TRIP IDEA',
    `${plan.days}-day trip for ${plan.travelers} ${plan.travelers === 1 ? 'traveler' : 'travelers'}`,
    `Start date: ${formatTripDate(plan.startDate)}`,
    `Travel pace: ${plan.pace}`,
    `Stay style: ${plan.stay}`,
    '',
    'SUGGESTED STOPS',
    ...plan.stops.flatMap((stop, index) => [
      `${index + 1}. ${stop.name} — ${stop.days} ${stop.days === 1 ? 'day' : 'days'} (${stop.region})`,
      `   ${stop.description}`,
    ]),
    '',
    'This is an inspiration route, not a transport itinerary or booking. Check travel times, opening hours, weather, local guidance and availability before you go.',
  ]

  return lines.join('\n')
}

export function formatTripDate(value) {
  // Format date-only input at midday to avoid timezone-related day shifts.
  if (!value) return 'Dates to be decided'
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

export function isValidSavedPlan(value) {
  // Validate persisted data before using it to restore planner state.
  return Boolean(
    value
    && value.version === 1
    && value.trip
    && tripOptions.days.includes(value.trip.days)
    && tripOptions.travelers.includes(value.trip.travelers)
    && tripOptions.interests.includes(value.trip.interest)
    && tripOptions.paces.includes(value.trip.pace)
    && tripOptions.stays.includes(value.trip.stay)
    && tripOptions.coasts.includes(value.trip.coast)
    && Number(value.days) === Number(value.trip.days)
    && Number(value.travelers) === Number(value.trip.travelers)
    && value.pace === value.trip.pace
    && value.stay === value.trip.stay
    && (
      value.trip.startDate === ''
      || (
        /^\d{4}-\d{2}-\d{2}$/.test(value.trip.startDate)
        && !Number.isNaN(new Date(`${value.trip.startDate}T12:00:00`).getTime())
      )
    )
    && Array.isArray(value.stops)
    && value.stops.length > 0
    && value.stops.every((stop) => (
      Number.isInteger(stop.days)
      && stop.days > 0
      && destinations.some(({ name }) => name === stop.name)
    ))
    && value.stops.reduce((sum, stop) => sum + stop.days, 0) === Number(value.days)
    && (
      value.selectedDestination === ''
      || destinations.some(({ name }) => name === value.selectedDestination)
    )
    && typeof value.startDate === 'string'
  )
}
