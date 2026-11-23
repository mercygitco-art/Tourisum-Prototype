import { useState } from 'react'
import ArrowIcon from './ArrowIcon'
import {
  calculateCardTilt,
  dispatchDestinationSelection,
  shouldEnableCardTilt,
} from '../utils/destinationCard'

function DestinationCard({ destination, featured, isFavorite, onToggleFavorite }) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })

  const updateTilt = (event) => {
    const matchMedia = typeof window !== 'undefined' ? window.matchMedia : undefined
    if (!shouldEnableCardTilt(event.pointerType, matchMedia)) return

    const bounds = event.currentTarget.getBoundingClientRect()
    setTilt(calculateCardTilt({
      clientX: event.clientX,
      clientY: event.clientY,
      bounds,
    }))
  }

  const resetTilt = () => setTilt({ rotateX: 0, rotateY: 0 })

  const onFavoriteClick = (event) => {
    // Prevent the favorite control from also activating the card's destination link.
    event.preventDefault()
    event.stopPropagation()
    onToggleFavorite?.(destination.name)
  }

  return (
    <div
      className={featured ? 'destination-card destination-card--featured' : 'destination-card'}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
      style={{
        '--card-rotate-x': `${tilt.rotateX}deg`,
        '--card-rotate-y': `${tilt.rotateY}deg`,
      }}
    >
      <button
        type="button"
        className={isFavorite ? 'destination-favorite-button destination-favorite-button--active' : 'destination-favorite-button'}
        aria-label={isFavorite ? `Remove ${destination.name} from your shortlist` : `Save ${destination.name} to your shortlist`}
        aria-pressed={Boolean(isFavorite)}
        onClick={onFavoriteClick}
      >
        {/* The pressed state communicates whether this destination is shortlisted. */}
        {isFavorite ? '♥' : '♡'}
      </button>
      <a
        className="destination-card-link"
        href="#plan"
        onClick={() => dispatchDestinationSelection(window, destination.name)}
      >
        <img
          src={destination.image}
          alt={destination.alt}
          loading="lazy"
          decoding="async"
        />
        <span className="destination-number">{destination.number}</span>
        <span className="destination-info">
          <span className="destination-region">{destination.region}</span>
          <span className="destination-name">
            {destination.name}<ArrowIcon diagonal />
          </span>
          <span className="destination-description">{destination.description}</span>
        </span>
      </a>
    </div>
  )
}

export default DestinationCard
