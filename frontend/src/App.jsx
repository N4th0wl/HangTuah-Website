import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import bannerImg from './assets/Banner.png'
import logoImg from './assets/logo.png'
import kopiOImg from './assets/kopiO.jpg'
import nasiGorengImg from './assets/nasigoreng.jpeg'
import hangtuahImg from './assets/hangtuah.jpg'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Menu from './pages/Menu'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import Navbar from './components/Navbar'
import WhatsAppBubble from './components/WhatsAppBubble'
import Toast from './components/Toast'
import SplashScreen from './components/SplashScreen'
import { reservationAPI } from './services/api'

const menuHighlights = [
  {
    title: 'Nasi Goreng Istana',
    description: 'Signature fried rice crowned with river prawns and belacan sambal.',
    image: nasiGorengImg,
  },
  {
    title: 'Kopi O Tarik',
    description: 'Hand-pulled dark roast coffee with palm sugar and silky crema.',
    image: kopiOImg,
  },
  {
    title: 'Laksa Singapura',
    description: 'Rich coconut broth, poached lobster, and fresh herbs from our garden.',
    image: bannerImg,
  },
]

const signatureLocations = [
  {
    name: 'The Straits Heritage Pavilion',
    city: 'Kuala Lumpur',
    ambiance: 'Riverfront sunsets & bespoke degustation lounges',
    address: 'Level 21, Straits Heritage Tower, Jalan Tun Sri Lanang',
    image: bannerImg,
  },
  {
    name: 'The Rafflesia Conservatory',
    city: 'Singapore',
    ambiance: 'Colonial winter garden with Peranakan art installations',
    address: '18 Esplanade Row, Heritage District',
    image: nasiGorengImg,
  },
  {
    name: 'Istana Spice Gallery',
    city: 'Penang',
    ambiance: 'Cliffside verandas & nightly gamelan affairs',
    address: '78 Jalan Sultan Ahmad Shah, George Town',
    image: kopiOImg,
  },
]

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeLocation, setActiveLocation] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const [toast, setToast] = useState(null)
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    occasion: '',
    date: '',
    requests: '',
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.dataset.delay) {
              entry.target.style.setProperty('--reveal-delay', entry.target.dataset.delay)
            }
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    const revealElements = document.querySelectorAll('.reveal')
    revealElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      document.documentElement.style.setProperty('--parallax-x', '0px')
      document.documentElement.style.setProperty('--parallax-y', '0px')
      return
    }

    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 20
      const y = (event.clientY / window.innerHeight - 0.5) * 16
      document.documentElement.style.setProperty('--parallax-x', `${x.toFixed(2)}px`)
      document.documentElement.style.setProperty('--parallax-y', `${y.toFixed(2)}px`)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement
      const scrollTop = doc.scrollTop || window.scrollY
      const scrollHeight = doc.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0
      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(3))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isCarouselPaused) return
    const id = window.setInterval(() => {
      setActiveLocation((prev) => (prev + 1) % signatureLocations.length)
    }, 7000)
    return () => window.clearInterval(id)
  }, [isCarouselPaused])

  const goToLocation = (index) => {
    setActiveLocation(index)
  }

  const handleCarouselPause = () => setIsCarouselPaused(true)
  const handleCarouselResume = () => setIsCarouselPaused(false)

  const handleContactFormChange = (e) => {
    const { name, value } = e.target
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContactFormSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Validate required fields
      if (!contactFormData.name || !contactFormData.email || !contactFormData.date) {
        setToast({ message: 'Please fill in all required fields', type: 'error' })
        return
      }

      // Send reservation email
      const response = await reservationAPI.create({
        name: contactFormData.name,
        email: contactFormData.email,
        date: contactFormData.date,
        time: '19:00', // Default time, can be customized
        guests: 2, // Default guests, can be customized
        occasion: contactFormData.occasion,
        requests: contactFormData.requests,
      })

      // Show success toast
      setToast({ message: response.data.message, type: 'success' })

      // Reset form
      setContactFormData({
        name: '',
        email: '',
        occasion: '',
        date: '',
        requests: '',
      })

      // Clear form fields in DOM
      const form = document.querySelector('.contact__form')
      if (form) form.reset()
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send reservation. Please try again.'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  return (
    <Router>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <WhatsAppBubble />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={
    <div className="app">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="main">
        <section id="home" className="hero">
          <div className="hero__motif hero__motif--left" aria-hidden="true" />
          <div className="hero__motif hero__motif--right" aria-hidden="true" />
          <div className="hero__ornament hero__ornament--top" />
          <div className="hero__overlay">
            <div className="hero__content reveal" data-delay="0.2s">
              <p className="hero__eyebrow">Selamat Datang</p>
              <h1 className="hero__title">
                A Luxurious Journey Through the Spice Routes of the South East Asia
              </h1>
              <p className="hero__subtitle">
                Taste the legacy of Straits cuisine crafted with seasonal delicacies,
                curated teas, and rituals of hospitality inspired by the royal courts of SEA.
              </p>
              <div className="hero__actions">
                <a href="#menu" className="btn btn--primary">
                  Explore Menu
                </a>
                <a href="#contact" className="btn btn--outline">
                  Reserve a Table
                </a>
              </div>
            </div>
          </div>
          <div className="hero__ornament hero__ornament--bottom" />
        </section>

        <section id="about" className="section section--about">
          <div className="section__halo section__halo--left" aria-hidden="true" />
          <div className="section__halo section__halo--right" aria-hidden="true" />
          <div className="section__inner">
            <div className="section__header reveal" data-delay="0.1s">
              <span className="section__eyebrow">About Us</span>
              <h2 className="section__title">An Ode to South East Asia Heritage and Modern Luxury</h2>
              <div className="section__divider">
                <span />
                <svg viewBox="0 0 64 16" aria-hidden="true">
                  <path d="M8 8c6-6 18-6 24 0s18 6 24 0" />
                </svg>
                <span />
              </div>
            </div>
            <div className="about__content">
              <div className="about__text reveal" data-delay="0.18s">
                <p>
                  Nestled in the heart of the city, Hang Tuah Toastery evokes the grandeur of
                  South East Asia palaces. Our chefs honor time-honored recipes—from aromatic rendang
                  to delicate kuih—reimagined with contemporary finesse and premium terroir
                  ingredients.
                </p>
                <p>
                  Every evening is choreographed: batik-clad hosts, gamelan melodies,
                  and candlelit tables adorned with songket motifs. We celebrate the
                  opulence of Southeast Asian hospitality in every detail.
                </p>
              </div>
              <div className="about__image reveal" data-delay="0.3s">
                <div className="about__frame">
                  <img src={kopiOImg} alt="Traditional Kopi O" />
                  <div className="about__glow" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="menu" className="section section--menu">
          <div className="section__inner">
            <div className="section__header section__header--center reveal" data-delay="0.1s">
              <span className="section__eyebrow">Explore Menu</span>
              <h2 className="section__title">Chef&rsquo;s Signature Selection</h2>
              <p className="section__subtitle">
                A curated tasting of spice-laden classics, plated with modern artistry and
                paired with bespoke tea infusions.
              </p>
            </div>
            <div className="menu__grid">
              {menuHighlights.map((item, index) => (
                <article
                  className="menu__card reveal"
                  key={item.title}
                  data-delay={`${0.15 * (index + 1)}s`}
                >
                  <div className="menu__image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="menu__content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="menu__callout">
                      100% Recommended
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="menu__cta reveal" data-delay="0.35s">
              <a href="/menu" className="btn btn--primary btn--lg">
                View Full Menu
              </a>
              <p className="menu__cta-note">Preview our full culinary repertoire and seasonal degustation journeys.</p>
            </div>
          </div>
        </section>

        <section id="find-us" className="section section--find">
          <div className="section__inner">
            <div className="find__content">
              <div className="find__info reveal" data-delay="0.14s">
                <span className="section__eyebrow">Find Us</span>
                <h2 className="section__title">A Sanctuary in the Urban</h2>
                <p>
                  Grand kota bintang jalan boulevard, Blk. C Jl. Raya Kalimalang No.1, RW.002, Jakasampurna, Kec. Bekasi Bar., Kota Bks, Jawa Barat 17145
                </p>
                <div className="find__details">
                  <div>
                    <h4>Dining Hours</h4>
                    <p>
                      Mon - Thu: 10.00 AM – 10.00 PM<br />
                      Fri - Sun: 09.00 AM – 10.00 PM
                    </p>
                  </div>
                  <div>
                    <h4>Contact</h4>
                    <p>
                      +62 877 1111 2222<br />
                      admin@hangtuah.com
                    </p>
                  </div>
                </div>
                <a href="#contact" className="btn btn--primary">
                  Arrange Private Dining
                </a>
              </div>
              <div className="find__map reveal" data-delay="0.3s">
                <div className="map__frame">
                  <img 
                    src={hangtuahImg} 
                    alt="Hang Tuah Toastery Branch - Grand Kota Bintang"
                    className="map__image"
                  />
                  <div className="map__card">
                    <h4>Grand Kota Bintang</h4>
                    <p>
                      Overlooking the Urban City, our private courtyards are adorned with
                      lanterns and carved teak screens.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="find__carousel reveal"
              data-delay="0.32s"
              onMouseEnter={handleCarouselPause}
              onMouseLeave={handleCarouselResume}
              onFocus={handleCarouselPause}
              onBlur={handleCarouselResume}
              onTouchStart={handleCarouselPause}
              onTouchEnd={handleCarouselResume}
            >
              <div className="carousel__header">
                <span className="section__eyebrow">Signature Branches</span>
                <h3 className="carousel__title">Discover Our South East Asia Residences</h3>
              </div>
              <div className="carousel__viewport" role="region" aria-roledescription="carousel">
                <div
                  className="carousel__track"
                  style={{ '--active-index': activeLocation, '--carousel-count': signatureLocations.length }}
                  aria-live="polite"
                >
                  {signatureLocations.map((location, index) => {
                    const isActive = index === activeLocation
                    return (
                      <article
                        key={location.name}
                        className={`carousel__slide ${isActive ? 'is-active' : ''}`}
                        aria-hidden={!isActive}
                      >
                        <div className="carousel__media">
                          <img src={location.image} alt={location.name} />
                          <div className="carousel__veil" />
                        </div>
                        <div className="carousel__content">
                          <p className="carousel__city">{location.city}</p>
                          <h4>{location.name}</h4>
                          <p className="carousel__ambiance">{location.ambiance}</p>
                          <p className="carousel__address">{location.address}</p>
                        </div>
                      </article>
                    )
                  })}
                </div>
                <div className="carousel__controls" aria-label="Carousel controls">
                  <button
                    type="button"
                    className="carousel__control carousel__control--prev"
                    onClick={() => goToLocation((activeLocation - 1 + signatureLocations.length) % signatureLocations.length)}
                    aria-label="Previous location"
                  />
                  <button
                    type="button"
                    className="carousel__control carousel__control--next"
                    onClick={() => goToLocation((activeLocation + 1) % signatureLocations.length)}
                    aria-label="Next location"
                  />
                </div>
              </div>
              <div className="carousel__dots" role="tablist" aria-label="Select location">
                {signatureLocations.map((location, index) => (
                  <button
                    key={location.name}
                    type="button"
                    className={`carousel__dot ${index === activeLocation ? 'is-active' : ''}`}
                    onClick={() => goToLocation(index)}
                    aria-label={`View ${location.name} in ${location.city}`}
                    aria-selected={index === activeLocation}
                    role="tab"
                  >
                    <span />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section section--contact">
          <div className="section__inner reveal" data-delay="0.12s">
            <div className="section__header section__header--center" data-delay="0.18s">
              <span className="section__eyebrow">Contact</span>
              <h2 className="section__title">Reserve Your Experience</h2>
              <p className="section__subtitle">
                Share your dining preferences and our concierge will curate an evening tailored
                to your celebration.
              </p>
            </div>
            <form className="contact__form" data-delay="0.28s" onSubmit={handleContactFormSubmit}>
              <div className="form__row">
                <label>
                  Full Name
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Your name"
                    value={contactFormData.name}
                    onChange={handleContactFormChange}
                    required
                  />
                </label>
                <label>
                  Email Address
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="you@example.com"
                    value={contactFormData.email}
                    onChange={handleContactFormChange}
                    required
                  />
                </label>
              </div>
              <div className="form__row">
                <label>
                  Occasion
                  <input 
                    type="text" 
                    name="occasion" 
                    placeholder="Anniversary, business dinner..."
                    value={contactFormData.occasion}
                    onChange={handleContactFormChange}
                  />
                </label>
                <label>
                  Preferred Date
                  <input 
                    type="date" 
                    name="date"
                    value={contactFormData.date}
                    onChange={handleContactFormChange}
                    required
                  />
                </label>
              </div>
              <label className="form__full">
                Special Requests
                <textarea 
                  name="requests" 
                  rows="4" 
                  placeholder="Dietary requirements, seating preferences, live music..."
                  value={contactFormData.requests}
                  onChange={handleContactFormChange}
                />
              </label>
              <button type="submit" className="btn btn--primary btn--full">
                Submit Request
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__halo" aria-hidden="true" />
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__brand-mark">
              <img src={logoImg} alt="Hang Tuah Toastery" />
            </div>
            <div className="footer__brand-copy">
              <h3>Hang Tuah Toastery</h3>
              <p>
                A sanctuary of Malayan luxury where spice routes, river breezes, and refined
                hospitality entwine for unforgettable evenings.
              </p>
            </div>
          </div>

          <div className="footer__grid">
            <div className="footer__card">
              <h4>Visit Our Flagship</h4>
              <p>
                Level 21, Straits Heritage Tower<br />
                Jalan Tun Sri Lanang, Kuala Lumpur
              </p>
            </div>
            <div className="footer__card">
              <h4>Reservations</h4>
              <a href="tel:+60378901234">+60 3-7890 1234</a>
              <a href="mailto:reservations@hangtuah.dine">reservations@hangtuah.dine</a>
              <p className="footer__note">Concierge available daily 10.00am – 11.00pm</p>
            </div>
            <div className="footer__card footer__card--social">
              <h4>Follow Hang Tuah</h4>
              <div className="footer__social-links">
                <button
                  type="button"
                  className="footer__social-link"
                  onClick={() => window.open('https://www.instagram.com/hangtuahdining', '_blank', 'noopener')}
                >
                  <span aria-hidden="true" className="footer__social-icon">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm6.2-.9a1.1 1.1 0 1 0-2.2 0 1.1 1.1 0 0 0 2.2 0ZM12 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
                    </svg>
                  </span>
                  <span>Instagram</span>
                </button>
                <button
                  type="button"
                  className="footer__social-link"
                  onClick={() => window.open('https://www.facebook.com/hangtuahdining', '_blank', 'noopener')}
                >
                  <span aria-hidden="true" className="footer__social-icon">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path d="M13.5 9H15V6h-1.5C11.57 6 11 7.57 11 9v2H9v3h2v6h3v-6h2.14L16 11h-3z" />
                    </svg>
                  </span>
                  <span>Facebook</span>
                </button>
                <button
                  type="button"
                  className="footer__social-link"
                  onClick={() => window.open('https://www.tiktok.com/@hangtuahdining', '_blank', 'noopener')}
                >
                  <span aria-hidden="true" className="footer__social-icon">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path d="M16.5 3c.27 1.53 1.39 2.74 3 2.96v3.13c-.97.09-1.9-.14-3-.63v5.74a5.8 5.8 0 1 1-5.94-5.79v3.17a2.09 2.09 0 1 0 1.5 2v-9.4c1.06.79 2.02 1.25 3.44 1.29z" />
                    </svg>
                  </span>
                  <span>TikTok</span>
                </button>
              </div>
            </div>
          </div>

          <div className="footer__divider" aria-hidden="true" />

          <div className="footer__bottom">
            <p>
              © {new Date().getFullYear()} Hang Tuah Toastery. Crafted in homage to the rich tapestry
              of South East Asia heritage.
            </p>
            <nav className="footer__nav">
              <a href="#home">Home</a>
              <a href="#menu">Menu</a>
              <a href="#contact">Reserve</a>
              <a href="#find-us">Locations</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
