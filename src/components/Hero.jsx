import { useEffect, useRef, useState } from 'react'
import ArrowIcon from './ArrowIcon'

const HERO_POSTER =
  '/images/sri-lanka-hero-poster.jpg'
const HERO_VIDEO = '/sri-lanka-hero.mp4'

function Hero() {
  const videoRef = useRef(null)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncVideoMotion = () => {
      const video = videoRef.current
      if (!video) return

      if (mediaQuery.matches) {
        video.pause()
      } else {
        video.play().catch(() => {
          setVideoFailed(true)
        })
      }
    }

    syncVideoMotion()
    mediaQuery.addEventListener('change', syncVideoMotion)
    return () => mediaQuery.removeEventListener('change', syncVideoMotion)
  }, [])

  const updateTilt = (event) => {
    if (
      event.pointerType !== 'mouse'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    event.currentTarget.style.setProperty('--pointer-x', `${x * 3}deg`)
    event.currentTarget.style.setProperty('--pointer-y', `${y * -3}deg`)
  }

  const resetTilt = (event) => {
    event.currentTarget.style.setProperty('--pointer-x', '0deg')
    event.currentTarget.style.setProperty('--pointer-y', '0deg')
  }

  return (
    <section
      className="hero"
      id="home"
      aria-labelledby="hero-title"
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
    >
      <div
        className={videoFailed ? 'hero-landscape hero-landscape--visible' : 'hero-landscape'}
        aria-hidden="true"
      />
      {!videoFailed && (
        <video
          ref={videoRef}
          className="hero-video"
          poster={HERO_POSTER}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onError={() => setVideoFailed(true)}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      )}
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow eyebrow--light"><span /> The island of serendipity</p>
        <h1 id="hero-title">A little island.<br /><em>A lot of wonder.</em></h1>
        <p className="hero-copy">
          Find your own kind of magic in Sri Lanka — where misty mountains meet
          turquoise seas, and every journey has a story.
        </p>
        <a className="button button--light" href="#destinations">
          Explore the island <ArrowIcon />
        </a>
      </div>
      <div className="hero-side-note"><span>06°55&apos; N</span> · <span>79°51&apos; E</span></div>
      <div className="hero-scroll"><span /> Scroll to discover</div>
      <div className="hero-stamp" aria-hidden="true">
        <span className="stamp-top">ISLAND LIFE</span>
        <span className="stamp-center">ශ්‍රී<br />ලංකා</span>
        <span className="stamp-bottom">A JOURNEY TO REMEMBER</span>
      </div>
    </section>
  )
}

export default Hero
