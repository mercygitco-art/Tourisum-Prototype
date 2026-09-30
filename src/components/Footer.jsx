import destinations from '../data/destinations'

function Footer() {
  return (
    <footer className="site-footer">
      <a className="wordmark wordmark--footer" href="#home">
        CEYLON<span>.</span>
      </a>
      <p>A thousand journeys. One beautiful island.</p>
      <details className="photo-credits">
        <summary>Photo credits</summary>
        <ul>
          {destinations.filter(({ source }) => source).map((destination) => (
            <li key={destination.name}>
              <a href={destination.source} target="_blank" rel="noreferrer">
                {destination.creditTitle}
              </a>
              {' '}by {destination.creator},{' '}
              <a href={destination.licenseUrl} target="_blank" rel="noreferrer">
                {destination.license}
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://www.pexels.com/video/tropical-beach-and-waves-in-sea-at-sunset-sri-lanka-12597385/"
              target="_blank"
              rel="noreferrer"
            >
              Sri Lanka sunset video via Pexels
            </a>
            {' '}under the{' '}
            <a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">
              Pexels License
            </a>
          </li>
          <li>
            <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">
              Tea-country photography via Unsplash, used under the Unsplash License
            </a>
          </li>
        </ul>
      </details>
      <span>© 2026 Ceylon Travel</span>
    </footer>
  )
}

export default Footer
