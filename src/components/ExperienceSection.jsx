import ArrowIcon from './ArrowIcon'

function ExperienceSection() {
  return (
    <section className="experience" id="experiences">
      <div
        className="experience-image"
        role="img"
        aria-label="Tea fields in Sri Lanka's hill country"
      />
      <div className="experience-panel">
        <p className="eyebrow eyebrow--light">Take the scenic route</p>
        <h2>Let the journey<br />be the <em>destination.</em></h2>
        <p>
          Ride the train through emerald tea country. Take the long way to the
          beach. Say yes to one more cup of tea. The best moments here are
          rarely the ones you planned.
        </p>
        <a className="button button--outline" href="#plan">
          Find your experience <ArrowIcon />
        </a>
        <span className="experience-coordinate">
          HILL COUNTRY · 1,889 M ABOVE SEA LEVEL
        </span>
      </div>
      <div className="experience-number" aria-hidden="true">02</div>
    </section>
  )
}

export default ExperienceSection
