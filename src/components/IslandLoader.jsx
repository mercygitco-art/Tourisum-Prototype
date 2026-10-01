import { useEffect, useRef, useState } from 'react'

const nasaEarthVideo = 'https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005570/Earth_wAtmos_spin_02_1080p60.mp4'
const sriLankaFrameTime = 58

function IslandLoader({ isExiting = false, onArrival }) {
  const arrivalStarted = useRef(false)
  const arrivalTimer = useRef(0)
  const fallbackTimer = useRef(0)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [videoFailed, setVideoFailed] = useState(prefersReducedMotion)
  const [locationLocked, setLocationLocked] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return undefined
    fallbackTimer.current = window.setTimeout(() => {
      if (arrivalStarted.current) return
      arrivalStarted.current = true
      setVideoFailed(true)
      setLocationLocked(true)
      arrivalTimer.current = window.setTimeout(onArrival, 1500)
    }, 18000)

    return () => window.clearTimeout(fallbackTimer.current)
  }, [onArrival, prefersReducedMotion])

  useEffect(() => () => window.clearTimeout(arrivalTimer.current), [])

  const settleOnSriLanka = () => {
    if (arrivalStarted.current) return
    arrivalStarted.current = true
    setLocationLocked(true)
    arrivalTimer.current = window.setTimeout(onArrival, 1500)
  }

  const handleVideoMetadata = (event) => {
    const video = event.currentTarget
    video.playbackRate = 8
    video.play().catch(() => {
      setVideoFailed(true)
      settleOnSriLanka()
    })
  }

  const handleVideoTimeUpdate = (event) => {
    const video = event.currentTarget
    if (video.currentTime >= 55 && video.currentTime < sriLankaFrameTime) {
      video.playbackRate = 1.5
    } else if (video.currentTime >= 48 && video.currentTime < 55) {
      video.playbackRate = 4
    }
    if (video.currentTime < sriLankaFrameTime) return
    video.pause()
    video.currentTime = sriLankaFrameTime
    settleOnSriLanka()
  }

  const handleVideoError = () => {
    setVideoFailed(true)
    settleOnSriLanka()
  }

  return (
    <div
      className={[
        'island-loader',
        isExiting && 'island-loader--exiting',
        videoFailed && 'island-loader--poster',
        locationLocked && 'island-loader--location-locked',
      ].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-label="Arriving in Sri Lanka"
    >
      <div className="loader-earth-frame" aria-hidden="true">
        {!videoFailed && (
          <video
            className="loader-earth-video"
            src={nasaEarthVideo}
            poster="/images/nasa-earth-spin-poster.jpg"
            autoPlay
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={handleVideoMetadata}
            onTimeUpdate={handleVideoTimeUpdate}
            onError={handleVideoError}
          />
        )}
        {videoFailed && (
          <img
            className="loader-earth-poster"
            src="/images/nasa-earth-spin-poster.jpg"
            alt=""
          />
        )}
        <span className="loader-location-lock">
          <span className="loader-location-lock-ring" />
          <span className="loader-location-lock-center" />
        </span>
        <div className="loader-location-copy">
          <span className="loader-location-eyebrow">Target acquired · Earth</span>
          <strong>Sri Lanka</strong>
          <span>7.8731° N&nbsp; 80.7718° E</span>
        </div>
      </div>
      <div className="loader-zoom-flash" aria-hidden="true" />
    </div>
  )
}

export default IslandLoader
