import { useEffect, useMemo, useState } from 'react'
import destinations from '../data/destinations'
import ArrowIcon from './ArrowIcon'
import DestinationCard from './DestinationCard'
import DestinationMap from './DestinationMap'

const favoriteStorageKey = 'ceylon-favorite-destinations-v1'

function Destinations() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recommended')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(favoriteStorageKey)
      const parsed = stored ? JSON.parse(stored) : []
      if (!Array.isArray(parsed)) return []
      return parsed.filter((name) => destinations.some((destination) => destination.name === name))
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(favoriteStorageKey, JSON.stringify(favorites))
    } catch {
      // Ignore storage issues so the experience still works without persistence.
    }
  }, [favorites])

  const filters = ['All', ...new Set(destinations.map(({ category }) => category))]

  const visibleDestinations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const next = destinations.filter(({ category, alsoCategories, name, region, description }) => {
      const matchesFilter = activeFilter === 'All'
        ? true
        : category === activeFilter || alsoCategories?.includes(activeFilter)

      const matchesSearch = !query || [name, region, category, description].join(' ').toLowerCase().includes(query)
      const matchesFavorites = !showFavoritesOnly || favorites.includes(name)

      return matchesFilter && matchesSearch && matchesFavorites
    })

    return [...next].sort((first, second) => {
      switch (sortBy) {
        case 'name':
          return first.name.localeCompare(second.name)
        case 'region':
          return first.region.localeCompare(second.region) || first.name.localeCompare(second.name)
        case 'category':
          return first.category.localeCompare(second.category) || first.name.localeCompare(second.name)
        default:
          return (first.routeOrder ?? Number.MAX_SAFE_INTEGER) - (second.routeOrder ?? Number.MAX_SAFE_INTEGER)
      }
    })
  }, [activeFilter, favorites, searchQuery, showFavoritesOnly, sortBy])

  const toggleFavorite = (name) => {
    setFavorites((currentFavorites) => (
      currentFavorites.includes(name)
        ? currentFavorites.filter((favorite) => favorite !== name)
        : [...currentFavorites, name]
    ))
  }

  const resetFilters = () => {
    setActiveFilter('All')
    setSearchQuery('')
    setSortBy('recommended')
    setShowFavoritesOnly(false)
  }

  return (
    <section className="destinations section-wrap" id="destinations">
      <div className="section-heading">
        <div>
          <p className="eyebrow">The island, your way</p>
          <h2>Places that <em>stay with you.</em></h2>
        </div>
        <a className="text-link" href="#plan">
          View all destinations <ArrowIcon />
        </a>
      </div>

      <div className="destination-toolbar">
        <div className="destination-toolbar-main">
          <div className="filter-list" role="group" aria-label="Filter destinations">
            {filters.map((filter) => (
              <button
                className={activeFilter === filter ? 'filter-chip filter-chip--active' : 'filter-chip'}
                type="button"
                aria-pressed={activeFilter === filter}
                key={filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="destination-controls">
            <label className="destination-search" htmlFor="destination-search">
              <span className="visually-hidden">Search destinations</span>
              <input
                id="destination-search"
                type="search"
                placeholder="Search places, regions, vibes"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className="destination-sort" htmlFor="destination-sort">
              <span>Sort</span>
              <select id="destination-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="name">Name</option>
                <option value="region">Region</option>
                <option value="category">Category</option>
              </select>
            </label>
          </div>
        </div>

        <div className="destination-toolbar-actions">
          <button
            className={showFavoritesOnly ? 'map-control map-control--active' : 'map-control'}
            type="button"
            onClick={() => setShowFavoritesOnly((currentState) => !currentState)}
          >
            {showFavoritesOnly ? 'Showing shortlist' : 'Shortlist only'}
          </button>
          {(activeFilter !== 'All' || searchQuery || showFavoritesOnly) && (
            <button type="button" className="map-control" onClick={resetFilters}>
              Reset
            </button>
          )}
          <span className="destination-count" aria-live="polite">
            Showing {visibleDestinations.length} {visibleDestinations.length === 1 ? 'place' : 'places'}
          </span>
        </div>
      </div>

      <div className="destination-insights" aria-label="Trip planning insights">
        <div className="destination-insight">
          <span>Curated picks</span>
          <strong>{visibleDestinations.length}</strong>
        </div>
        <div className="destination-insight">
          <span>Shortlist</span>
          <strong>{favorites.length}</strong>
        </div>
        <div className="destination-insight">
          <span>Filter</span>
          <strong>{activeFilter === 'All' ? 'All' : activeFilter}</strong>
        </div>
      </div>

      <div className="destination-map-panel" id="destination-map-panel">
        <div className="destination-map-heading">
          <div>
            <p className="eyebrow">The island, in the palm of your hand</p>
            <h3>Find your way to <em>somewhere wonderful.</em></h3>
          </div>
          <p>Explore each region, then shape a trip around the places that call to you.</p>
        </div>
        <DestinationMap destinations={visibleDestinations} />
        <div className="destination-map-legend" aria-label="Map marker categories">
          <span><i className="map-legend-dot map-legend-dot--culture" />Culture</span>
          <span><i className="map-legend-dot map-legend-dot--highlands" />Highlands</span>
          <span><i className="map-legend-dot map-legend-dot--coast" />Coast</span>
          <span><i className="map-legend-dot map-legend-dot--wildlife" />Wildlife</span>
          <span className="map-legend-route"><i />Suggested route</span>
        </div>
        <p className="destination-map-note">
          Place pins are approximate. Dashed itinerary lines connect stops directly
          and are not roads or navigation directions. Location is requested only
          when you choose it and is not saved by this site. Map tiles are provided by OpenStreetMap.
        </p>
      </div>

      {visibleDestinations.length === 0 ? (
        <div className="destination-empty" role="status">
          <h3>No places match that search yet.</h3>
          <p>Try a different keyword or reset the filters to explore the whole island again.</p>
          <button type="button" className="map-control" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="destination-grid">
          {visibleDestinations.map((destination) => (
            <DestinationCard
              destination={destination}
              key={destination.name}
              isFavorite={favorites.includes(destination.name)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Destinations
