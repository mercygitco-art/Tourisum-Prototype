import { useEffect, useState } from 'react'
import Destinations from './components/Destinations'
import ExperienceSection from './components/ExperienceSection'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import IslandLoader from './components/IslandLoader'
import IslandIntro from './components/IslandIntro'
import TripPlanner from './components/TripPlanner'
import { shouldShowInitialLoader } from './utils/pageLoad'
import './App.css'

function App() {
  const [loaderState, setLoaderState] = useState(() => (
    shouldShowInitialLoader(document.readyState) ? 'loading' : 'hidden'
  ))
  const isLoading = loaderState === 'loading'

  useEffect(() => {
    if (!isLoading) return undefined

    let finished = false
    const finishLoading = () => {
      if (finished) return
      finished = true
      setLoaderState('exiting')
    }
    const handlePageLoad = () => finishLoading()

    if (shouldShowInitialLoader(document.readyState)) {
      window.addEventListener('load', handlePageLoad, { once: true })
    } else {
      finishLoading()
    }

    const fallbackTimer = window.setTimeout(finishLoading, 8000)

    return () => {
      window.clearTimeout(fallbackTimer)
      window.removeEventListener('load', handlePageLoad)
    }
  }, [isLoading])

  useEffect(() => {
    if (loaderState !== 'exiting') return undefined
    const exitTimer = window.setTimeout(() => setLoaderState('hidden'), 300)
    return () => window.clearTimeout(exitTimer)
  }, [loaderState])

  useEffect(() => {
    const updateParallax = () => {
      document.documentElement.style.setProperty(
        '--scroll-offset',
        `${Math.min(window.scrollY * 0.18, 150)}px`,
      )
    }

    updateParallax()
    window.addEventListener('scroll', updateParallax, { passive: true })
    return () => window.removeEventListener('scroll', updateParallax)
  }, [])

  return (
    <>
      {loaderState !== 'hidden' && <IslandLoader isExiting={loaderState === 'exiting'} />}
      <div inert={isLoading} aria-hidden={isLoading}>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header />
        <main id="main-content">
          <Hero />
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
