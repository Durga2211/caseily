import { useState, useEffect, useRef } from 'react'
import './App.css'

// Convert 2-letter ISO to flag emoji
function isoToFlag(iso) {
  if (!iso || iso.length !== 2) return '📦'
  const codePoints = [...iso.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

function App() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  async function handleTrack() {
    if (!trackingNumber.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setShowResults(true)

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/track?tracking_number=${trackingNumber.trim()}`
      const response = await fetch(url)
      const data = await response.json()
      setResult(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setTrackingNumber('')
    setResult(null)
    setError(null)
    setShowResults(false)
  }

  // Find the index of the current (most recent, done) step
  const currentIndex = result?.steps
    ? result.steps.reduce((acc, step, i) => (step.done ? i : acc), -1)
    : -1

  return (
    <div className="app-wrapper">
      {/* ─── NAVBAR ─── */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/c-logo.png" alt="C Logo" className="c-logo" />
          <span className="navbar-brand">Caseily</span>
          <svg className="security-badge" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#007aff"/>
            <path d="M9 12L11 14L15 10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="theme-toggle" 
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <a href="https://wa.me/919987759591" target="_blank" rel="noopener noreferrer" className="navbar-track">Contact us</a>
        </div>
      </nav>

      {/* ─── MAIN CONTENT ─── */}
      <main className="main-content">
        {/* ─── TRACKING CARD ─── */}
        <div className="tracking-card">
          <div className="tracking-card-inner">
            <span className="order-tracking-label">ORDER TRACKING</span>

            <h1 className="tracking-heading">
              Where's your order?<br />
              Track your happiness.<br />
              We're on it.
            </h1>

            <p className="tracking-subtitle">
              Enter your tracking number below to see your<br className="br-desktop" />
              live delivery status
            </p>

            {/* ─── TRACKING INPUT ─── */}
            <div className="tracking-input-area">
              <input
                type="text"
                className="tracking-number-input"
                placeholder="Enter your tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              />

            </div>

            {/* ─── TRACK BUTTON ─── */}
            <div className="tracking-input-area">
              <button
                className="track-now-btn"
                onClick={handleTrack}
                disabled={loading || !trackingNumber.trim()}
              >
                {loading ? (
                  <div className="spinner-small white" />
                ) : (
                  'Track now'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── RESULTS ─── */}
        {showResults && (
          <div className="results-section">
            {loading && (
              <div className="loading-container">
                <div className="spinner" />
                <p>Fetching tracking info…</p>
              </div>
            )}

            {error && <p className="status-text error">{error}</p>}

            {result && (
              <div className="result">
                <div className="result-head">
                  <div className="oid">Tracking number</div>
                  <h2>{trackingNumber}</h2>
                  <div className="status-pill">
                    <span className="dot" />
                    {result.status}
                  </div>
                </div>

                <div className="timeline">
                  {result.steps?.map((step, i) => {
                    const stepIcons = {
                      "Order Placed": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
                      "In Transit": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
                      "Out For Delivery": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
                      "Delivered": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    };
                    return (
                      <div
                        key={i}
                        className={`tl-step ${step.done ? '' : 'pending'} ${i === currentIndex ? 'current' : ''}`}
                        style={{ animationDelay: `${i * 0.15}s` }}
                      >
                        <div className="tl-step-header">
                          {stepIcons[step.label]}
                          <h3>{step.label}</h3>
                        </div>
                        <p>{step.timestamp ? step.timestamp : 'Pending'}</p>
                        {step.location && (
                          <p className="step-location">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'middle'}}>
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {step.location}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="result-actions">
                  <button className="btn-track-another" onClick={handleReset}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Track another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PROMO BANNER ─── */}
        <a href="https://www.instagram.com/caseilyplusstore/" target="_blank" rel="noopener noreferrer" className="promo-banner-container">
          <img src="/promo-banner.jpg" alt="Raksha Bandhan Caseilyplus" className="promo-banner-image" />
        </a>
      </main>

      <footer>© {new Date().getFullYear()} Caseily · All rights reserved</footer>
    </div>
  )
}

export default App