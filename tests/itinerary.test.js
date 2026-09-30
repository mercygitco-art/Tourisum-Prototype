import assert from 'node:assert/strict'
import test from 'node:test'
import destinations from '../src/data/destinations.js'
import {
  buildItinerary,
  defaultTrip,
  formatItinerary,
  isValidSavedPlan,
} from '../src/utils/itinerary.js'

function trip(overrides = {}) {
  return { ...defaultTrip, ...overrides }
}

test('builds a paced classic route with a day count that matches the trip', () => {
  const stops = buildItinerary(trip())

  assert.deepEqual(stops.map(({ name }) => name), ['Sigiriya', 'Nuwara Eliya', 'Ella'])
  assert.equal(stops.reduce((total, stop) => total + stop.days, 0), 7)
})

test('keeps short trips to one stop and reduces stops for a slow pace', () => {
  assert.equal(buildItinerary(trip({ days: '3' })).length, 1)
  assert.equal(buildItinerary(trip({ days: '7', pace: 'Slow & easy' })).length, 2)
})

test('adds a stop for a fast pace without exceeding destinations on the route', () => {
  const stops = buildItinerary(trip({ days: '7', pace: 'See it all' }))

  assert.equal(stops.length, 4)
  assert.equal(stops.reduce((total, stop) => total + stop.days, 0), 7)
})

test('keeps south and east coast suggestions on separate routes', () => {
  const south = buildItinerary(trip({ interest: 'Coast', coast: 'South coast' }))
  const east = buildItinerary(trip({ interest: 'Coast', coast: 'East coast' }))

  assert.deepEqual(south.map(({ name }) => name), ['Mirissa', 'Galle Fort'])
  assert.deepEqual(east.map(({ name }) => name), ['Arugam Bay', 'Trincomalee'])
})

test('starts from a selected destination without backtracking through earlier stops', () => {
  const route = buildItinerary(trip({ interest: 'Culture' }), 'Galle Fort')

  assert.deepEqual(route.map(({ name }) => name), ['Galle Fort'])
})

test('creates an isolated wildlife suggestion for wildlife-focused trips', () => {
  const route = buildItinerary(trip({ interest: 'Wildlife' }))

  assert.deepEqual(route.map(({ name }) => name), ['Wildlife parks'])
})

test('provides valid map coordinates for every destination', () => {
  assert.ok(destinations.every(({ latitude, longitude }) => (
    Number.isFinite(latitude)
    && latitude >= -90
    && latitude <= 90
    && Number.isFinite(longitude)
    && longitude >= -180
    && longitude <= 180
  )))
})

test('validates a saved suggestion and rejects malformed stops', () => {
  const currentTrip = trip()
  const suggestion = {
    version: 1,
    ...currentTrip,
    days: Number(currentTrip.days),
    travelers: Number(currentTrip.travelers),
    selectedDestination: '',
    stops: buildItinerary(currentTrip),
    startDate: '',
  }
  const savedPlan = { ...suggestion, trip: currentTrip }

  assert.equal(isValidSavedPlan(savedPlan), true)
  assert.equal(
    isValidSavedPlan({ ...savedPlan, stops: [{ name: 'Unknown', days: 7 }] }),
    false,
  )
})

test('exports a route with an explicit planning disclaimer', () => {
  const currentTrip = trip()
  const text = formatItinerary({
    ...currentTrip,
    days: Number(currentTrip.days),
    travelers: Number(currentTrip.travelers),
    stops: buildItinerary(currentTrip),
  })

  assert.match(text, /Sigiriya/)
  assert.match(text, /not a transport itinerary or booking/)
})
