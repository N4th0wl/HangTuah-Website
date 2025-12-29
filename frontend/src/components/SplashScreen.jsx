import { useEffect, useState } from 'react'
import logoImg from '../assets/logo.png'
import '../styles/SplashScreen.css'

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Total animation duration: 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      // Small delay before calling onComplete to allow fade out
      setTimeout(() => {
        onComplete()
      }, 500)
    }, 3500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) {
    return null
  }

  return (
    <div className="splash-screen">
      {/* Background gradient */}
      <div className="splash-background">
        <div className="splash-gradient-1" />
        <div className="splash-gradient-2" />
      </div>

      {/* Animated particles */}
      <div className="splash-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="particle" style={{ '--delay': `${i * 0.1}s` }} />
        ))}
      </div>

      {/* Main content */}
      <div className="splash-content">
        {/* Logo container with animations */}
        <div className="splash-logo-container">
          {/* Outer glow ring */}
          <div className="splash-glow-ring" />
          
          {/* Logo with scale animation */}
          <div className="splash-logo-wrapper">
            <img 
              src={logoImg} 
              alt="Hang Tuah Toastery" 
              className="splash-logo"
            />
          </div>

          {/* Inner pulse ring */}
          <div className="splash-pulse-ring" />
        </div>

        {/* Brand name with staggered animation */}
        <div className="splash-text">
          <h1 className="splash-title">
            <span className="splash-char" style={{ '--char-delay': '0.1s' }}>H</span>
            <span className="splash-char" style={{ '--char-delay': '0.15s' }}>a</span>
            <span className="splash-char" style={{ '--char-delay': '0.2s' }}>n</span>
            <span className="splash-char" style={{ '--char-delay': '0.25s' }}>g</span>
            <span className="splash-char" style={{ '--char-delay': '0.3s' }}> </span>
            <span className="splash-char" style={{ '--char-delay': '0.35s' }}>T</span>
            <span className="splash-char" style={{ '--char-delay': '0.4s' }}>u</span>
            <span className="splash-char" style={{ '--char-delay': '0.45s' }}>a</span>
            <span className="splash-char" style={{ '--char-delay': '0.5s' }}>h</span>
          </h1>
          <p className="splash-subtitle">Toastery</p>
          <p className="splash-tagline">A Sanctuary in the Urban</p>
        </div>

        {/* Loading indicator */}
        <div className="splash-loader">
          <div className="splash-loader-bar" />
        </div>
      </div>

      {/* Fade out overlay */}
      <div className={`splash-overlay ${!isVisible ? 'fade-out' : ''}`} />
    </div>
  )
}
