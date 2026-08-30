import { useState, useEffect, useRef } from 'react'
import './App.css'

// Courier list for the dropdown — Ship24 slugs
const COURIERS = [
  { key: '', name: 'Auto-detect / Not sure', country: '' },
  { key: 'delhivery', name: 'Delhivery', country: 'IN' },
  { key: 'bluedart', name: 'Blue Dart', country: 'IN' },
  { key: 'dtdc', name: 'DTDC', country: 'IN' },
  { key: 'ekart', name: 'Ekart Logistics', country: 'IN' },
  { key: 'xpressbees', name: 'Xpressbees', country: 'IN' },
  { key: 'indiapost', name: 'India Post', country: 'IN' },
  { key: 'fedex', name: 'FedEx', country: 'US' },
  { key: 'dhl', name: 'DHL', country: 'DE' },
  { key: 'ups', name: 'UPS', country: 'US' },
]

// Convert 2-letter ISO to flag emoji
function isoToFlag(iso) {
  if (!iso || iso.length !== 2) return '📦'
  const codePoints = [...iso.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

function App() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [selectedCourier, setSelectedCourier] = useState('')
  const [courierOpen, setCourierOpen] = useState(false)
  const [courierSearch, setCourierSearch] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [theme, setTheme] = useState('light')
  const dropdownRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCourierOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleTrack() {
    if (!trackingNumber.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setShowResults(true)

    try {
      let url = `${import.meta.env.VITE_API_URL}/api/track?tracking_number=${encodeURIComponent(trackingNumber.trim())}`
      if (selectedCourier) {
        url += `&carrier_code=${encodeURIComponent(selectedCourier)}`
      }
      const response = await fetch(url)
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error (${response.status})`)
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setTrackingNumber('')
    setSelectedCourier('')
    setResult(null)
    setError(null)
    setShowResults(false)
  }

  // Find the index of the current (most recent, done) step
  const currentIndex = result?.steps
    ? result.steps.reduce((acc, step, i) => (step.done ? i : acc), -1)
    : -1

  // Determine status pill class based on status_tag
  function getStatusPillClass(tag) {
    switch (tag) {
      case 'delivered': return 'status-pill status-delivered'
      case 'transit': return 'status-pill status-transit'
      case 'info': return 'status-pill status-info'
      case 'awaiting': return 'status-pill status-awaiting'
      case 'exception': return 'status-pill status-exception'
      case 'error': return 'status-pill status-exception'
      case 'not_found': return 'status-pill status-exception'
      default: return 'status-pill'
    }
  }

  // Is this a state where data is not yet available?
  const isAwaiting = result?.status_tag === 'awaiting'
  const isNotFound = result?.status_tag === 'not_found'
  const isError = result?.status_tag === 'error'
  const hasMessage = !!result?.message

  // Filtered courier list for dropdown search
  const filteredCouriers = COURIERS.filter(c =>
    c.name.toLowerCase().includes(courierSearch.toLowerCase())
  )

  // Display text for selected courier
  const selectedCourierObj = COURIERS.find(c => c.key === selectedCourier)
  const courierDisplayText = selectedCourierObj?.key
    ? selectedCourierObj.name
    : 'Courier (optional — improves accuracy)'

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

            {/* ─── COURIER DROPDOWN ─── */}
            <div className="tracking-input-area">
              <div className="courier-dropdown-wrap" ref={dropdownRef}>
                <button
                  type="button"
                  className="courier-dropdown-trigger"
                  onClick={() => { setCourierOpen(o => !o); setCourierSearch('') }}
                  aria-expanded={courierOpen}
                  aria-haspopup="listbox"
                >
                  <svg className="truck-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <span className={`courier-dropdown-text ${selectedCourier ? 'selected' : ''}`}>
                    {courierDisplayText}
                  </span>
                  <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: courierOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {courierOpen && (
                  <div className="courier-dropdown-menu">
                    <div className="courier-dropdown-search">
                      <input
                        type="text"
                        placeholder="Search courier…"
                        value={courierSearch}
                        onChange={(e) => setCourierSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="courier-dropdown-list" role="listbox">
                      {filteredCouriers.map(c => (
                        <div
                          key={c.key}
                          role="option"
                          aria-selected={selectedCourier === c.key}
                          className={`courier-dropdown-item ${selectedCourier === c.key ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedCourier(c.key)
                            setCourierOpen(false)
                          }}
                        >
                          <span className="flag">{c.country ? isoToFlag(c.country) : '🔍'}</span>
                          <span className="item-name">{c.name}</span>
                          {selectedCourier === c.key && (
                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      ))}
                      {filteredCouriers.length === 0 && (
                        <div className="dropdown-empty">No couriers found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                <p className="loading-hint">This may take up to a minute for new shipments</p>
              </div>
            )}

            {error && <p className="status-text error">{error}</p>}

            {result && (
              <div className="result">
                <div className="result-head">
                  <div className="oid">Tracking number</div>
                  <h2>{trackingNumber}</h2>
                  {result.courier_name && (
                    <div className="selected-courier-badge">
                      <span className="badge-name">{result.courier_name}</span>
                    </div>
                  )}
                  <div className={getStatusPillClass(result.status_tag)}>
                    <span className="dot" />
                    {result.status}
                  </div>
                </div>

                {/* ─── AWAITING / NOT FOUND / ERROR MESSAGE ─── */}
                {hasMessage && (isAwaiting || isNotFound || isError) && (
                  <div className={`tracking-message ${result.status_tag}`}>
                    <div className="tracking-message-icon">
                      {isAwaiting && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      )}
                      {isNotFound && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                      )}
                      {isError && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      )}
                    </div>
                    <p>{result.message}</p>
                  </div>
                )}

                {/* ─── TIMELINE (only if we have steps with some done) ─── */}
                {!isError && !isNotFound && (
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
                          <p>
                            {step.done
                              ? (step.timestamp
                                  ? new Date(step.timestamp).toLocaleString('en-IN', {
                                      dateStyle: 'medium',
                                      timeStyle: 'short',
                                    })
                                  : 'Completed')
                              : '—'}
                          </p>
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
                )}

                <div className="result-actions">
                  {(isAwaiting || isNotFound) && (
                    <button className="btn-refresh" onClick={handleTrack} disabled={loading}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      {loading ? 'Refreshing…' : 'Refresh status'}
                    </button>
                  )}
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