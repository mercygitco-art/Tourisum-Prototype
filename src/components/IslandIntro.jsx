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
      <div className="intro-mark" aria-hidden="true">ශ්‍රී ලංකා</div>
    </section>
  )
}

export default IslandIntro
