import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Navbar from '../components/Navbar'
import { authAPI } from '../services/api'
import '../styles/Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      const response = await authAPI.login({ email, password })
      const { token, user } = response.data.data

      // Save token, username, and role to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('username', user.username)
      localStorage.setItem('role', user.role)

      // Dispatch custom event to notify Navbar
      window.dispatchEvent(new Event('userLoggedIn'))

      // Redirect based on role
      if (user.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login__background" aria-hidden="true" />
        <div className="login__motif login__motif--left" aria-hidden="true" />
        <div className="login__motif login__motif--right" aria-hidden="true" />

      <div className="login__content reveal" data-delay="0.2s">
        <div className="login__header">
          <h1 className="login__title">Welcome Back</h1>
          <p className="login__subtitle">Sign in to your Hang Tuah Toastery account</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
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
          </div>

          {error && <div className="form__error">{error}</div>}

          <button type="submit" className="btn btn--primary btn--lg login__button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login__footer">
          <p>
            Don&rsquo;t have an account?{' '}
            <a href="/signup" className="login__link">
              Create one
            </a>
          </p>
          <p>
            <a href="/" className="login__link">
              Back to Home
            </a>
          </p>
        </div>
      </div>

        <div className="login__ornament login__ornament--top" aria-hidden="true" />
        <div className="login__ornament login__ornament--bottom" aria-hidden="true" />
      </div>
    </>
  )
}
