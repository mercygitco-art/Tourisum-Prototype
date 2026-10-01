import { useState } from 'react'
import ArrowIcon from './ArrowIcon'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Ceylon home" onClick={closeMenu}>
        CEYLON<span>.</span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
      </button>
      <nav
        className={menuOpen ? 'main-nav main-nav--open' : 'main-nav'}
        id="main-navigation"
        aria-label="Main navigation"
      >
        <a href="#destinations" onClick={closeMenu}>Destinations</a>
        <a href="#experiences" onClick={closeMenu}>Experiences</a>
        <a href="#story" onClick={closeMenu}>Our story</a>
      </nav>
      <a className="header-cta" href="#plan">
        Plan your tour <ArrowIcon diagonal />
      </a>
    </header>
  )
}

export default Header
