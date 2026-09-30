import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import allDestinations from '../data/destinations'

const mapCenter = [7.8731, 80.7718]

function selectDestination(name) {
  window.dispatchEvent(new CustomEvent('ceylon:select-destination', {
    detail: { name },
  }))
}

function DestinationMap({ destinations }) {
  const mapElement = useRef(null)
  const map = useRef(null)
  const markers = useRef(null)
  const itineraryLayer = useRef(null)
  const userLayer = useRef(null)
  const [routeNames, setRouteNames] = useState([])
  const [mapStatus, setMapStatus] = useState('')

  useEffect(() => {
    if (!mapElement.current) return undefined

    const instance = L.map(mapElement.current, {
      scrollWheelZoom: false,
    }).setView(mapCenter, 7)
    map.current = instance
    markers.current = L.featureGroup().addTo(instance)
    itineraryLayer.current = L.featureGroup().addTo(instance)
    userLayer.current = L.featureGroup().addTo(instance)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(instance)

    instance.whenReady(() => instance.invalidateSize())

    return () => {
      instance.remove()
      map.current = null
      markers.current = null
      itineraryLayer.current = null
      userLayer.current = null
    }
  }, [])

  useEffect(() => {
    const showItinerary = (event) => {
      const names = event.detail?.names
      if (!Array.isArray(names)) return

      const validNames = names.filter((name) => (
        allDestinations.some((destination) => destination.name === name)
      ))
      if (!validNames.length) return

      setRouteNames(validNames)
      setMapStatus(`Showing ${validNames.length} suggested ${validNames.length === 1 ? 'stop' : 'stops'}.`)
    }
    const clearItinerary = () => {
      setRouteNames([])
      setMapStatus('Showing all destination pins.')
    }

    window.addEventListener('ceylon:show-itinerary', showItinerary)
    window.addEventListener('ceylon:clear-itinerary', clearItinerary)
    return () => {
      window.removeEventListener('ceylon:show-itinerary', showItinerary)
      window.removeEventListener('ceylon:clear-itinerary', clearItinerary)
    }
  }, [])

  useEffect(() => {
    const mapMarkers = markers.current
    const instance = map.current
    if (!mapMarkers || !instance) return

    mapMarkers.clearLayers()
    destinations.forEach((destination) => {
      const categoryClass = destination.category.toLowerCase().replace(/\s+/g, '-')
      const markerIcon = L.divIcon({
        className: 'destination-map-marker-wrap',
        html: `<span class="destination-map-marker destination-map-marker--${categoryClass}" aria-hidden="true"></span>`,
        iconSize: [28, 34],
        iconAnchor: [14, 30],
      })
      const marker = L.marker([destination.latitude, destination.longitude], {
        icon: markerIcon,
        title: destination.mapLabel ?? destination.name,
        alt: `Map location: ${destination.mapLabel ?? destination.name}`,
      })
      const popup = document.createElement('div')
      const title = document.createElement('strong')
      title.textContent = destination.mapLabel ?? destination.name
      popup.append(title)

      const region = document.createElement('p')
      region.textContent = destination.mapNote ?? destination.region
      popup.append(region)

      const planLink = document.createElement('a')
      planLink.href = '#plan'
      planLink.textContent = 'Plan a trip here'
      planLink.addEventListener('click', () => selectDestination(destination.name))
      popup.append(planLink)

      marker.bindPopup(popup).addTo(mapMarkers)
    })

    if (destinations.length > 1) {
      instance.fitBounds(mapMarkers.getBounds(), { padding: [30, 30], maxZoom: 8 })
    } else if (destinations.length === 1) {
      instance.setView(
        [destinations[0].latitude, destinations[0].longitude],
        8,
      )
    } else {
      instance.setView(mapCenter, 7)
    }
  }, [destinations])

  useEffect(() => {
    const instance = map.current
    const layer = itineraryLayer.current
    if (!instance || !layer) return

    layer.clearLayers()
    if (!routeNames.length) return

    const stops = routeNames
      .map((name) => allDestinations.find((destination) => destination.name === name))
      .filter(Boolean)
    const points = stops.map(({ latitude, longitude }) => [latitude, longitude])

    if (points.length > 1) {
      L.polyline(points, {
        color: '#173d32',
        weight: 3,
        opacity: 0.8,
        dashArray: '7 8',
      }).addTo(layer)
    }

    stops.forEach((destination, index) => {
      const numberedIcon = L.divIcon({
        className: 'itinerary-map-marker-wrap',
        html: `<span class="itinerary-map-marker">${index + 1}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })
      const marker = L.marker(
        [destination.latitude, destination.longitude],
        { icon: numberedIcon, title: `Stop ${index + 1}: ${destination.mapLabel ?? destination.name}` },
      )
      const popup = document.createElement('div')
      const title = document.createElement('strong')
      title.textContent = `Stop ${index + 1}: ${destination.mapLabel ?? destination.name}`
      popup.append(title)
      marker.bindPopup(popup).addTo(layer)
    })

    const bounds = layer.getBounds()
    if (bounds.isValid()) {
      instance.fitBounds(bounds, { padding: [45, 45], maxZoom: 8 })
    }
  }, [routeNames])

  const showMyLocation = () => {
    if (!navigator.geolocation) {
      setMapStatus('Location is not available in this browser.')
      return
    }

    setMapStatus('Requesting your location from the browser…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const instance = map.current
        const layer = userLayer.current
        if (!instance || !layer) return

        layer.clearLayers()
        const point = [coords.latitude, coords.longitude]
        L.circle(point, {
          radius: coords.accuracy,
          color: '#41695a',
          fillColor: '#83aa94',
          fillOpacity: 0.16,
          weight: 1,
        }).addTo(layer)
        L.circleMarker(point, {
          radius: 7,
          color: '#fff',
          weight: 3,
          fillColor: '#41695a',
          fillOpacity: 1,
        }).bindPopup('Your current location (from this browser)').addTo(layer)
        instance.setView(point, 10)
        setMapStatus('Your location is shown on this map only; it is not saved or shared by this site.')
      },
      (error) => {
        const messages = {
          1: 'Location permission was denied. You can enable it in your browser settings.',
          2: 'Your location could not be determined. Try again when location services are available.',
          3: 'The location request timed out. Please try again.',
        }
        setMapStatus(messages[error.code] ?? 'Could not get your location. Please try again.')
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    )
  }

  const clearItinerary = () => {
    window.dispatchEvent(new Event('ceylon:clear-itinerary'))
  }

  return (
    <div className="destination-map-wrap">
      <div className="destination-map-tools">
        <p className="destination-map-status" aria-live="polite">
          {mapStatus || (routeNames.length
            ? `Suggested route: ${routeNames.join(' → ')}`
            : 'Showing destination pins across the island.')}
        </p>
        <div className="destination-map-buttons">
          {routeNames.length > 0 && (
            <button className="map-control" type="button" onClick={clearItinerary}>
              Clear route
            </button>
          )}
          <button className="map-control" type="button" onClick={showMyLocation}>
            Use my location
          </button>
        </div>
      </div>
      <div
        ref={mapElement}
        className="destination-map"
        role="region"
        aria-label={`Interactive map showing ${destinations.length} Sri Lanka destinations`}
      />
      {routeNames.length > 0 && (
        <p className="destination-map-route">
          Route order: {routeNames.join(' → ')}
        </p>
      )}
    </div>
  )
}

export default DestinationMap
