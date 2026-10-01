import ArrowIcon from './ArrowIcon'

function IslandIntro() {
  return (
    <section className="intro section-wrap" id="story">
      <div className="intro-label">
        <span className="eyebrow">Ayubowan — may you live long</span>
        <span className="vertical-rule" />
      </div>
      <div className="intro-copy">
        <h2>Small in size.<br /><em>Infinite in feeling.</em></h2>
        <p>
          Sri Lanka is a world of its own. Wake to birdsong in the highlands,
          follow ancient paths through the jungle, then watch the sun melt into
          the Indian Ocean. It is all closer than you think.
        </p>
        <a className="text-link" href="#experiences">
          Get to know our island <ArrowIcon />
        </a>
      </div>
      <div className="intro-highlights" aria-label="Why travel with Ceylon">
        <article className="intro-highlight">
          <span className="value-icon value-icon--heritage" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M12 48h40M17 43h30M21 38h22M25 33h14M29 28h6" />
              <path d="M13 49V37l8-8 8 8v-9l8-8 8 8v21M46 36h5v13" />
              <path d="M9 53h46" />
            </svg>
          </span>
          <span><i>01</i><strong>Stories in every stone</strong><small>Ancient places, alive with history.</small></span>
        </article>
        <article className="intro-highlight">
          <span className="value-icon value-icon--highlands" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="m8 47 17-23 10 13 7-9 14 19H8Z" />
              <path d="M17 47c2-5 5-5 7 0m4 0c2-6 5-6 7 0m5 0c2-5 5-5 7 0" />
              <path d="M13 53h39M20 18c4-4 8-4 12 0m5-6c5-4 10-4 15 0" />
            </svg>
          </span>
          <span><i>02</i><strong>Room to slow down</strong><small>Take the scenic way through tea country.</small></span>
        </article>
        <article className="intro-highlight">
          <span className="value-icon value-icon--island" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M8 42c7-6 13-6 20 0s13 6 20 0 10-5 13-3M8 50c7-6 13-6 20 0s13 6 20 0 10-5 13-3" />
              <path d="M40 39V19m0 2c-5-8-11-8-14-7 2 6 7 9 14 8Zm1 0c4-9 10-10 14-9-1 6-6 10-14 10Z" />
            </svg>
          </span>
          <span><i>03</i><strong>Made for your kind of trip</strong><small>Local insight, thoughtful itineraries.</small></span>
        </article>
      </div>
    </section>
  )
}

export default IslandIntro
