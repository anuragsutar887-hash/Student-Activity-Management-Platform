import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContextValue.js'
import ITPulseLogo from '../components/ITPulseLogo.jsx'
import './auth/Login.css'

const dashboardPaths = {
  student: '/student/dashboard',
  staff: '/staff/dashboard',
  admin: '/admin/dashboard',
}

export default function Landing() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // If already logged in, immediately land directly on dashboard
  if (currentUser) {
    const destination = dashboardPaths[String(currentUser.role).toLowerCase()] || '/student/dashboard'
    return <Navigate to={destination} replace />
  }

  const [fading, setFading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing IT Department Portal...')

  useEffect(() => {
    const totalDuration = 5000 // Exact 5 seconds
    const startTime = Date.now()

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100))
      setProgress(currentProgress)

      if (currentProgress < 25) {
        setStatusText('Initializing IT Department Student Portal...')
      } else if (currentProgress < 55) {
        setStatusText('Loading Activity Verification & Achievement Records...')
      } else if (currentProgress < 85) {
        setStatusText('Synchronizing IT Student Portfolios...')
      } else if (currentProgress < 100) {
        setStatusText('Finalizing Portal Setup...')
      } else {
        setStatusText('Ready! Welcome to IT Pulse')
      }

      if (elapsed >= totalDuration) {
        window.clearInterval(interval)
      }
    }, 40)

    const fadeTimer = window.setTimeout(() => {
      setFading(true)
    }, 4600)

    const redirectTimer = window.setTimeout(() => {
      navigate('/login', { replace: true })
    }, 5000)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(redirectTimer)
    }
  }, [navigate])

  return (
    <main className={`itpulse-splash ${fading ? 'itpulse-splash-fade' : ''}`} aria-label="IT Pulse loading screen">
      <div className="itpulse-splash-orb itpulse-splash-orb-one" aria-hidden="true" />
      <div className="itpulse-splash-orb itpulse-splash-orb-two" aria-hidden="true" />
      <section className="itpulse-splash-content" aria-live="polite">
        {/* Department Logo (Properly clipped Circular Emblem with Neon Halo) */}
        <div className="itpulse-logo-stage mb-2 flex items-center justify-center">
          <div className="itpulse-logo-halo" aria-hidden="true" />
          <ITPulseLogo
            size={130}
            shape="circle"
            className="itpulse-logo-img hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Animated "IT Pulse" Title with Glowing Neon Reveal & Pulse Wave */}
        <div className="itpulse-title-stage">
          <h1 className="itpulse-title-main" aria-label="IT Pulse">
            <span className="itpulse-text-it">IT</span>
            <span className="itpulse-text-space">&nbsp;</span>
            <span className="itpulse-text-pulse">Pulse</span>
          </h1>

          {/* Animated Neon ECG Pulse Wave Line */}
          <div className="itpulse-wave-wrap" aria-hidden="true">
            <svg viewBox="0 0 240 24" className="itpulse-wave-svg" fill="none">
              <path
                d="M0 12 L75 12 L87 12 L96 3 L106 21 L115 5 L123 16 L130 12 L240 12"
                stroke="url(#itpulse-wave-grad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="itpulse-wave-path"
              />
              <defs>
                <linearGradient id="itpulse-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00D2FF" />
                  <stop offset="35%" stopColor="#818CF8" />
                  <stop offset="70%" stopColor="#E879F9" />
                  <stop offset="100%" stopColor="#00F5A0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Properly Aligned Department and Platform Brand Information */}
        <div className="itpulse-brand-info">
          <p className="itpulse-dept-label">
            DEPARTMENT OF INFORMATION TECHNOLOGY
          </p>
          <h2 className="itpulse-platform-title">
            Student Activity &amp; Achievement Platform
          </h2>
          <p className="itpulse-tagline">
            <span>TRACK</span>
            <span className="itpulse-bullet">•</span>
            <span>VERIFY</span>
            <span className="itpulse-bullet">•</span>
            <span>GROW</span>
          </p>
        </div>

        {/* 5-Second Smooth Loading Progress Bar */}
        <div className="itpulse-progress-container">
          <div className="itpulse-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="itpulse-loading-status flex items-center gap-2">
          <span>{statusText}</span>
          <span className="font-bold text-white/90">({progress}%)</span>
        </p>
      </section>
    </main>
  )
}
