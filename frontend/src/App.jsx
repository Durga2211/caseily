import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useTilt } from './useTilt'
import { TiltCard } from './TiltCard'

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
  { tag: 'E-commerce brand', stars: 5, quote: 'The API is incredibly stable and the webhook responses are near-instant. We have integrated it across our entire custom ERP with zero downtime.', name: 'Vikram Singh', role: 'CTO, UrbanCart', color: '#8b5cf6' },
  { tag: 'Logistics partner', stars: 5, quote: 'What used to take 3 support agents to track down missing parcels now takes seconds. The unified tracking interface is a game-changer for our B2B ops.', name: 'Neha Patel', role: 'Operations Mgr, SwiftLog', color: '#eab308' },
  { tag: 'D2C brand', stars: 5, quote: 'Best investment we made this quarter. Customers feel more in control, and our NPS score jumped 15 points simply because tracking is transparent.', name: 'Aman Gupta', role: 'CEO, FitGear', color: '#ef4444' },
]

const REVIEWS_B2C = [
  { tag: 'Verified buyer', stars: 5, quote: "Got my phone case delivered in 3 days! The tracking page showed every step — from warehouse to my doorstep. So much better than checking the courier's janky site.", name: 'Sneha R.', role: 'Mumbai, MH', color: '#14b8a6' },
  { tag: 'Verified buyer', stars: 5, quote: "Love how I can see the exact location of my package. Got a notification when it was out for delivery. The case itself is gorgeous too — perfect fit on my iPhone.", name: 'Karthik V.', role: 'Bangalore, KA', color: '#f97316' },
  { tag: 'Verified buyer', stars: 4, quote: "Ordered a custom case and was anxious about delivery time. The live tracker calmed my nerves — I could see it moving across the country. Great experience overall!", name: 'Anjali P.', role: 'Delhi, DL', color: '#3b82f6' },
  { tag: 'Verified buyer', stars: 5, quote: "The timeline was spot on. I knew exactly when to be home to receive my parcel. No more waiting around all day guessing when the delivery guy will show up.", name: 'Rohit K.', role: 'Pune, MH', color: '#8b5cf6' },
  { tag: 'Verified buyer', stars: 5, quote: "Usually I have to copy-paste tracking numbers across 3 different sites. This is so much easier. Just enter the number and boom, the whole history is right there.", name: 'Meera M.', role: 'Chennai, TN', color: '#eab308' },
  { tag: 'Verified buyer', stars: 5, quote: "Fast updates! The moment my package was out for delivery, the status changed. Really reassuring when you're ordering expensive items.", name: 'Rahul S.', role: 'Hyderabad, TS', color: '#ef4444' },
]

const BLOGS = [
  { category: 'Tips', title: 'How we built real-time tracking for 10+ carriers', color: '#d9a05b' },
  { category: 'Guide', title: '5 tips to reduce "Where is my order?" support tickets', color: '#4a5556' },
  { category: 'Case study', title: 'How StyleCraft cut support costs by 60%', color: '#889f97' },
  { category: 'Updates', title: 'Introducing auto-notifications for delivery exceptions', color: '#ebdcd7' },
]

const FAQS = [
  { q: 'How does live tracking actually work?', a: "Caseily connects to carrier scan feeds through Ship24's API and normalises every event — pickup, hub scan, customs, out for delivery — into one clean timeline, updated as soon as the carrier reports it." },
  { q: 'Which carriers are supported?', a: 'We support 1,000+ carriers worldwide including Delhivery, BlueDart, DTDC, Ekart, Xpressbees, India Post, FedEx, DHL, UPS, and many more. Select your courier from the dropdown for best results.' },
  { q: 'Do you offer an API for businesses?', a: 'Yes! Our tracking API lets you embed real-time tracking into your own website or app. Contact us on WhatsApp for API access and integration support.' },
  { q: 'What if my package shows no updates?', a: 'Some carriers take a few hours to report the first scan. Try selecting your courier from the dropdown and refreshing. If it still shows no data, the carrier may not have scanned the package yet.' },
  { q: 'Is there a cost for shoppers?', a: 'No — tracking your order on Caseily is completely free for shoppers. Just enter your tracking number and go.' },
  { q: 'How can I get notified about my delivery?', a: 'Join our WhatsApp community to get delivery tips and support. We are working on automatic delivery notifications — stay tuned!' },
]

const HIGHLIGHTS = [
  {
    id: 'reviews',
    label: 'Reviews',
    cover: '/highlights/cover_reviews.jpg',
    stories: [
      '/highlights/review1.png',
      '/highlights/review2.png',
      '/highlights/review3.png',
      '/highlights/review4.png',
      '/highlights/review5.png',
    ],
  },
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
// INSTAGRAM STORY VIEWER
// ═════════════════════════════════════════════════════════════════════════
function StoryViewer({ highlight, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const elapsedRef = useRef(0)
  const DURATION = 3000 // 3 seconds per story

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Animation frame based timer for smooth progress
  useEffect(() => {
    if (isPaused) return

    startTimeRef.current = performance.now() - elapsedRef.current

    function tick(now) {
      const elapsed = now - startTimeRef.current
      const pct = Math.min(elapsed / DURATION, 1)
      setProgress(pct)

      if (pct >= 1) {
        // Move to next story
        elapsedRef.current = 0
        if (currentIndex < highlight.stories.length - 1) {
          setCurrentIndex(i => i + 1)
        } else {
          onClose()
        }
        return
      }
      timerRef.current = requestAnimationFrame(tick)
    }

    timerRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(timerRef.current)
  }, [currentIndex, isPaused, highlight.stories.length, onClose])

  // Reset progress on index change
  useEffect(() => {
    setProgress(0)
    elapsedRef.current = 0
  }, [currentIndex])

  function handlePause() {
    setIsPaused(true)
    elapsedRef.current = performance.now() - startTimeRef.current
  }

  function handleResume() {
    setIsPaused(false)
  }

  function goNext() {
    elapsedRef.current = 0
    if (currentIndex < highlight.stories.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      onClose()
    }
  }

  function goPrev() {
    elapsedRef.current = 0
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer-container" onClick={e => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="story-progress-bar-container">
          {highlight.stories.map((_, i) => (
            <div key={i} className="story-progress-track">
              <div
                className="story-progress-fill"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress * 100}%` : '0%',
                  transition: i === currentIndex ? 'none' : 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-header">
          <div className="story-header-left">
            <img src={highlight.cover} alt="" className="story-header-avatar" />
            <span className="story-header-name">caseily</span>
            <span className="story-header-time">• {highlight.label}</span>
          </div>
          <button className="story-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Story image */}
        <img
          src={highlight.stories[currentIndex]}
          alt={`Story ${currentIndex + 1}`}
          className="story-image"
          draggable={false}
        />

        {/* Touch zones */}
        <div
          className="story-touch-left"
          onClick={goPrev}
          onMouseDown={handlePause}
          onMouseUp={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
        />
        <div
          className="story-touch-right"
          onClick={goNext}
          onMouseDown={handlePause}
          onMouseUp={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
        />
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════
// SPLASH SCREEN
// ═════════════════════════════════════════════════════════════════════════
function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isVisible) return

    document.body.style.overflow = 'hidden'

    const dotTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 400)

    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 2600)

    const unmountTimer = setTimeout(() => {
      setIsVisible(false)
      document.body.style.overflow = ''
    }, 3000)

    return () => {
      clearInterval(dotTimer)
      clearTimeout(fadeOutTimer)
      clearTimeout(unmountTimer)
      document.body.style.overflow = ''
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className={`splash-v2 ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="splash-v2-tags">
        <div className="splash-v2-tag tag-1" style={{ '--rotation': 'rotate(-8deg)' }}>SILICONE GRIP</div>
        <div className="splash-v2-tag tag-2" style={{ '--rotation': 'rotate(12deg)' }}>MAGSAFE READY</div>
        <div className="splash-v2-tag tag-3" style={{ '--rotation': 'rotate(5deg)' }}>DROP TESTED</div>
        <div className="splash-v2-tag tag-4" style={{ '--rotation': 'rotate(-15deg)' }}>CUSTOM PRINTS</div>
        <div className="splash-v2-tag tag-5" style={{ '--rotation': 'rotate(10deg)' }}>SLIM ARMOR</div>
      </div>
      
      <div className="splash-v2-top">
        <div className="splash-v2-mark">
          <div className="splash-v2-mark-block"></div>
          <div className="splash-v2-mark-block"></div>
        </div>
      </div>

      <div className="splash-v2-center">
        <div className="splash-v2-headline">
          <div className="splash-v2-wordmark">caseily</div>
        </div>
        
        <div className="splash-v2-bottom-shape">
          <div className="splash-v2-circle"></div>
          <div className="splash-v2-bar"></div>
          <div className="splash-v2-circle"></div>
        </div>
      </div>

      <div className="splash-v2-footer">
        <div className="splash-v2-button">
          Unboxing Your Case{dots}
        </div>
      </div>
    </div>
  )
}

const API_URL = import.meta.env.VITE_API_URL || ''

// ═════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═════════════════════════════════════════════════════════════════════════
function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('caseily-admin-token') || '')
  const [password, setPassword] = useState('')
  const [reviews, setReviews] = useState([])
  const [loginError, setLoginError] = useState('')
  const [loadingReviews, setLoadingReviews] = useState(false)

  const isLoggedIn = !!token

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    try {
      const form = new FormData()
      form.append('password', password)
      const res = await fetch(`${API_URL}/api/admin/login`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      setToken(data.token)
      localStorage.setItem('caseily-admin-token', data.token)
    } catch (err) {
      setLoginError(err.message)
    }
  }

  function handleLogout() {
    setToken('')
    localStorage.removeItem('caseily-admin-token')
  }

  async function fetchReviews() {
    setLoadingReviews(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) { handleLogout(); return }
      setReviews(data.reviews || [])
    } catch (err) { console.error(err) }
    setLoadingReviews(false)
  }

  useEffect(() => {
    if (isLoggedIn) fetchReviews()
  }, [isLoggedIn])

  async function handleAction(id, action) {
    try {
      await fetch(`${API_URL}/api/admin/reviews/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchReviews()
    } catch (err) { console.error(err) }
  }

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: '48px 40px', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
          <div style={{ color: '#1e3fd1', fontWeight: 900, fontSize: '32px', marginBottom: '8px', fontFamily: '"Poppins", sans-serif' }}>caseily</div>
          <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '15px' }}>Admin Dashboard</p>
          {loginError && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{loginError}</p>}
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '16px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }}
            autoFocus
          />
          <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#1e3fd1', color: '#fff', fontSize: '16px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
            Login
          </button>
        </form>
      </div>
    )
  }

  const pending = reviews.filter(r => r.status === 'pending')
  const approved = reviews.filter(r => r.status === 'approved')
  const rejected = reviews.filter(r => r.status === 'rejected')

  function ReviewCard({ r }) {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>{r.name}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{r.city}</div>
          </div>
          <div style={{ color: '#f59e0b', fontSize: '16px' }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
        </div>
        <p style={{ color: '#334155', fontSize: '14px', lineHeight: 1.5, margin: '0 0 12px' }}>"{r.quote}"</p>
        {r.photo && (
          <img src={`${API_URL}/uploads/${r.photo}`} alt="Review" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} />
        )}
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>{new Date(r.created_at).toLocaleString()}</div>
        {r.status === 'pending' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleAction(r.id, 'approve')} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#22c55e', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✓ Approve</button>
            <button onClick={() => handleAction(r.id, 'reject')} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#ef4444', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✕ Reject</button>
          </div>
        )}
        {r.status !== 'pending' && (
          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', background: r.status === 'approved' ? '#dcfce7' : '#fee2e2', color: r.status === 'approved' ? '#16a34a' : '#dc2626' }}>
            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ background: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#1e3fd1', fontWeight: 900, fontSize: '24px', fontFamily: '"Poppins", sans-serif' }}>caseily</div>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={fetchReviews} style={{ padding: '8px 16px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#334155' }}>↻ Refresh</button>
          <button onClick={() => { window.location.href = '/' }} style={{ padding: '8px 16px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#334155' }}>← Site</button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '10px', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        {loadingReviews ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading reviews...</p>
        ) : (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Pending Reviews ({pending.length})</h2>
            {pending.length === 0 && <p style={{ color: '#94a3b8', marginBottom: '32px' }}>No pending reviews.</p>}
            <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
              {pending.map(r => <ReviewCard key={r.id} r={r} />)}
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Approved ({approved.length})</h2>
            <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
              {approved.map(r => <ReviewCard key={r.id} r={r} />)}
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Rejected ({rejected.length})</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {rejected.map(r => <ReviewCard key={r.id} r={r} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════
// APP
// ═════════════════════════════════════════════════════════════════════════
function App() {
  // ─── Routing ─────────────────────────────────────────────────────────
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  useEffect(() => {
    function onPop() { setCurrentPath(window.location.pathname) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  if (currentPath === '/admin') return <AdminDashboard />
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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('caseily-theme') || 'light'
  })

  useEffect(() => {
    localStorage.setItem('caseily-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  const [reviewTab, setReviewTab] = useState('b2b')
  const [openFaq, setOpenFaq] = useState(0)
  const [openSupportItem, setOpenSupportItem] = useState(null)
  const [activeSection, setActiveSection] = useState('track')
  const dropdownRef = useRef(null)
  const [shortcutMenuOpen, setShortcutMenuOpen] = useState(false)
  const shortcutRef = useRef(null)
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false)
  const exploreRef = useRef(null)
  const [activeStoryHighlight, setActiveStoryHighlight] = useState(null)

  // ─── Review form state ───────────────────────────────────────────────
  const [reviewForm, setReviewForm] = useState({ name: '', city: '', stars: 5, quote: '' })
  const [reviewPhoto, setReviewPhoto] = useState(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // ─── Approved reviews from backend ───────────────────────────────────
  const [approvedReviews, setApprovedReviews] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/reviews/approved`)
      .then(r => r.json())
      .then(data => setApprovedReviews(data.reviews || []))
      .catch(() => {})
  }, [])

  async function handleReviewSubmit(e) {
    e.preventDefault()
    setReviewSubmitting(true)
    setReviewError('')
    try {
      const form = new FormData()
      form.append('name', reviewForm.name)
      form.append('city', reviewForm.city)
      form.append('stars', reviewForm.stars)
      form.append('quote', reviewForm.quote)
      if (reviewPhoto) form.append('photo', reviewPhoto)
      const res = await fetch(`${API_URL}/api/reviews`, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Submission failed')
      setReviewSuccess(true)
      setReviewForm({ name: '', city: '', stars: 5, quote: '' })
      setReviewPhoto(null)
      setTimeout(() => setReviewSuccess(false), 4000)
    } catch (err) {
      setReviewError(err.message)
    }
    setReviewSubmitting(false)
  }

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev === 0 ? 1 : 0))
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // ─── Dropdown outside-click ───────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCourierOpen(false)
      }
      if (shortcutRef.current && !shortcutRef.current.contains(e.target)) {
        setShortcutMenuOpen(false)
      }
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setExploreMenuOpen(false)
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

  function translateToHindi() {
    // Robust way to force Google Translate to Hindi: set the cookie and reload
    document.cookie = 'googtrans=/en/hi; path=/';
    document.cookie = 'googtrans=/en/hi; domain=' + window.location.hostname + '; path=/';
    window.location.reload();
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
  const courierDisplayText = selectedCourierObj?.key ? selectedCourierObj.name : 'Select Courier (optional, e.g., US...'
  const activeReviews = reviewTab === 'b2b' ? REVIEWS_B2B : REVIEWS_B2C

  // ═════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="app-wrapper">
      <SplashScreen />

      <div style={{ backgroundColor: 'var(--accent)', position: 'relative', zIndex: 1, paddingBottom: '80px' }}>
        {/* ─── NAVBAR ─── */}
        <nav className="navbar" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div className="navbar-left">
            <div style={{ color: '#1e3fd1', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.04em', fontFamily: '"Poppins", "Circular", "Plus Jakarta Sans", sans-serif' }}>caseily</div>
          </div>
          <div className="navbar-links">
            {['track','reviews','blog','community','faq'].map(id => (
              <button key={id} className={`navbar-link ${activeSection === id ? 'active' : ''}`} onClick={() => scrollTo(id)} style={{ color: '#0f172a' }}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
          <div className="navbar-right">
            <button className="theme-toggle" onClick={translateToHindi} aria-label="Translate to Hindi" title="Translate to Hindi" style={{ marginRight: '8px', color: '#0f172a' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
            </button>
            <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle theme" style={{ color: '#0f172a' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <a href="https://wa.me/919987759591" target="_blank" rel="noopener noreferrer" className="navbar-cta" style={{ backgroundColor: '#bfdbfe', color: '#0f172a' }}>Contact us</a>
          </div>
        </nav>

        {/* ─── MOBILE HEADER ─── */}
        <div className="mobile-app-header" style={{ justifyContent: 'center', backgroundColor: '#ffffff', padding: '16px 20px', width: '100%', boxSizing: 'border-box', position: 'relative', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ color: '#1e3fd1', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.04em', fontFamily: '"Poppins", "Circular", "Plus Jakarta Sans", sans-serif' }}>caseily</div>
          
          <div style={{ position: 'absolute', right: '20px' }} ref={shortcutRef}>
            <button className="theme-toggle" onClick={() => setShortcutMenuOpen(o => !o)} aria-label="Menu" style={{ backgroundColor: 'transparent', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#1e3fd1' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
            {shortcutMenuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '44px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', padding: '8px', width: '160px', zIndex: 100, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <button type="button" onClick={() => { setShortcutMenuOpen(false); translateToHindi(); }} style={{ background: 'none', border: 'none', padding: '10px 12px', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: '#0f172a' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>Change lang</button>
                <button type="button" onClick={() => { setShortcutMenuOpen(false); scrollTo('what-we-provide'); }} style={{ background: 'none', border: 'none', padding: '10px 12px', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: '#0f172a' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>About us</button>
                <button type="button" onClick={() => { setShortcutMenuOpen(false); scrollTo('faq'); }} style={{ background: 'none', border: 'none', padding: '10px 12px', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: '#0f172a' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>Faq</button>
                <button type="button" onClick={() => { setShortcutMenuOpen(false); window.open('https://twitter.com/caseily', '_blank'); }} style={{ background: 'none', border: 'none', padding: '10px 12px', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: '#0f172a' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>Follow us</button>
              </div>
            )}
          </div>
        </div>

        {/* ─── HERO TITLE ─── */}
        <div className="container" style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
          <h1 className="hero-heading" style={{ color: '#ffffff', margin: 0, fontSize: '36px', lineHeight: '1.2' }}>
            Where's your order?<br/>Track your happiness.<br/>We're on it.
          </h1>
          <p className="hero-subtitle desktop-only" style={{ color: '#94a3b8', marginTop: '16px' }}>
            Enter your tracking number below to see your live delivery status
          </p>
        </div>
      </div>

      <section id="track" style={{ position: 'relative', zIndex: 10, marginTop: '-64px', padding: '0 20px 40px' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* ─── TRACKING CARD ─── */}
          <div className="tracking-card" style={{ backgroundColor: '#ffffff', borderRadius: '32px', padding: '24px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '32px', padding: '0 20px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" style={{ flex: 1, border: 'none', background: 'transparent', padding: '16px 12px', fontSize: '16px', outline: 'none' }} placeholder="Enter your tracking number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTrack()} />
            </div>

            <div style={{ position: 'relative', marginBottom: '24px' }} ref={dropdownRef}>
              <button type="button" onClick={() => { setCourierOpen(o => !o); setCourierSearch('') }} style={{ width: '100%', display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '32px', padding: '16px 20px', border: '1px solid #f1f5f9', color: '#64748b', fontSize: '16px', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span style={{ flex: 1, textAlign: 'left' }}>{courierDisplayText}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: courierOpen ? 'rotate(180deg)' : '' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
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

            <button onClick={handleTrack} disabled={loading || !trackingNumber.trim()} style={{ width: '100%', backgroundColor: 'var(--accent)', color: '#ffffff', borderRadius: '32px', padding: '16px', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {loading ? <div className="spinner-small" /> : 'Track now'}
            </button>

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
                        {(isAwaiting || isNotFound) && (
                          <button className="btn-refresh btn-glossy" onClick={handleTrack} disabled={loading}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                            Refresh Status
                          </button>
                        )}
                        <button className="btn-track-another btn-glossy" onClick={handleReset}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>Track another</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── BOTTOM NAV PILL ─── */}
            <div className="mobile-dashboard" style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ffffff', borderRadius: '32px', padding: '12px 24px', display: 'flex', alignItems: 'center', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', zIndex: 100, width: 'max-content', maxWidth: '90vw', justifyContent: 'space-between' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: activeSection === 'track' ? 'var(--accent)' : 'transparent', color: activeSection === 'track' ? '#ffffff' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => scrollTo('track')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div style={{ color: activeSection === 'reviews' ? '#ffffff' : 'var(--accent)', backgroundColor: activeSection === 'reviews' ? 'var(--accent)' : 'transparent', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => scrollTo('reviews')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div style={{ color: activeSection === 'blog' ? '#ffffff' : 'var(--accent)', backgroundColor: activeSection === 'blog' ? 'var(--accent)' : 'transparent', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => scrollTo('blog')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              
              <div ref={exploreRef} style={{ position: 'relative' }}>
                <div style={{ color: 'var(--accent)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setExploreMenuOpen(!exploreMenuOpen)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                </div>
                {exploreMenuOpen && (
                  <div style={{ position: 'absolute', bottom: '60px', right: 0, backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '12px', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 101, border: '1px solid #e2e8f0' }}>
                    <div className="explore-menu-item" style={{ color: '#0f172a', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => { setExploreMenuOpen(false); alert('Offer of the day clicked!') }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                      Offer of the day
                    </div>
                    <div className="explore-menu-item" style={{ color: '#0f172a', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => { setExploreMenuOpen(false); alert('Sale notification clicked!') }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                      Sale notification
                    </div>
                    <div className="explore-menu-item" style={{ color: '#0f172a', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => { setExploreMenuOpen(false); alert('Festival wishes clicked!') }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                      Festival wishes
                    </div>
                  </div>
                )}
              </div>
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

          <div className="marquee-container">
            <div className={`marquee-track ${reviewTab}`}>
              {/* Render active reviews twice for infinite seamless scrolling */}
              {[...(reviewTab === 'b2c' ? [...activeReviews, ...approvedReviews.map(r => ({ tag: 'Verified buyer', stars: r.stars, quote: r.quote, name: r.name, role: r.city || 'Customer', color: ['#14b8a6','#f97316','#3b82f6','#8b5cf6','#eab308','#ef4444'][Math.floor(Math.random()*6)] }))] : activeReviews), ...(reviewTab === 'b2c' ? [...activeReviews, ...approvedReviews.map(r => ({ tag: 'Verified buyer', stars: r.stars, quote: r.quote, name: r.name, role: r.city || 'Customer', color: ['#14b8a6','#f97316','#3b82f6','#8b5cf6','#eab308','#ef4444'][Math.floor(Math.random()*6)] }))] : activeReviews)].map((r, i) => (
                <TiltCard key={`${reviewTab}-${i}`} className="review-card" style={{ backgroundColor: r.color + '15', borderTopColor: r.color }}>
                  <span className={`review-tag ${reviewTab === 'b2b' ? 'b2b' : 'b2c'}`} style={{ color: r.color }}>{r.tag}</span>
                  <Stars count={r.stars} />
                  <p className="review-quote">"{r.quote}"</p>
                  <div className="review-author">
                    <div className="review-avatar" style={{ background: r.color }}>{r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                    <div className="review-author-info">
                      <span className="review-author-name">{r.name}</span>
                      <span className="review-author-role">{r.role}</span>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── INSTAGRAM HIGHLIGHTS ─── */}
      <section className="highlights-section">
        <h2 className="highlights-title">Our Highlights</h2>
        <div className="highlights-scroll">
          {(() => {
            const dynamicHighlights = HIGHLIGHTS.map(h => {
              if (h.id === 'reviews') {
                const approvedPhotos = approvedReviews.filter(r => r.photo).map(r => `${API_URL}/uploads/${r.photo}`)
                return { ...h, stories: [...h.stories, ...approvedPhotos] }
              }
              return h
            })
            return dynamicHighlights.map(h => (
              <div key={h.id} className="highlight-item" onClick={() => setActiveStoryHighlight(h)}>
                <div className="highlight-ring">
                  <img src={h.cover} alt={h.label} className="highlight-cover" />
                </div>
                <span className="highlight-label">{h.label}</span>
              </div>
            ))
          })()}
        </div>
      </section>

      {/* Story Viewer Modal */}
      {activeStoryHighlight && (
        <StoryViewer
          highlight={activeStoryHighlight}
          onClose={() => setActiveStoryHighlight(null)}
        />
      )}

      {/* ─── WHAT WE PROVIDE ─── */}
      <section id="what-we-provide" className="section" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: '32px' }}>What we provide</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '16px' 
        }}>
          {[1, 2, 3, 4].map((num) => (
            <div key={num} style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              backgroundColor: 'var(--bg-elevated)', 
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--border)'
            }}>
              <video 
                src={`/promo${num}.mp4`} 
                muted
                autoPlay
                loop
                playsInline
                style={{ width: '100%', display: 'block', backgroundColor: '#000' }}
              ></video>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SHOP BANNER
         ═══════════════════════════════════════════════════════════════ */}
      <section id="shop-banner" style={{ padding: '0 20px', maxWidth: '800px', margin: '60px auto 40px auto' }}>
        <div onClick={() => window.open('http://wa.me/c/919167788773', '_blank')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px', cursor: 'pointer' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)', letterSpacing: '-0.5px' }}>CaseilyPlus+ shop</h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-strong)' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        
        <div style={{ overflow: 'hidden', margin: '-10px', padding: '10px' }}>
          <div 
            style={{ 
              display: 'flex', 
              width: '200%', 
              transform: `translateX(-${currentBannerIndex * 50}%)`, 
              transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' 
            }}
          >
            {/* Banner 1 */}
            <div onClick={() => window.open('http://wa.me/c/919167788773', '_blank')} style={{ width: '50%', flexShrink: 0, padding: '0' }}>
              <div className="shop-banner-card">
                <div className="shop-banner-text">
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Accessorize your device...</h3>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#000000', lineHeight: 1.3 }}>Explore latest Caseily accessories</p>
                </div>
                <div className="shop-banner-image" style={{ backgroundColor: '#f1f5f9' }}>
                  <img src="/class_hero.jpg" alt="Accessories" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>
            </div>

            {/* Banner 2 */}
            <div onClick={() => window.open('http://wa.me/c/919167788773', '_blank')} style={{ width: '50%', flexShrink: 0, padding: '0' }}>
              <div className="shop-banner-card">
                <div className="shop-banner-text">
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Elevate your setup</h3>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#000000', lineHeight: 1.3 }}>Simplify Connectivity. Boost Productivity.</p>
                </div>
                <div className="shop-banner-image" style={{ backgroundColor: '#e6e6e6' }}>
                  <img src="/banner2_image.png" alt="Accessories" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         BLOG
         ═══════════════════════════════════════════════════════════════ */}
      <section id="blog" style={{ padding: '0 20px', maxWidth: '800px', margin: '40px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px', cursor: 'pointer' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)', letterSpacing: '-0.5px' }}>News and tips</h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-strong)' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        
        <div style={{ backgroundColor: '#ffffff', borderRadius: '32px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {BLOGS.map((b, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', backgroundColor: b.color }}>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' }}>{b.category}</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         WRITE A REVIEW
         ═══════════════════════════════════════════════════════════════ */}
      <section id="write-review" style={{ padding: '0 20px', maxWidth: '800px', margin: '40px auto' }}>
        <h2 style={{ margin: '0 0 16px 8px', fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)', letterSpacing: '-0.5px' }}>Write a review</h2>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '32px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          {reviewSuccess ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#22c55e', marginBottom: '8px' }}>Review submitted successfully!</h3>
              <p style={{ color: '#64748b', fontSize: '15px' }}>Thank you for your feedback. It will appear once approved.</p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="review-form-grid">
                <input
                  type="text" placeholder="Your name *" required
                  value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                  style={{ padding: '14px 18px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', background: '#f8fafc' }}
                />
                <input
                  type="text" placeholder="City (optional)"
                  value={reviewForm.city} onChange={e => setReviewForm(f => ({ ...f, city: e.target.value }))}
                  style={{ padding: '14px 18px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', background: '#f8fafc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Rating</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} onClick={() => setReviewForm(f => ({ ...f, stars: s }))} style={{ cursor: 'pointer', fontSize: '28px', color: s <= reviewForm.stars ? '#f59e0b' : '#d1d5db', transition: 'transform 0.15s' }}>
                      {s <= reviewForm.stars ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Write your review... *" required
                value={reviewForm.quote} onChange={e => setReviewForm(f => ({ ...f, quote: e.target.value }))}
                rows={4}
                style={{ padding: '14px 18px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', resize: 'vertical', background: '#f8fafc', fontFamily: 'inherit' }}
              />
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '16px', border: '1px dashed #cbd5e1', cursor: 'pointer', background: '#f8fafc', color: '#64748b', fontSize: '15px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  {reviewPhoto ? reviewPhoto.name : 'Upload product photo (optional)'}
                  <input type="file" accept="image/*" hidden onChange={e => setReviewPhoto(e.target.files[0] || null)} />
                </label>
              </div>
              {reviewError && <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{reviewError}</p>}
              <button type="submit" disabled={reviewSubmitting} style={{ padding: '16px', borderRadius: '16px', background: '#1e3fd1', color: '#fff', fontSize: '16px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: reviewSubmitting ? 0.6 : 1 }}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════
         SUPPORT & LINKS
         ═══════════════════════════════════════════════════════════════ */}
      <section id="support-links" style={{ padding: '0 20px', maxWidth: '800px', margin: '40px auto', textAlign: 'left' }}>
        <h2 style={{ margin: '0 0 16px 8px', fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)', letterSpacing: '-0.5px' }}>Support & Links</h2>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '32px', padding: '12px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div className="support-list">
          {[
            { label: 'Shipping Policies', id: 'shipping', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>, content: 'Orders are processed within 1-2 business days. Standard shipping takes 3-5 days. We provide tracking information for all shipments.' },
            { label: 'Returns & Exchanges', id: 'returns', icon: <><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="14" x2="21" y2="3"></line><polyline points="8 21 3 21 3 16"></polyline><line x1="20" y1="10" x2="3" y2="21"></line></>, content: 'We offer a 30-day return policy for unused items in original packaging. Exchanges are processed immediately upon receipt of the returned item.' },
            { label: 'Bulk Pricing (B2B)', id: 'b2b', icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>, content: 'For orders of 50 units or more, please contact our wholesale team for discounted pricing and priority fulfillment.' },
            { label: 'Contact Us', id: 'contact', isLink: true, icon: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></> }
          ].map((item) => {
            const isOpen = openSupportItem === item.id;
            return (
            <div key={item.id} className="support-list-item" style={{ borderBottom: '1px solid var(--border)' }}>
              <div 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '24px 0', 
                  cursor: 'pointer', textAlign: 'left', color: 'var(--ink-strong)', fontWeight: '600', 
                  fontSize: '18px', transition: 'color 0.2s'
                }}
                onClick={() => {
                  if (item.isLink) {
                    window.open('https://wa.me/919987759591', '_blank');
                  } else {
                    setOpenSupportItem(isOpen ? null : item.id);
                  }
                }}
              >
                <span style={{ marginRight: '16px', display: 'flex', color: 'var(--ink-muted)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {!item.isLink && (
                  <span style={{ marginLeft: 'auto', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                )}
              </div>
              {isOpen && item.content && (
                <div style={{ padding: '0 0 24px 40px', color: 'var(--ink-muted)', lineHeight: '1.6' }}>
                  {item.content}
                </div>
              )}
            </div>
          )})}
          </div>
        </div>
      </section>



      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <img src="/logo.png" alt="Caseily" className="c-logo-full" style={{ height: '32px', width: 'auto' }} />
              <p style={{ color: 'var(--ink-muted)' }}>Making global shipping transparent, reliable, and beautifully simple.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px', color: 'var(--ink-faint)', fontSize: '14px' }}>
            © {new Date().getFullYear()} Caseily · All rights reserved
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App