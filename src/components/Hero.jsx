import { useEffect, useRef, useState } from 'react'
import ArrowIcon from './ArrowIcon'
import destinations from '../data/destinations'

const HERO_POSTER =
  '/images/sri-lanka-hero-poster.jpg'
const HERO_VIDEO = '/sri-lanka-hero.mp4'

function Hero({ isActive = true }) {
  const videoRef = useRef(null)
  const heroRef = useRef(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')

  const [earliestDate] = useState(() => {
    const today = new Date()
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
    return today.toISOString().slice(0, 10)
  })

  const startPlanning = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const destination = formData.get('destination')

    window.dispatchEvent(new CustomEvent('ceylon:select-destination', {
      detail: {
        name: destination,
        startDate: formData.get('startDate'),
        travelers: formData.get('travelers'),
      },
    }))
    setSearchMessage('Your preferences are ready. Let’s shape your island trip.')
    document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let isInView = true
    const syncVideoMotion = () => {
      const video = videoRef.current
      if (!video) return

      if (!isActive || mediaQuery.matches || document.hidden || !isInView) {
        video.pause()
      } else {
        video.play().catch(() => {
          setVideoFailed(true)
        })
      }
    }

    syncVideoMotion()
    const observer = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting
      syncVideoMotion()
    }, { threshold: 0.01 })
    if (heroRef.current) observer.observe(heroRef.current)
    document.addEventListener('visibilitychange', syncVideoMotion)
    mediaQuery.addEventListener('change', syncVideoMotion)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncVideoMotion)
      mediaQuery.removeEventListener('change', syncVideoMotion)
    }
  }, [isActive])

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
      ref={heroRef}
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
        <p className="eyebrow eyebrow--light"><span /> Your island escape starts here</p>
        <h1 id="hero-title">
          <span className="hero-title-line"><span>Find your kind</span></span>
          <span className="hero-title-line hero-title-line--accent"><span><em>of wonderful.</em></span></span>
        </h1>
        <p className="hero-copy">
          Ancient wonders, wild coastlines and tea-country trails. Discover Sri Lanka
          at your own pace, with a journey made just for you.
        </p>
        <a className="button button--light" href="#destinations">
          Explore destinations <ArrowIcon />
        </a>
      </div>
      <div className="hero-side-note"><span>06°55&apos; N</span> · <span>79°51&apos; E</span></div>
      <div className="hero-scroll"><span /> Scroll to discover</div>
      <div className="hero-stamp" aria-hidden="true">
        <span className="stamp-top">ISLAND LIFE</span>
        <span className="stamp-center">ශ්‍රී<br />ලංකා</span>
        <span className="stamp-bottom">A JOURNEY TO REMEMBER</span>
      </div>
      <form className="hero-search" onSubmit={startPlanning}>
        <label className="hero-search-field">
          <span>Where to?</span>
          <select name="destination" defaultValue="">
            <option value="">Surprise me</option>
            {destinations.map(({ name, region }) => (
              <option value={name} key={name}>{name} · {region}</option>
            ))}
          </select>
        </label>
        <label className="hero-search-field">
          <span>When?</span>
          <input type="date" name="startDate" min={earliestDate} aria-label="Travel date" />
        </label>
        <label className="hero-search-field">
          <span>Travelers</span>
          <select name="travelers" defaultValue="2">
            <option value="1">1 traveler</option>
            <option value="2">2 travelers</option>
            <option value="3">3 travelers</option>
            <option value="4">4 travelers</option>
            <option value="5">5+ travelers</option>
          </select>
        </label>
        <button className="hero-search-submit" type="submit">
          Plan my trip <ArrowIcon />
        </button>
        <p className="hero-search-status" aria-live="polite">{searchMessage}</p>
      </form>
    </section>
  )
}

export default Hero
