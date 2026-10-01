import { useEffect, useState } from 'react'
import Destinations from './components/Destinations'
import ExperienceSection from './components/ExperienceSection'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import IslandLoader from './components/IslandLoader'
import IslandIntro from './components/IslandIntro'
import TripPlanner from './components/TripPlanner'
import { shouldShowWelcomeSequence } from './utils/pageLoad'
import './App.css'

function App() {
  const [loaderState, setLoaderState] = useState(() => (
    shouldShowWelcomeSequence() ? 'loading' : 'hidden'
  ))
  const [pageReady, setPageReady] = useState(() => document.readyState === 'complete')
  const [welcomeComplete, setWelcomeComplete] = useState(false)
  const isLoading = loaderState !== 'hidden'

  useEffect(() => {
    if (pageReady) return undefined
    if (document.readyState === 'complete') {
      const readyTimer = window.setTimeout(() => setPageReady(true), 0)
      return () => window.clearTimeout(readyTimer)
    }
    const handlePageLoad = () => setPageReady(true)
    window.addEventListener('load', handlePageLoad, { once: true })
    const fallbackTimer = window.setTimeout(handlePageLoad, 8000)

    return () => {
      window.clearTimeout(fallbackTimer)
      window.removeEventListener('load', handlePageLoad)
    }
  }, [pageReady])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const introTimer = window.setTimeout(() => setWelcomeComplete(true), reducedMotion ? 100 : 24000)

    return () => window.clearTimeout(introTimer)
  }, [])

  useEffect(() => {
    if (!isLoading || !pageReady || !welcomeComplete) return
    const exitTimer = window.setTimeout(() => setLoaderState('exiting'), 0)
    return () => window.clearTimeout(exitTimer)
  }, [isLoading, pageReady, welcomeComplete])

  useEffect(() => {
    if (loaderState !== 'exiting') return undefined
    const exitDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 1500
    const exitTimer = window.setTimeout(() => setLoaderState('hidden'), exitDuration)
    return () => window.clearTimeout(exitTimer)
  }, [loaderState])

  useEffect(() => {
    const revealTargets = [...document.querySelectorAll([
      'main > section:not(.hero)',
      '.experience-story-heading',
      '.intro-highlight',
      '.destination-map-panel',
      '.destination-card',
      '.experience-chapter',
      '.planner-form',
    ].join(', '))]
    const motionTargets = [...document.querySelectorAll([
      '.hero-video',
      '.hero-landscape',
      '.hero-content',
      '.destination-card img',
    ].join(', '))]
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let observer
    let motionObserver
    const visibleMotionTargets = new Set()

    const siblingIndexes = new Map()
    if ('IntersectionObserver' in window && !mediaQuery.matches) {
      revealTargets.forEach((element) => {
      const siblingIndex = siblingIndexes.get(element.parentElement) ?? 0
      siblingIndexes.set(element.parentElement, siblingIndex + 1)
      element.dataset.reveal = 'pending'
      element.style.setProperty('--reveal-delay', `${(siblingIndex % 5) * 75}ms`)
      })

      observer = new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return
          target.dataset.reveal = 'visible'
          observer.unobserve(target)
        })
      }, {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
      })
      revealTargets.forEach((element) => observer.observe(element))

      motionObserver = new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (isIntersecting) {
            visibleMotionTargets.add(target)
          } else {
            visibleMotionTargets.delete(target)
            target.style.setProperty('--image-parallax', '0px')
          }
        })
      }, {
        rootMargin: '20% 0px',
      })
      motionTargets.forEach((element) => motionObserver.observe(element))
    }

    const updateScrollMotion = () => {
      frameId = 0
      if (mediaQuery.matches) {
        document.documentElement.style.setProperty('--hero-scroll-y', '0px')
        document.documentElement.style.setProperty('--hero-copy-y', '0px')
        document.documentElement.style.setProperty('--hero-copy-opacity', '1')
        document.documentElement.style.setProperty('--experience-progress', '0')
        motionTargets.forEach((element) => {
          element.style.setProperty('--scroll-rotate-x', '0deg')
          element.style.setProperty('--scroll-rotate-y', '0deg')
          element.style.setProperty('--image-parallax', '0px')
        })
        return
      }

      const viewportHeight = window.innerHeight || 1
      const heroProgress = Math.min(Math.max(window.scrollY / viewportHeight, 0), 1)
      const heroParallax = Math.min(window.scrollY * 0.22, viewportHeight * 0.3)
      document.documentElement.style.setProperty('--hero-scroll-y', `${-heroParallax}px`)
      document.documentElement.style.setProperty('--hero-copy-y', `${window.scrollY * 0.1}px`)
      document.documentElement.style.setProperty('--hero-copy-opacity', `${1 - heroProgress * 0.65}`)

      const experienceScene = document.querySelector('.experience-story')
      if (experienceScene) {
        const sceneBounds = experienceScene.getBoundingClientRect()
        const sceneRange = Math.max(1, sceneBounds.height - viewportHeight)
        const sceneProgress = Math.max(0, Math.min(1, -sceneBounds.top / sceneRange))
        document.documentElement.style.setProperty('--experience-progress', `${sceneProgress}`)
      }

      visibleMotionTargets.forEach((element) => {
        if (element.matches('.hero-video, .hero-landscape, .hero-content')) return
        const bounds = element.getBoundingClientRect()

        const centerOffset = (bounds.top + bounds.height / 2 - viewportHeight / 2) / viewportHeight
        const progress = Math.max(-1, Math.min(1, centerOffset))
        element.style.setProperty('--image-parallax', `${progress * -24}px`)
      })
    }

    const requestScrollMotion = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updateScrollMotion)
    }

    const handleMotionPreferenceChange = () => {
      if (mediaQuery.matches) {
        observer?.disconnect()
        motionObserver?.disconnect()
        visibleMotionTargets.clear()
        revealTargets.forEach((element) => {
          element.dataset.reveal = 'visible'
          element.style.removeProperty('--reveal-delay')
        })
      }
      requestScrollMotion()
    }

    updateScrollMotion()
    window.addEventListener('scroll', requestScrollMotion, { passive: true })
    window.addEventListener('resize', requestScrollMotion)
    mediaQuery.addEventListener('change', handleMotionPreferenceChange)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestScrollMotion)
      window.removeEventListener('resize', requestScrollMotion)
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange)
      observer?.disconnect()
      revealTargets.forEach((element) => {
        delete element.dataset.reveal
        element.style.removeProperty('--reveal-delay')
      })
      motionTargets.forEach((element) => {
        for (const property of [
          '--scroll-rotate-x',
          '--scroll-rotate-y',
          '--scroll-y',
          '--scroll-z',
          '--image-parallax',
          '--scroll-rotate-x',
          '--scroll-rotate-y',
        ]) {
          element.style.removeProperty(property)
        }
      })
      document.documentElement.style.removeProperty('--hero-scroll-y')
      document.documentElement.style.removeProperty('--hero-copy-y')
      document.documentElement.style.removeProperty('--hero-copy-opacity')
      document.documentElement.style.removeProperty('--experience-progress')
    }
  }, [])

  return (
    <>
      {loaderState !== 'hidden' && (
        <IslandLoader
          isExiting={loaderState === 'exiting'}
          onArrival={() => setWelcomeComplete(true)}
        />
      )}
      <div
        className={loaderState === 'exiting' ? 'site-shell site-shell--arriving' : 'site-shell'}
        inert={isLoading}
        aria-hidden={isLoading}
      >
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header />
        <main id="main-content">
          <Hero isActive={!isLoading} />
          <IslandIntro />
          <Destinations />
          <ExperienceSection />
          <TripPlanner />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
