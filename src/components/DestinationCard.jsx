import ArrowIcon from './ArrowIcon'

function DestinationCard({ destination, isFavorite, onToggleFavorite }) {
  const updateTilt = (event) => {
    if (
      event.pointerType !== 'mouse'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    event.currentTarget.style.setProperty('--card-rotate-x', `${y * -7}deg`)
    event.currentTarget.style.setProperty('--card-rotate-y', `${x * 7}deg`)
  }

  const resetTilt = (event) => {
    event.currentTarget.style.setProperty('--card-rotate-x', '0deg')
    event.currentTarget.style.setProperty('--card-rotate-y', '0deg')
  }

  const onFavoriteClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    onToggleFavorite?.(destination.name)
  }

  return (
    <div
      className="destination-card"
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
    >
      <button
        type="button"
        className={isFavorite ? 'destination-favorite-button destination-favorite-button--active' : 'destination-favorite-button'}
        aria-label={isFavorite ? `Remove ${destination.name} from your shortlist` : `Save ${destination.name} to your shortlist`}
        aria-pressed={Boolean(isFavorite)}
        onClick={onFavoriteClick}
      >
        {isFavorite ? '♥' : '♡'}
      </button>
      <a
        className="destination-card-link"
        href="#plan"
        onClick={() => window.dispatchEvent(new CustomEvent('ceylon:select-destination', {
          detail: { name: destination.name },
        }))}
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
