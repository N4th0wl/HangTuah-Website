import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Navbar from '../components/Navbar'
import { authAPI } from '../services/api'
import '../styles/SignUp.css'

const calculatePasswordStrength = (pwd) => {
  let strength = 0
  const checks = {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
  }

  Object.values(checks).forEach((check) => {
    if (check) strength++
  })

  if (strength <= 1) return { level: 'weak', score: 1, label: 'Weak' }
  if (strength <= 2) return { level: 'fair', score: 2, label: 'Fair' }
  if (strength <= 3) return { level: 'good', score: 3, label: 'Good' }
  if (strength <= 4) return { level: 'strong', score: 4, label: 'Strong' }
  return { level: 'very-strong', score: 5, label: 'Very Strong' }
}

export default function SignUp() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const passwordStrength = calculatePasswordStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (!username || !email || !password || !confirmPassword) {
        setError('All fields are required')
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        setIsLoading(false)
        return
      }

      // Call register API
      await authAPI.register({ username, email, password })

      setSuccess('Account created successfully! Redirecting to login...')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'SignUp failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <div className="signup__background" aria-hidden="true" />
      <div className="signup__motif signup__motif--left" aria-hidden="true" />
      <div className="signup__motif signup__motif--right" aria-hidden="true" />

      <div className="signup__content reveal" data-delay="0.2s">
        <div className="signup__header">
          <h1 className="signup__title">Join Hang Tuah</h1>
          <p className="signup__subtitle">Create your account to access exclusive dining experiences</p>
        </div>

        <form className="signup__form" onSubmit={handleSubmit}>
          <div className="form__group">
            <label htmlFor="username" className="form__label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form__input"
              placeholder="Choose your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form__group">
            <label htmlFor="email" className="form__label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form__input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form__group">
            <label htmlFor="password" className="form__label">
              Password
            </label>
            <div className="form__input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form__input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="form__toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="password-strength">
              <div className="strength-bars">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`strength-bar ${bar <= passwordStrength.score ? `strength-${passwordStrength.level}` : ''}`}
                  />
                ))}
              </div>
              {password && (
                <span className={`strength-label strength-${passwordStrength.level}`}>
                  {passwordStrength.label}
                </span>
              )}
            </div>
            <p className="form__hint">At least 8 characters, mix uppercase, lowercase, numbers, and symbols</p>
          </div>

          <div className="form__group">
            <label htmlFor="confirmPassword" className="form__label">
              Confirm Password
            </label>
            <div className="form__input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form__input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="form__toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="form__error">{error}</div>}
          {success && <div className="form__success">{success}</div>}

          <button type="submit" className="btn btn--primary btn--lg signup__button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup__footer">
          <p>
            Already have an account?{' '}
            <a href="/login" className="signup__link">
              Sign In
            </a>
          </p>
          <p>
            <a href="/" className="signup__link">
              Back to Home
            </a>
          </p>
        </div>
      </div>

        <div className="signup__ornament signup__ornament--top" aria-hidden="true" />
        <div className="signup__ornament signup__ornament--bottom" aria-hidden="true" />
      </div>
    </>
  )
}
