import { useState, useEffect, useRef } from 'react'
import './App.css'

// ─── DATA ───────────────────────────────────────────────────────────────
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

const REVIEWS_B2B = [
  { tag: 'E-commerce brand', stars: 5, quote: 'We plugged Caseily tracking into our Shopify store and "where is my order?" tickets dropped by 60% in the first month. Customers love the live status page.', name: 'Renu Thakkar', role: 'Founder, StyleCraft Co.', color: '#f97316' },
  { tag: 'Logistics partner', stars: 5, quote: 'Handling 3,000+ AWBs daily across Delhivery and BlueDart — Caseily normalises all the scan events into one clean timeline. Our ops dashboard finally makes sense.', name: 'Arjun Mehta', role: 'Ops Lead, QuickShip 3PL', color: '#14b8a6' },
  { tag: 'D2C brand', stars: 4, quote: 'Our customers used to call us every day asking about their orders. Now they just check the tracking page. Onboarding was seamless — took less than an afternoon.', name: 'Priya Sharma', role: 'Head of CX, GlowBox', color: '#3b82f6' },
]

const REVIEWS_B2C = [
  { tag: 'Verified buyer', stars: 5, quote: "Got my phone case delivered in 3 days! The tracking page showed every step — from warehouse to my doorstep. So much better than checking the courier's janky site.", name: 'Sneha R.', role: 'Mumbai, MH', color: '#14b8a6' },
  { tag: 'Verified buyer', stars: 5, quote: "Love how I can see the exact location of my package. Got a notification when it was out for delivery. The case itself is gorgeous too — perfect fit on my iPhone.", name: 'Karthik V.', role: 'Bangalore, KA', color: '#f97316' },
  { tag: 'Verified buyer', stars: 4, quote: "Ordered a custom case and was anxious about delivery time. The live tracker calmed my nerves — I could see it moving across the country. Great experience overall!", name: 'Anjali P.', role: 'Delhi, DL', color: '#3b82f6' },
]

const BLOGS = [
  { category: 'Product', title: 'How we built real-time tracking for 10+ carriers', excerpt: 'A behind-the-scenes look at integrating Ship24, normalising scan events, and making every courier speak the same language.', time: '6 min read', date: 'Aug 28', gradient: 'gradient-1' },
  { category: 'Guide', title: '5 tips to reduce "Where is my order?" support tickets', excerpt: 'From embedding tracking pages to proactive WhatsApp notifications — practical strategies for any e-commerce brand.', time: '4 min read', date: 'Aug 15', gradient: 'gradient-2' },
  { category: 'Case study', title: 'How StyleCraft cut support costs by 60%', excerpt: 'A Shopify brand shipping 5,000 orders/month shares their journey from carrier chaos to a single tracking dashboard.', time: '8 min read', date: 'Aug 02', gradient: 'gradient-3' },
]

const FAQS = [
  { q: 'How does live tracking actually work?', a: "Caseily connects to carrier scan feeds through Ship24's API and normalises every event — pickup, hub scan, customs, out for delivery — into one clean timeline, updated as soon as the carrier reports it." },
  { q: 'Which carriers are supported?', a: 'We support 1,000+ carriers worldwide including Delhivery, BlueDart, DTDC, Ekart, Xpressbees, India Post, FedEx, DHL, UPS, and many more. Select your courier from the dropdown for best results.' },
  { q: 'Do you offer an API for businesses?', a: 'Yes! Our tracking API lets you embed real-time tracking into your own website or app. Contact us on WhatsApp for API access and integration support.' },
  { q: 'What if my package shows no updates?', a: 'Some carriers take a few hours to report the first scan. Try selecting your courier from the dropdown and refreshing. If it still shows no data, the carrier may not have scanned the package yet.' },
  { q: 'Is there a cost for shoppers?', a: 'No — tracking your order on Caseily is completely free for shoppers. Just enter your tracking number and go.' },
  { q: 'How can I get notified about my delivery?', a: 'Join our WhatsApp community to get delivery tips and support. We are working on automatic delivery notifications — stay tuned!' },
]

// ─── HELPERS ────────────────────────────────────────────────────────────
function isoToFlag(iso) {
  if (!iso || iso.length !== 2) return '📦'
  const codePoints = [...iso.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

function Stars({ count }) {
  return (
    <div className="review-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i}>{i <= count ? '★' : '☆'}</span>
      ))}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════
// APP
// ═════════════════════════════════════════════════════════════════════════
function App() {
  // ─── Tracking state ───────────────────────────────────────────────────
  const [trackingNumber, setTrackingNumber] = useState('')
  const [selectedCourier, setSelectedCourier] = useState('')
  const [courierOpen, setCourierOpen] = useState(false)
  const [courierSearch, setCourierSearch] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showResults, setShowResults] = useState(false)

  // ─── UI state ─────────────────────────────────────────────────────────
  const [theme, setTheme] = useState('light')
  const [reviewTab, setReviewTab] = useState('b2b')
  const [openFaq, setOpenFaq] = useState(0)
  const [activeSection, setActiveSection] = useState('track')
  const dropdownRef = useRef(null)

  // ─── Dropdown outside-click ───────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCourierOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ─── Theme side effect ────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // ─── Scroll spy for mobile nav ────────────────────────────────────────
  useEffect(() => {
    const sections = ['track', 'reviews', 'blog', 'community', 'faq']
    function onScroll() {
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ─── Tracking handlers ────────────────────────────────────────────────
  async function handleTrack() {
    if (!trackingNumber.trim()) return
    setLoading(true); setError(null); setResult(null); setShowResults(true)
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/track?tracking_number=${encodeURIComponent(trackingNumber.trim())}`
      if (selectedCourier) url += `&carrier_code=${encodeURIComponent(selectedCourier)}`
      const response = await fetch(url)
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error (${response.status})`)
      }
      setResult(await response.json())
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setTrackingNumber(''); setSelectedCourier(''); setResult(null); setError(null); setShowResults(false)
  }

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ─── Derived state ────────────────────────────────────────────────────
  const currentIndex = result?.steps
    ? result.steps.reduce((acc, step, i) => (step.done ? i : acc), -1) : -1

  function getStatusPillClass(tag) {
    const map = { delivered: 'status-delivered', transit: 'status-transit', info: 'status-info', awaiting: 'status-awaiting', exception: 'status-exception', error: 'status-exception', not_found: 'status-exception' }
    return `status-pill ${map[tag] || ''}`
  }

  const isAwaiting = result?.status_tag === 'awaiting'
  const isNotFound = result?.status_tag === 'not_found'
  const isError = result?.status_tag === 'error'
  const hasMessage = !!result?.message
  const filteredCouriers = COURIERS.filter(c => c.name.toLowerCase().includes(courierSearch.toLowerCase()))
  const selectedCourierObj = COURIERS.find(c => c.key === selectedCourier)
  const courierDisplayText = selectedCourierObj?.key ? selectedCourierObj.name : 'Courier (optional — improves accuracy)'
  const activeReviews = reviewTab === 'b2b' ? REVIEWS_B2B : REVIEWS_B2C

  // ═════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="app-wrapper">

      {/* ─── NAVBAR ─── */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/c-logo.png" alt="Caseily" className="c-logo" />
          <span className="navbar-brand">Caseily</span>
          <svg className="security-badge" viewBox="0 0 24 24" fill="none"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#f97316"/><path d="M9 12L11 14L15 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="navbar-links">
          {['track','reviews','blog','community','faq'].map(id => (
            <button key={id} className={`navbar-link ${activeSection === id ? 'active' : ''}`} onClick={() => scrollTo(id)}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
        <div className="navbar-right">
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <a href="https://wa.me/919987759591" target="_blank" rel="noopener noreferrer" className="navbar-cta">Contact us</a>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
         HERO / TRACKING
         ═══════════════════════════════════════════════════════════════ */}
      <section id="track" className="hero-section">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-badge"><span className="dot-live" /> Track across 1,000+ carriers</div>
            <h1 className="hero-heading">
              Know where it is,<br /><span className="accent">always.</span>
            </h1>
            <p className="hero-subtitle">
              Caseily follows every shipment from the warehouse to your doorstep, so you're never the one asking "where's my package?"
            </p>

            {/* ─── TRACKING CARD ─── */}
            <div className="tracking-card">
              <div className="tracking-input-area">
                <input type="text" className="tracking-number-input" placeholder="Enter your tracking number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTrack()} />
              </div>

              <div className="tracking-input-area">
                <div className="courier-dropdown-wrap" ref={dropdownRef}>
                  <button type="button" className="courier-dropdown-trigger" onClick={() => { setCourierOpen(o => !o); setCourierSearch('') }}>
                    <svg className="truck-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    <span className={`courier-dropdown-text ${selectedCourier ? 'selected' : ''}`}>{courierDisplayText}</span>
                    <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: courierOpen ? 'rotate(180deg)' : '' }}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {courierOpen && (
                    <div className="courier-dropdown-menu">
                      <div className="courier-dropdown-search"><input type="text" placeholder="Search courier…" value={courierSearch} onChange={e => setCourierSearch(e.target.value)} autoFocus /></div>
                      <div className="courier-dropdown-list">
                        {filteredCouriers.map(c => (
                          <div key={c.key} className={`courier-dropdown-item ${selectedCourier === c.key ? 'selected' : ''}`} onClick={() => { setSelectedCourier(c.key); setCourierOpen(false) }}>
                            <span className="flag">{c.country ? isoToFlag(c.country) : '🔍'}</span>
                            <span className="item-name">{c.name}</span>
                            {selectedCourier === c.key && <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                        ))}
                        {filteredCouriers.length === 0 && <div className="dropdown-empty">No couriers found</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="tracking-input-area">
                <button className="track-now-btn" onClick={handleTrack} disabled={loading || !trackingNumber.trim()}>
                  {loading ? <div className="spinner-small" /> : 'Track now'}
                </button>
              </div>
            </div>

            {/* ─── RESULTS ─── */}
            {showResults && (
              <div className="results-section">
                {loading && <div className="loading-container"><div className="spinner" /><p>Fetching tracking info…</p><p className="loading-hint">This may take up to a minute for new shipments</p></div>}
                {error && <p className="status-text error">{error}</p>}
                {result && (
                  <div className="result">
                    <div className="result-head">
                      <div className="oid">Tracking number</div>
                      <h2>{trackingNumber}</h2>
                      {result.courier_name && <div className="selected-courier-badge"><span className="badge-name">{result.courier_name}</span></div>}
                      <div className={getStatusPillClass(result.status_tag)}><span className="dot" />{result.status}</div>
                    </div>
                    {hasMessage && (isAwaiting || isNotFound || isError) && (
                      <div className={`tracking-message ${result.status_tag}`}>
                        <div className="tracking-message-icon">
                          {isAwaiting && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                          {isNotFound && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
                          {isError && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                        </div>
                        <p>{result.message}</p>
                      </div>
                    )}
                    {!isError && !isNotFound && (
                      <div className="timeline">
                        {result.steps?.map((step, i) => {
                          const icons = {
                            "Order Placed": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
                            "In Transit": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
                            "Out For Delivery": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
                            "Delivered": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          }
                          return (
                            <div key={i} className={`tl-step ${step.done ? '' : 'pending'} ${i === currentIndex ? 'current' : ''}`} style={{ animationDelay: `${i * 0.12}s` }}>
                              <div className="tl-step-header">{icons[step.label]}<h3>{step.label}</h3></div>
                              <p>{step.done ? (step.timestamp ? new Date(step.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Completed') : '—'}</p>
                              {step.location && <p className="step-location"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'4px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{step.location}</p>}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <div className="result-actions">
                      {(isAwaiting || isNotFound) && <button className="btn-refresh" onClick={handleTrack} disabled={loading}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>{loading ? 'Refreshing…' : 'Refresh'}</button>}
                      <button className="btn-track-another" onClick={handleReset}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>Track another</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── PROMO BANNER ─── */}
            <a href="https://www.instagram.com/caseilyplusstore/" target="_blank" rel="noopener noreferrer" className="promo-banner-container">
              <img src="/promo-banner.jpg" alt="Caseily Plus" className="promo-banner-image" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         REVIEWS
         ═══════════════════════════════════════════════════════════════ */}
      <section id="reviews" className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Reviews</span>
            <h2 className="section-title">Trusted on both sides of the loading dock</h2>
            <p className="section-subtitle">From warehouse managers routing thousands of pallets to someone waiting on a birthday gift — here's what they say.</p>
          </div>

          <div className="review-tabs">
            <button className={`review-tab ${reviewTab === 'b2b' ? 'active' : ''}`} onClick={() => setReviewTab('b2b')}>For businesses</button>
            <button className={`review-tab ${reviewTab === 'b2c' ? 'active' : ''}`} onClick={() => setReviewTab('b2c')}>For shoppers</button>
          </div>

          <div className="review-grid">
            {activeReviews.map((r, i) => (
              <div key={`${reviewTab}-${i}`} className="review-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className={`review-tag ${reviewTab === 'b2b' ? 'b2b' : 'b2c'}`}>{r.tag}</span>
                <Stars count={r.stars} />
                <p className="review-quote">"{r.quote}"</p>
                <div className="review-author">
                  <div className="review-avatar" style={{ background: r.color }}>{r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  <div className="review-author-info">
                    <span className="review-author-name">{r.name}</span>
                    <span className="review-author-role">{r.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         BLOG
         ═══════════════════════════════════════════════════════════════ */}
      <section id="blog" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Blog</span>
            <h2 className="section-title">From the Caseily blog</h2>
            <p className="section-subtitle">Product updates, shipping tips, and the occasional story from behind the scenes.</p>
          </div>

          <div className="blog-grid">
            {BLOGS.map((b, i) => (
              <div key={i} className="blog-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`blog-thumb ${b.gradient}`} />
                <div className="blog-body">
                  <span className="blog-category">{b.category}</span>
                  <h3 className="blog-title">{b.title}</h3>
                  <p className="blog-excerpt">{b.excerpt}</p>
                  <div className="blog-meta"><span>{b.time}</span><span>{b.date}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         COMMUNITY
         ═══════════════════════════════════════════════════════════════ */}
      <section id="community" className="section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Community</span>
            <h2 className="section-title">Connect with us</h2>
            <p className="section-subtitle">Two places to go deeper than a tracking number.</p>
          </div>

          <div className="community-grid">
            <div className="community-card whatsapp">
              <div className="community-icon">💬</div>
              <h3>Join our WhatsApp community</h3>
              <p>Get shipping tips, exclusive deals on phone cases, and direct support from the Caseily team.</p>
              <div className="community-stats">
                <div><div className="community-stat-value">2,400+</div><div className="community-stat-label">Members</div></div>
                <div><div className="community-stat-value">Daily</div><div className="community-stat-label">Active support</div></div>
              </div>
              <a href="https://wa.me/919987759591" target="_blank" rel="noopener noreferrer" className="community-cta">Join the community →</a>
            </div>

            <div className="community-card youtube">
              <div className="community-icon">▶️</div>
              <h3>Watch on YouTube</h3>
              <p>Unboxings, case reviews, behind-the-scenes of how we build, and shipping tutorials.</p>
              <div className="community-stats">
                <div><div className="community-stat-value">5,800+</div><div className="community-stat-label">Subscribers</div></div>
                <div><div className="community-stat-value">Weekly</div><div className="community-stat-label">New videos</div></div>
              </div>
              <a href="https://www.youtube.com/@caseily" target="_blank" rel="noopener noreferrer" className="community-cta">Watch the channel →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         FAQ
         ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Questions, answered</h2>
            <p className="section-subtitle">Still stuck? The community and support team are both a click away.</p>
          </div>

          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {f.q}
                  <span className="faq-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </span>
                </button>
                <div className="faq-answer"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="container">
          © {new Date().getFullYear()} Caseily · All rights reserved
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════
         MOBILE BOTTOM NAV
         ═══════════════════════════════════════════════════════════════ */}
      <nav className="mobile-nav">
        {[
          { id: 'track', label: 'Track', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
          { id: 'reviews', label: 'Reviews', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
          { id: 'blog', label: 'Blog', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
          { id: 'community', label: 'Connect', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { id: 'faq', label: 'FAQ', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
        ].map(item => (
          <button key={item.id} className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`} onClick={() => scrollTo(item.id)}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

    </div>
  )
}

export default App