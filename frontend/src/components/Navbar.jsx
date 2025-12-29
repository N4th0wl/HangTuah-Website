import { useState, useEffect } from 'react'
import { LogOut, User } from 'lucide-react'
import logoImg from '../assets/logo.png'
import '../styles/Navbar.css'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#about', label: 'About Us' },
  { href: '/#menu', label: 'Explore Menu' },
  { href: '/#find-us', label: 'Find Us' },
  { href: '/#contact', label: 'Contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState(null)

  // Check if user is logged in
  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      if (token && username) {
        setUser({ username })
      } else {
        setUser(null)
      }
    }

    checkUser()

    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', checkUser)
    
    // Custom event for same-tab updates
    window.addEventListener('userLoggedIn', checkUser)
    window.addEventListener('userLoggedOut', checkUser)

    return () => {
      window.removeEventListener('storage', checkUser)
      window.removeEventListener('userLoggedIn', checkUser)
      window.removeEventListener('userLoggedOut', checkUser)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 16)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleNavClick = () => setMenuOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setUser(null)
    
    // Dispatch custom event to notify about logout
    window.dispatchEvent(new Event('userLoggedOut'))
    
    window.location.href = '/'
  }

  return (
    <header className={`navbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <a href="/" className="navbar__brand" onClick={handleNavClick}>
        <img src={logoImg} alt="Hang Tuah Toastery" className="navbar__logo" />
        <div className="navbar__title">
          <span className="navbar__name">Hang Tuah Toastery</span>
          <span className="navbar__tagline">South East Asia Cuisine</span>
        </div>
      </a>
      <nav className={`navbar__links ${menuOpen ? 'is-open' : ''}`}>
        {navLinks.map(({ href, label }) => (
          <a key={href} href={href} onClick={handleNavClick}>
            {label}
          </a>
        ))}
        {user ? (
          <div className="navbar__user-section">
            <a href="/profile" className="navbar__user-info" onClick={handleNavClick} title="Go to profile">
              <User size={20} />
              <span className="navbar__username">{user.username}</span>
            </a>
            <button
              className="navbar__logout-btn"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="navbar__logout-text">Logout</span>
            </button>
          </div>
        ) : (
          <a href="/login" className="btn btn--primary btn--sm" onClick={handleNavClick}>
            Login
          </a>
        )}
      </nav>
      <button
        className={`navbar__toggle ${menuOpen ? 'is-open' : ''}`}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  )
}
