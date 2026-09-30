function IslandLoader({ isExiting = false }) {
  return (
    <div
      className={isExiting ? 'island-loader island-loader--exiting' : 'island-loader'}
      role="status"
      aria-live="polite"
      aria-label="Loading Ceylon"
    >
      <div className="island-loader-scene" aria-hidden="true">
        <div className="island-loader-sun" />
        <div className="island-loader-orbit island-loader-orbit--outer" />
        <div className="island-loader-orbit island-loader-orbit--inner" />
        <div className="island-loader-island">
          <div className="island-loader-island-top">
            <span className="island-loader-peak island-loader-peak--back" />
            <span className="island-loader-peak island-loader-peak--front" />
            <span className="island-loader-palm island-loader-palm--one" />
            <span className="island-loader-palm island-loader-palm--two" />
            <span className="island-loader-sea" />
          </div>
          <div className="island-loader-island-side" />
          <div className="island-loader-island-shadow" />
        </div>
      </div>
      <div className="island-loader-copy">
        <p className="island-loader-eyebrow">A little island. A lot of wonder.</p>
        <p className="island-loader-wordmark">CEYLON<span>.</span></p>
        <p className="island-loader-message">Finding your way to somewhere wonderful</p>
        <div className="island-loader-progress" aria-hidden="true"><span /></div>
      </div>
    </div>
  )
}

export default IslandLoader
