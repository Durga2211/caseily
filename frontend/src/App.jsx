import { useState, useEffect, useRef } from 'react'
import './App.css'
import { useTilt } from './useTilt'
import { TiltCard } from './TiltCard'
import TicTacToe from './TicTacToe'
// ─── DATA ───────────────────────────────────────────────────────────────
const FALLBACK_REVIEWS = [
  { name: "Renu Thakkar", time: "2 hours ago", text: "We plugged Caseily tracking into our Shopify store and \"where is my order?\" tickets dropped by 60% in the first month. Customers love the live status page.", likes: 245, comments: 18 },
  { name: "Arjun Mehta", time: "5 hours ago", text: "Handling 3,000+ AWBs daily across Delhivery and BlueDart — Caseily normalises all the scan events into one clean timeline. Our ops dashboard finally makes sense.", likes: 189, comments: 12 },
  { name: "Priya Sharma", time: "1 day ago", text: "Our customers used to call us every day asking about their orders. Now they just check the tracking page. Onboarding was seamless — took less than an afternoon.", likes: 312, comments: 45 },
  { name: "Vikram Singh", time: "3 days ago", text: "The API is incredibly stable and the webhook responses are near-instant. We have integrated it across our entire custom ERP with zero downtime.", likes: 410, comments: 55 },
  { name: "Neha Patel", time: "3 days ago", text: "What used to take 3 support agents to track down missing parcels now takes seconds. The unified tracking interface is a game-changer for our B2B ops.", likes: 231, comments: 14 },
  { name: "Sneha R.", time: "2 days ago", text: "Got my phone case delivered in 3 days! The tracking page showed every step — from warehouse to my doorstep. So much better than checking the courier's janky site.", likes: 120, comments: 8 },
  { name: "Karthik V.", time: "4 days ago", text: "Love how I can see the exact location of my package. Got a notification when it was out for delivery. The case itself is gorgeous too — perfect fit on my iPhone.", likes: 145, comments: 9 },
  { name: "Anjali P.", time: "4 days ago", text: "Ordered a custom case and was anxious about delivery time. The live tracker calmed my nerves — I could see it moving across the country. Great experience overall!", likes: 188, comments: 22 },
  { name: "Rohit K.", time: "5 days ago", text: "The timeline was spot on. I knew exactly when to be home to receive my parcel. No more waiting around all day guessing when the delivery guy will show up.", likes: 95, comments: 4 },
  { name: "Meera M.", time: "5 days ago", text: "Usually I have to copy-paste tracking numbers across 3 different sites. This is so much easier. Just enter the number and boom, the whole history is right there.", likes: 304, comments: 31 },
  { name: "Rahul S.", time: "6 days ago", text: "Fast updates! The moment my package was out for delivery, the status changed. Really reassuring when you're ordering expensive items.", likes: 211, comments: 19 }
];

const FALLBACK_REELS = [
  { id: 'h1', videoSrc: '/promo1.mp4', text: 'My top 5 colors!' },
  { id: 'h2', videoSrc: '/promo2.mp4', text: 'How I use it...' },
  { id: 'h3', videoSrc: '/promo3.mp4', text: 'Creator collab BTS' },
  { id: 'h4', videoSrc: '/promo4.mp4', text: 'Get ready with Caseily' },
  { id: 'h5', videoSrc: '/promo1.mp4', text: 'Behind the scenes' },
  { id: 'h6', videoSrc: '/promo2.mp4', text: 'Day in the life' }
];

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
  {
    id: 'happy_customers',
    label: 'Caseily Insider',
    cover: '/happy_customers/img1.png',
    stories: [
      '/happy_customers/img1.png',
      '/happy_customers/img2.jpg',
      '/happy_customers/img3.jpg',
      '/happy_customers/img4.jpg',
    ],
  },
  {
    id: 'our_products',
    label: 'Our Products',
    cover: '/our_products/img1.png',
    stories: [
      '/our_products/img1.png',
      '/our_products/img2.png',
      '/our_products/img3.png',
      '/our_products/img4.png',
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
// REEL VIEWER
// ═════════════════════════════════════════════════════════════════════════
function ReelViewer({ initialNum, allReels, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialNum)
  const totalReels = allReels.length;

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function goNext(e) {
    if (e) e.stopPropagation()
    if (currentIndex < totalReels - 1) setCurrentIndex(n => n + 1)
  }

  function goPrev(e) {
    if (e) e.stopPropagation()
    if (currentIndex > 0) setCurrentIndex(n => n - 1)
  }

  const [touchStartV, setTouchStartV] = useState(0)
  function handleTouchStart(e) { setTouchStartV(e.touches[0].clientY) }
  function handleTouchEnd(e) {
    const touchEndV = e.changedTouches[0].clientY
    if (touchStartV - touchEndV > 50) goNext(e)
    else if (touchEndV - touchStartV > 50) goPrev(e)
  }

  const currentReel = allReels[currentIndex];

  return (
    <div className="story-viewer-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="story-viewer-container" style={{ backgroundColor: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative' }} onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <button style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <video
          key={currentIndex}
          src={currentReel.videoSrc}
          autoPlay
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '40px 16px 24px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', color: '#fff', fontSize: '15px', fontWeight: 'bold', zIndex: 2 }}>
          {currentReel.text}
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════
// EVENT COUNTDOWN
// ═════════════════════════════════════════════════════════════════════════
function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    const targetDate = new Date('2026-09-09T10:00:00-07:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        setTimeLeft('Event Started!');
        clearInterval(interval);
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ fontSize: '42px', fontWeight: '900', color: '#1e3fd1', textAlign: 'center', marginBottom: '24px' }}>
      {timeLeft || 'Loading...'}
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
          <div className="splash-v2-wordmark">CASEILY</div>
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
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = API_URL ? API_URL.replace(/^http/, 'ws') + '/api/chat/ws' : `${protocol}//${window.location.host}/api/chat/ws`;

// ═════════════════════════════════════════════════════════════════════════
// LIVE CHAT COMPONENT
// ═════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═════════════════════════════════════════════════════════════════════════
function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('caseily-admin-token') || '')
  const [password, setPassword] = useState('')
  const [reviews, setReviews] = useState([])
  const [loginError, setLoginError] = useState('')
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [adminTab, setAdminTab] = useState('reviews')
  const [insiders, setInsiders] = useState([])
  const [loadingInsiders, setLoadingInsiders] = useState(false)
  const [insiderForm, setInsiderForm] = useState({ type: 'text', content: '' })
  const [insiderPhotos, setInsiderPhotos] = useState([])
  const [adminNotifications, setAdminNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notifForm, setNotifForm] = useState({ text: '' })

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

  async function fetchInsiders() {
    setLoadingInsiders(true)
    try {
      const res = await fetch(`${API_URL}/api/insiders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setInsiders(data.posts || [])
    } catch (err) { console.error(err) }
    setLoadingInsiders(false)
  }

  async function fetchAdminNotifications() {
    setLoadingNotifications(true)
    try {
      const res = await fetch(`${API_URL}/api/notifications`)
      const data = await res.json()
      setAdminNotifications(data.notifications || [])
    } catch (err) { console.error(err) }
    setLoadingNotifications(false)
  }

  useEffect(() => {
    if (isLoggedIn) {
      if (adminTab === 'reviews') fetchReviews()
      if (adminTab === 'insiders') fetchInsiders()
      if (adminTab === 'notifications') fetchAdminNotifications()
    }
  }, [isLoggedIn, adminTab])

  async function handleCreateInsider(e) {
    e.preventDefault()
    const form = new FormData()
    form.append('post_type', insiderForm.type)
    form.append('content', insiderForm.content)
    if (insiderPhotos && insiderPhotos.length > 0) {
      Array.from(insiderPhotos).forEach(file => {
        form.append('images', file)
      })
    }

    try {
      await fetch(`${API_URL}/api/admin/insiders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      })
      setInsiderForm({ type: 'text', content: '' })
      setInsiderPhotos([])
      fetchInsiders()
    } catch (err) { console.error(err) }
  }

  async function handleDeleteInsider(id) {
    if (!window.confirm('Delete this post?')) return;
    try {
      await fetch(`${API_URL}/api/admin/insiders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchInsiders()
    } catch (err) { console.error(err) }
  }

  async function handleCreateNotification(e) {
    e.preventDefault()
    if (!notifForm.text.trim()) return alert('Enter notification text')
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(notifForm)
      })
      if (!res.ok) throw new Error(await res.text())
      setNotifForm({ text: '' })
      fetchAdminNotifications()
      alert('Notification sent!')
    } catch (err) { alert('Error: ' + err.message) }
  }

  async function handleDeleteNotification(id) {
    if (!window.confirm('Delete this notification?')) return
    try {
      await fetch(`${API_URL}/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchAdminNotifications()
    } catch (err) { console.error(err) }
  }

  async function handleAction(id, action) {
    try {
      await fetch(`${API_URL}/api/admin/reviews/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchReviews()
    } catch (err) { console.error(err) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await fetch(`${API_URL}/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchReviews()
    } catch (err) { console.error(err) }
  }

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
        <form onSubmit={handleLogin} style={{ background: 'var(--bg-card)', padding: '48px 40px', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
          <div style={{ color: '#1e3fd1', fontWeight: 900, fontSize: '32px', marginBottom: '8px', fontFamily: '"Poppins", sans-serif' }}>CASEILY</div>
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
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--ink-strong)' }}>{r.name}</div>
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
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button onClick={() => handleAction(r.id, 'approve')} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#22c55e', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✓ Approve</button>
            <button onClick={() => handleAction(r.id, 'reject')} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#ef4444', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✕ Reject</button>
          </div>
        )}
        {r.status !== 'pending' && (
          <div style={{ marginBottom: '12px' }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', background: r.status === 'approved' ? '#dcfce7' : '#fee2e2', color: r.status === 'approved' ? '#16a34a' : '#dc2626' }}>
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </span>
          </div>
        )}
        <button onClick={() => handleDelete(r.id)} style={{ width: '100%', padding: '10px', borderRadius: '12px', background: '#f8fafc', color: '#dc2626', fontWeight: '600', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '14px' }}>🗑️ Delete Review</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ background: 'var(--bg-card)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#1e3fd1', fontWeight: 900, fontSize: '24px', fontFamily: '"Poppins", sans-serif' }}>CASEILY</div>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setAdminTab('reviews')} style={{ padding: '8px 12px', borderRadius: '10px', background: adminTab === 'reviews' ? '#1e3fd1' : 'transparent', color: adminTab === 'reviews' ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Reviews</button>
          <button onClick={() => setAdminTab('insiders')} style={{ padding: '8px 12px', borderRadius: '10px', background: adminTab === 'insiders' ? '#1e3fd1' : 'transparent', color: adminTab === 'insiders' ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Insiders</button>
          <button onClick={() => setAdminTab('notifications')} style={{ padding: '8px 12px', borderRadius: '10px', background: adminTab === 'notifications' ? '#1e3fd1' : 'transparent', color: adminTab === 'notifications' ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Notifications</button>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>
          <button onClick={adminTab === 'reviews' ? fetchReviews : adminTab === 'insiders' ? fetchInsiders : fetchAdminNotifications} style={{ padding: '8px 12px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#334155' }}>↻ Refresh</button>
          <button onClick={() => { window.location.href = '/' }} style={{ padding: '8px 12px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#334155' }}>← Site</button>
          <button onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: '10px', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        {adminTab === 'reviews' ? (
          loadingReviews ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading reviews...</p>
          ) : (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Pending Reviews ({pending.length})</h2>
              {pending.length === 0 && <p style={{ color: '#94a3b8', marginBottom: '32px' }}>No pending reviews.</p>}
              <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
                {pending.map(r => <ReviewCard key={r.id} r={r} />)}
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Approved ({approved.length})</h2>
              <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
                {approved.map(r => <ReviewCard key={r.id} r={r} />)}
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Rejected ({rejected.length})</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {rejected.map(r => <ReviewCard key={r.id} r={r} />)}
              </div>
            </>
          )
        ) : adminTab === 'insiders' ? (
          <>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Create Insider Post</h2>
              <form onSubmit={handleCreateInsider} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <select value={insiderForm.type} onChange={e => setInsiderForm({...insiderForm, type: e.target.value})} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <option value="text">Text Post</option>
                  <option value="image">Image Post</option>
                </select>
                
                <textarea placeholder="Post content..." value={insiderForm.content} onChange={e => setInsiderForm({...insiderForm, content: e.target.value})} rows={3} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', resize: 'vertical' }} required />
                
                {(insiderForm.type === 'image' || insiderForm.type === 'text') && (
                  <input type="file" accept="image/*" multiple onChange={e => setInsiderPhotos(e.target.files)} style={{ padding: '8px' }} />
                )}
                
                <button type="submit" style={{ padding: '12px', borderRadius: '12px', background: '#1e3fd1', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Create Post</button>
              </form>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Active Posts ({insiders.length})</h2>
            {loadingInsiders ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {insiders.map(post => (
                  <div key={post.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{new Date(post.created_at).toLocaleString()} • {post.type.toUpperCase()}</div>
                    {post.type === 'text' ? (
                      <p style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '500', color: 'var(--ink-strong)', wordBreak: 'break-word' }}>{post.content}</p>
                    ) : (
                      <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}>{post.content}</p>
                    )}
                    {post.images && post.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px' }}>
                        {post.images.map((img, idx) => (
                          <img key={idx} src={`${API_URL}/uploads/${img}`} alt="Post" style={{ width: '100%', maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                        ))}
                      </div>
                    )}
                    <button onClick={() => handleDeleteInsider(post.id)} style={{ padding: '8px 12px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : adminTab === 'notifications' ? (
          <>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Broadcast Notification</h2>
              <form onSubmit={handleCreateNotification} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" placeholder="Enter notification text..." value={notifForm.text} onChange={e => setNotifForm({text: e.target.value})} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} required />
                <button type="submit" style={{ padding: '12px', borderRadius: '12px', background: '#1e3fd1', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Send Notification</button>
              </form>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Active Notifications ({adminNotifications.length})</h2>
            {loadingNotifications ? <p>Loading...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {adminNotifications.map(n => (
                  <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', background: '#f8fafc' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#334155' }}>{n.text}</p>
                    <button onClick={() => handleDeleteNotification(n.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                  </div>
                ))}
                {adminNotifications.length === 0 && <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No active notifications.</p>}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════
// APP
// ═════════════════════════════════════════════════════════════════════════

function HappyCustomers() {
  const customers = [
    '/customers/c1.png',
    '/customers/c2.png',
    '/customers/c3.png',
    '/customers/c4.png',
    '/customers/c5.png'
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % customers.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [customers.length]);

  return (
    <section className="section" style={{ padding: '20px 0', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
        <span style={{fontSize: '24px'}}>😄</span>
        <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0, background: 'linear-gradient(90deg, #ff8a00, #e52e71)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Caseily Insider
        </h2>
      </div>
      <div style={{ position: 'relative', width: '100%', maxWidth: '350px', margin: '0 auto', aspectRatio: '3/4', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        {customers.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Happy Customer ${index + 1}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              zIndex: index === currentIndex ? 1 : 0
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
        {customers.map((_, index) => (
          <div
            key={index}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: index === currentIndex ? '#e52e71' : '#e2e8f0',
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
      </div>
    </section>
  );
}


function App() {
  // ─── Routing ─────────────────────────────────────────────────────────
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [notifications, setNotifications] = useState([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    fetch(`${API_URL || ''}/api/notifications`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || [])
        if (data.notifications && data.notifications.length > 0) setHasUnread(true)
      })
      .catch(console.error)
  }, [currentPath])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false)
      }
    }
    if (showNotifDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showNotifDropdown])


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
  const [activeReelNum, setActiveReelNum] = useState(null)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [selectedReview, setSelectedReview] = useState(null)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [backendReels, setBackendReels] = useState([])
  const handleLikeToggle = (i, e) => {
    e.stopPropagation();
    setLikedPosts(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  // ─── Review form state ───────────────────────────────────────────────
  const [reviewForm, setReviewForm] = useState({ name: '', city: '', stars: 5, quote: '' })
  const [reviewPhoto, setReviewPhoto] = useState(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // ─── Approved reviews from backend ───────────────────────────────────
  const [approvedReviews, setApprovedReviews] = useState([])
  const [insidersPosts, setInsidersPosts] = useState([])
  const [commentInput, setCommentInput] = useState({})
  const [userPostForm, setUserPostForm] = useState({ type: 'text', content: '' })
  const [userPostPhotos, setUserPostPhotos] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/insiders`)
      .then(r => r.json())
      .then(data => setInsidersPosts(data.posts || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/api/reviews/approved`)
      .then(r => r.json())
      .then(data => setApprovedReviews(data.reviews || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/api/reels`)
      .then(r => r.json())
      .then(data => setBackendReels(data.reels || []))
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



  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromoIndex(prev => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(timer)
  }, [])


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
  const combinedReviews = [
    ...FALLBACK_REVIEWS,
    ...approvedReviews.map(r => ({
      name: r.name || 'Anonymous',
      time: 'Just now',
      text: r.quote,
      image: r.photo ? `${API_URL}/uploads/${r.photo}` : null,
      likes: (r.quote.length * 7) % 200 + 15,
      comments: (r.quote.length * 3) % 20 + 2
    }))
  ];

  const renderReviewForm = () => (
    <section id="write-review" style={{ padding: '0 20px', maxWidth: '800px', margin: '40px auto' }}>
      <h2 style={{ margin: '0 0 16px 8px', fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)', letterSpacing: '-0.5px' }}>Write a review</h2>
      <div style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '32px', padding: '28px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
        {reviewSuccess ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#22c55e', marginBottom: '8px' }}>Review submitted successfully!</h3>
            <p style={{ color: 'var(--ink-muted)', fontSize: '15px' }}>Thank you for your feedback. It will appear once approved.</p>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="review-form-grid">
              <input
                type="text" placeholder="Your name *" required
                value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                style={{ padding: '14px 18px', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '15px', outline: 'none', background: 'var(--bg-default)', color: 'var(--ink-strong)' }}
              />
              <input
                type="text" placeholder="City (optional)"
                value={reviewForm.city} onChange={e => setReviewForm(f => ({ ...f, city: e.target.value }))}
                style={{ padding: '14px 18px', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '15px', outline: 'none', background: 'var(--bg-default)', color: 'var(--ink-strong)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--ink)', marginBottom: '8px' }}>Rating</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={() => setReviewForm(f => ({ ...f, stars: s }))} style={{ cursor: 'pointer', fontSize: '28px', color: s <= reviewForm.stars ? '#f59e0b' : 'var(--border)', transition: 'transform 0.15s' }}>
                    {s <= reviewForm.stars ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Write your review... *" required
              value={reviewForm.quote} onChange={e => setReviewForm(f => ({ ...f, quote: e.target.value }))}
              rows={4}
              style={{ padding: '14px 18px', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '15px', outline: 'none', resize: 'vertical', background: 'var(--bg-default)', color: 'var(--ink-strong)', fontFamily: 'inherit' }}
            />
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '16px', border: '1px dashed var(--ink-muted)', cursor: 'pointer', background: 'var(--bg-default)', color: 'var(--ink-muted)', fontSize: '15px' }}>
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
  )

  const renderCommunityWallCard = (post, i) => (
    <div key={i} className="cw-card" onClick={() => { if (currentPath === '/reviews') { setSelectedReview(post); window.history.pushState({}, '', '/review-detail'); setCurrentPath('/review-detail'); window.scrollTo(0, 0); } else { window.history.pushState({}, '', '/reviews'); setCurrentPath('/reviews'); window.scrollTo(0, 0); } }}>
      <div className="cw-user">
        <img className="cw-avatar" src={`https://ui-avatars.com/api/?name=${post.name}&background=random`} alt={post.name} />
        <div className="cw-meta">
          <div className="cw-name">{post.name}</div>
          <div className="cw-time">{post.time}</div>
        </div>
        <div className="cw-dots">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </div>
      </div>
      {post.text && <div className="cw-text">{post.text}</div>}
      {post.image && <img className="cw-image" src={post.image} alt="Review" />}
      <div className="cw-footer">
        <div className="cw-action" onClick={(e) => handleLikeToggle(i, e)} style={{ color: likedPosts.has(i) ? '#ef4444' : 'currentColor', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={likedPosts.has(i) ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>{post.likes + (likedPosts.has(i) ? 1 : 0)}</span>
        </div>
      </div>
    </div>
  )

  if (currentPath === '/review-detail' && selectedReview) {
    const post = selectedReview;
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ paddingTop: '20px', flex: 1, backgroundColor: 'var(--bg-default)' }}>
          <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <button onClick={() => { window.history.pushState({}, '', '/reviews'); setCurrentPath('/reviews'); window.scrollTo(0, 0); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'var(--ink-strong)' }}>Review</h2>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              {/* User Info */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <img src={`https://ui-avatars.com/api/?name=${post.name}&background=random&size=64`} alt={post.name} style={{ width: '56px', height: '56px', borderRadius: '50%', marginRight: '16px' }} />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)' }}>{post.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--ink-muted)', marginTop: '2px' }}>{post.time}</div>
                </div>
              </div>

              {/* Full Review Text */}
              <div style={{ fontSize: '16px', lineHeight: 1.7, color: '#334155', marginBottom: post.image ? '20px' : '20px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {post.text}
              </div>

              {/* Review Image */}
              {post.image && (
                <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
                  <img src={post.image} alt="Review photo" style={{ width: '100%', display: 'block', borderRadius: '16px', objectFit: 'cover' }} />
                </div>
              )}

              {/* Likes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', color: 'var(--ink-muted)', fontSize: '15px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span style={{ fontWeight: '600' }}>{post.likes} likes</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (currentPath === '/deal-detail' && selectedDeal) {
    const isVideo = selectedDeal.num === 1;
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ flex: 1, backgroundColor: 'var(--bg-default)' }}>
          {isVideo ? (
            <div style={{ width: '100%', height: '400px', backgroundColor: '#000', position: 'relative' }}>
              <video src="/deal_of_the_day/video.mp4" autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/'); window.scrollTo(0,0); }} style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&larr;</button>
            </div>
          ) : (
            <div style={{ width: '100%', height: '400px', backgroundColor: '#f1f5f9', position: 'relative' }}>
              <img src={`/deal_of_the_day/img${selectedDeal.num}.jpg`} alt="Deal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/'); window.scrollTo(0,0); }} style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'var(--ink-strong)', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&larr;</button>
            </div>
          )}
          <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)', marginBottom: '16px' }}>Deal of the Day</h2>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, marginBottom: '32px' }}>
              Get up to 50% off on our premium cases & accessories. This is a limited time offer available only for our community. Upgrade your setup today!
            </p>
            <a href="http://wa.me/c/919167788773" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', padding: '16px', borderRadius: '16px', fontSize: '18px', fontWeight: '700', width: '100%', boxSizing: 'border-box' }}>
              Shop Now via WhatsApp
            </a>
          </div>
        </main>
      </div>
    )
  }

  if (currentPath === '/reviews') {
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ paddingTop: '20px', flex: 1, backgroundColor: 'var(--bg-default)' }}>
           <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                 <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
                 <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)' }}>Community Wall</h2>
              </div>
              <div className="reviews-page-grid">
                  {combinedReviews.map((post, i) => renderCommunityWallCard(post, i))}
              </div>
           </div>
           
           {renderReviewForm()}
        </main>
      </div>
    )
  }

  if (currentPath === '/shop') {
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ paddingTop: '20px', flex: 1, backgroundColor: 'var(--bg-default)' }}>
           <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                 <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
                 <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)' }}>CaseilyPlus+ Shop</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: '#f1f5f9', height: '200px' }}>
                    <img src="/class_hero.jpg" alt="Accessories" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Accessorize your device...</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Explore latest Caseily accessories</p>
                  </div>
                </div>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: '#e6e6e6', height: '200px' }}>
                    <img src="/banner2_image.png" alt="Accessories" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Elevate your setup</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Simplify Connectivity. Boost Productivity.</p>
                  </div>
                </div>

                {/* New Categories */}
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: 'var(--bg-secondary)', height: '200px' }}>
                    <img src="/shop/car_accessories.png" alt="Car Accessories" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Car Accessories</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Mobile Stand | Charger & Cables</p>
                  </div>
                </div>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: 'var(--bg-secondary)', height: '200px' }}>
                    <img src="/shop/charging_accessories.png" alt="Charging Accessories" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Charging Accessories</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Powerbanks & Travel Chargers</p>
                  </div>
                </div>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: 'var(--bg-secondary)', height: '200px' }}>
                    <img src="/shop/ipad_accessories.png" alt="iPad Accessories" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>iPad Accessories</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>iPad Cases | Screen Protectors</p>
                  </div>
                </div>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: 'var(--bg-secondary)', height: '200px' }}>
                    <img src="/shop/watch_accessories.png" alt="Watch Accessories" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Watch Accessories</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Watch Strap | Screen Guard</p>
                  </div>
                </div>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: 'var(--bg-secondary)', height: '200px' }}>
                    <img src="/shop/phone_cases.png" alt="Phone Cases" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Phone Cases</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Phone Covers | Lens Protectors</p>
                  </div>
                </div>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: 'var(--bg-secondary)', height: '200px' }}>
                    <img src="/shop/buds_accessories.png" alt="Buds Accessories" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Buds Accessories</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Protective Buds Case</p>
                  </div>
                </div>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: 'var(--bg-secondary)', height: '200px' }}>
                    <img src="/shop/laptop_bags.png" alt="Laptop Bags" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Laptop Bags</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Premium Bags For Every Journey</p>
                  </div>
                </div>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: 'var(--bg-secondary)', height: '200px' }}>
                    <img src="/shop/audio_connectors.png" alt="Audio & Connectors" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>Audio & Connectors</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Earphones | Cables | Connectors</p>
                  </div>
                </div>
                <div className="shop-banner-card" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                  <div className="shop-banner-image" style={{ backgroundColor: 'var(--bg-secondary)', height: '200px' }}>
                    <img src="/shop/macbook_accessories.png" alt="Macbook Accessories" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="shop-banner-text" style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.2 }}>MacBook Accessories</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', lineHeight: 1.3 }}>Protection Case | Keyboard Guard</p>
                  </div>
                </div>

              </div>
            </div>
        </main>
      </div>
    )
  }

  if (currentPath === '/insiders') {
    const handleUserCreatePost = async (e) => {
      e.preventDefault()
      const form = new FormData()
      form.append('post_type', userPostForm.type)
      form.append('content', userPostForm.content)
      if (userPostPhotos && userPostPhotos.length > 0) {
        Array.from(userPostPhotos).forEach(file => {
          form.append('images', file)
        })
      }

      try {
        await fetch(`${API_URL}/api/insiders`, {
          method: 'POST',
          body: form
        })
        setUserPostForm({ type: 'text', content: '' })
        setUserPostPhotos([])
        const data = await fetch(`${API_URL}/api/insiders`).then(r => r.json())
        setInsidersPosts(data.posts || [])
      } catch (err) { console.error(err) }
    }

    const handleLike = async (postId) => {
      try {
        const res = await fetch(`${API_URL}/api/insiders/${postId}/like`, { method: 'POST' })
        if (res.ok) {
          const data = await fetch(`${API_URL}/api/insiders`).then(r => r.json())
          setInsidersPosts(data.posts || [])
        }
      } catch (err) { console.error(err) }
    }

    const handleComment = async (postId) => {
      const text = commentInput[postId]
      if (!text || !text.trim()) return;
      try {
        const res = await fetch(`${API_URL}/api/insiders/${postId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        })
        if (res.ok) {
          setCommentInput({ ...commentInput, [postId]: '' })
          const data = await fetch(`${API_URL}/api/insiders`).then(r => r.json())
          setInsidersPosts(data.posts || [])
        }
      } catch (err) { console.error(err) }
    }

    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
        <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid #dbdbdb', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center' }}>
          <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: '#262626' }}>&larr;</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '700', color: '#262626' }}>CASEILY Insiders</div>
          <div style={{ width: '24px' }}></div>
        </header>

        <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%', padding: '20px 0' }}>
          
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid #dbdbdb', marginBottom: '24px' }}>
            <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '12px', color: '#262626' }}>Create Post</div>
            <form onSubmit={handleUserCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select value={userPostForm.type} onChange={e => setUserPostForm({...userPostForm, type: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #efefef', background: '#fafafa', outline: 'none', fontSize: '14px' }}>
                <option value="text">Text Post</option>
                <option value="image">Image Post</option>
              </select>
              <textarea placeholder="What's on your mind?" value={userPostForm.content} onChange={e => setUserPostForm({...userPostForm, content: e.target.value})} rows={3} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #efefef', background: '#fafafa', outline: 'none', resize: 'vertical', fontSize: '14px' }} required />
              {(userPostForm.type === 'image' || userPostForm.type === 'text') && (
                <input type="file" accept="image/*" multiple onChange={e => setUserPostPhotos(e.target.files)} style={{ padding: '8px' }} />
              )}
              <button type="submit" style={{ padding: '10px', borderRadius: '8px', background: '#0095f6', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Post</button>
            </form>
          </div>

          {insidersPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8e8e8e' }}>No posts yet.</div>
          ) : (
            insidersPosts.map(post => {
              return (
                <article key={post.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid #dbdbdb', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #efefef' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>C</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#262626' }}>{post.author}</div>
                      <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{new Date(post.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {post.images && post.images.length > 0 && (
                    <div style={{ display: 'flex', overflowX: 'auto', snapType: 'x mandatory' }}>
                      {post.images.map((img, idx) => (
                        <div key={idx} style={{ minWidth: '100%', scrollSnapAlign: 'start' }}>
                          <img src={`${API_URL}/uploads/${img}`} alt="Post content" style={{ width: '100%', display: 'block', maxHeight: '600px', objectFit: 'contain', backgroundColor: '#000' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ padding: '16px' }}>
                    {post.type === 'text' && (
                      <p style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '500', color: 'var(--ink-strong)', lineHeight: '1.4', wordBreak: 'break-word' }}>
                        {post.content}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                      <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      </button>
                    </div>
                    
                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>{post.likes || 0} likes</div>

                    {post.type !== 'text' && (
                      <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#262626', lineHeight: '1.5', wordBreak: 'break-word' }}>
                        <span style={{ fontWeight: '600', marginRight: '6px' }}>{post.author}</span>
                        {post.content}
                      </p>
                    )}

                    {/* Comments Section */}
                    {post.comments && post.comments.length > 0 && (
                      <div style={{ marginBottom: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                        {post.comments.map(c => (
                          <div key={c.id} style={{ fontSize: '14px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '600', marginRight: '6px' }}>{c.author}</span>
                            {c.text}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', borderTop: '1px solid #efefef', paddingTop: '12px', marginTop: '12px' }}>
                      <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        value={commentInput[post.id] || ''}
                        onChange={e => setCommentInput({...commentInput, [post.id]: e.target.value})}
                        style={{ border: 'none', flex: 1, outline: 'none', fontSize: '14px' }}
                      />
                      <button 
                        onClick={() => handleComment(post.id)}
                        style={{ background: 'none', border: 'none', color: '#0095f6', fontWeight: '600', cursor: 'pointer', opacity: commentInput[post.id]?.trim() ? 1 : 0.5 }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </main>
      </div>
    )
  }

  if (currentPath === '/news') {
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ paddingTop: '20px', flex: 1, backgroundColor: 'var(--bg-default)' }}>
           <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                 <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
                 <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)' }}>News and tips</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
                {BLOGS.map((b, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', backgroundColor: b.color }}>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#3b82f6', marginBottom: '8px', textTransform: 'uppercase' }}>{b.category}</span>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--ink-strong)', lineHeight: 1.4 }}>{b.title}</h3>
                  </div>
                ))}
              </div>
           </div>
        </main>
      </div>
    )
  }

  if (['/exclusive-drops', '/loyalty-points'].includes(currentPath)) {
    const titles = {
      '/exclusive-drops': 'Exclusive Drops',
      '/loyalty-points': 'Loyalty Points'
    }
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ paddingTop: '20px', flex: 1, backgroundColor: 'var(--bg-default)' }}>
           <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                 <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
                 <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)' }}>{titles[currentPath]}</h2>
              </div>
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '18px', color: 'var(--ink-muted)' }}>Coming soon...</p>
              </div>
           </div>
        </main>
      </div>
    )
  }

  if (currentPath === '/track-order') {
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ paddingTop: '20px', flex: 1, backgroundColor: 'var(--bg-default)' }}>
          <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)' }}>Track Your Order</h2>
            </div>

            {/* Hero (Tic Tac Toe) */}
            <TicTacToe />

            {/* Tracking Card */}
            <div className="tracking-card" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '32px', padding: '24px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '32px', padding: '0 20px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" style={{ flex: 1, border: 'none', background: 'transparent', padding: '16px 12px', fontSize: '16px', outline: 'none' }} placeholder="Enter your tracking number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTrack()} />
              </div>

              <div style={{ position: 'relative', marginBottom: '24px' }} ref={dropdownRef}>
                <button type="button" onClick={() => { setCourierOpen(o => !o); setCourierSearch('') }} style={{ width: '100%', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '32px', padding: '16px 20px', border: '1px solid #f1f5f9', color: '#64748b', fontSize: '16px', cursor: 'pointer' }}>
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

              {/* Results */}
              {showResults && (
                <div className="results-section" style={{ marginTop: '24px' }}>
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
                      {result.events && result.events.length > 0 && (
                        <div className="timeline">
                          {result.events.map((evt, i) => (
                            <div key={i} className={`timeline-item ${i === 0 ? 'active' : ''}`}>
                              <div className="timeline-dot" />
                              <div className="timeline-content">
                                <div className="timeline-date">{new Date(evt.datetime).toLocaleString()}</div>
                                <div className="timeline-desc">{evt.description}</div>
                                {evt.location && <div className="timeline-loc">📍 {evt.location}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (currentPath === '/bulk-order') {
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ paddingTop: '20px', flex: 1, backgroundColor: 'var(--bg-default)' }}>
           <div className="container" style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                 <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
                 <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)' }}>Bulk Order</h2>
              </div>

              {/* Hero Banner Image */}
              <div style={{ marginBottom: '24px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}>
                <img src="/bulk_banner.jpg" alt="Your Reliable Partner for Bulk Orders" style={{ width: '100%', display: 'block', height: 'auto' }} />
              </div>

              {/* Connect Info */}
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '32px', padding: '28px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                  Connect with us directly on WhatsApp to get verified and gain access to our exclusive catalog, channel, and community links.
                </p>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)', margin: '0 0 16px 0' }}>📱 How to Register via WhatsApp:</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                  Send a message to <span style={{ fontWeight: '800', color: '#1e3fd1' }}>+91 9987759029</span> with the following details:
                </p>
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0' }}>
                  {[
                    'Your Name',
                    'Shop / Business Name',
                    'Business Type (Online or Retail / Offline)',
                    'Location / City',
                    'Visiting Card / Shop Board Photo (Attach image/document)'
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: i < 4 ? '1px solid #e2e8f0' : 'none' }}>
                      <span style={{ color: '#1e3fd1', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '32px', padding: '28px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)', margin: '0 0 20px 0' }}>Next Steps & Support Hours</h3>
                
                <div style={{ backgroundColor: '#dbeafe', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>✅</span>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#1e3a8a' }}>Verification</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#1e40af', lineHeight: 1.5 }}>Once your business details are reviewed and verified, we will share the exclusive WhatsApp channel and community links.</p>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', borderRadius: '20px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🕐</span>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#166534' }}>Operating Hours</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#15803d', lineHeight: 1.5 }}>Monday to Saturday | 10:00 AM – 8:00 PM</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.4, fontStyle: 'italic' }}>(Queries received on Sundays or after hours will be addressed on the next business day.)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <a href="https://wa.me/919987759029?text=Hi%2C%20I%27d%20like%20to%20register%20for%20wholesale%20%2F%20bulk%20orders.%0A%0AMy%20Name%3A%0AShop%20%2F%20Business%20Name%3A%0ABusiness%20Type%3A%0ALocation%20%2F%20City%3A" target="_blank" rel="noreferrer" style={{ display: 'inline-block', backgroundColor: '#25D366', color: '#fff', padding: '18px 32px', borderRadius: '32px', fontSize: '17px', fontWeight: '800', textDecoration: 'none', width: '100%', boxSizing: 'border-box', boxShadow: '0 8px 24px rgba(37,211,102,0.3)' }}>💬 Register on WhatsApp</a>
              </div>

           </div>
        </main>
      </div>
    )
  }

  if (currentPath === '/events') {
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ paddingTop: '20px', flex: 1, backgroundColor: 'var(--bg-default)' }}>
           <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                 <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
                 <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)' }}>Apple Event</h2>
              </div>
              
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <h3 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>Event starts in:</h3>
                <EventCountdown />
              </div>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {/* Video Column */}
                <div style={{ flex: '1 1 100%', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
                  <iframe style={{ width: '100%', height: '600px', flex: 1 }} src="https://www.youtube.com/embed/39BalPDuTo0" title="Apple Event" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
              </div>
           </div>
        </main>
      </div>
    )
  }

  if (currentPath === '/creators-club') {
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main" style={{ paddingTop: '20px', flex: 1, backgroundColor: 'var(--bg-default)' }}>
           <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                 <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
                 <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)' }}>Creators Club</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#ebf5ff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <p style={{ margin: 0, fontSize: '15px', color: '#1e3a8a', fontWeight: '600', flex: '1 1 200px' }}>Interested in partnering? Connect with us on WhatsApp.</p>
                  <a href="https://wa.me/919987759591" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#25D366', color: '#ffffff', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    WhatsApp Us
                  </a>
                </div>
                <img src="/creators-club/hero.png" alt="Become a Caseilyplus+ Creator Partner" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #f1f5f9' }} />
                <img src="/creators-club/how_it_works.png" alt="How it works" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #f1f5f9' }} />
                <img src="/creators-club/free_product.png" alt="Free product" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #f1f5f9' }} />
                <img src="/creators-club/early_access.png" alt="Early access" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #f1f5f9' }} />
                <img src="/creators-club/commissions.png" alt="Commissions" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #f1f5f9' }} />
                <img src="/creators-club/arc_campaigns.png" alt="Arc campaigns" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #f1f5f9' }} />
                <img src="/creators-club/long_term.png" alt="Long term partnerships" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', border: '1px solid #f1f5f9' }} />
              </div>
           </div>
        </main>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════
  const allReels = [
    ...FALLBACK_REELS.map((r, i) => ({ ...r, index: i })),
    ...backendReels.map((r, i) => ({ 
      id: r.id, 
      videoSrc: r.is_local_promo ? `/${r.video}` : `${API_URL}/uploads/${r.video}`, 
      text: r.caption, 
      index: i + FALLBACK_REELS.length 
    }))
  ];

  return (
    <div className="app-wrapper">
      <SplashScreen />

      <div style={{ backgroundColor: 'var(--accent)', position: 'relative', zIndex: 1, paddingBottom: '80px' }}>
        {/* ─── NAVBAR ─── */}
        <nav className="navbar" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid #e2e8f0' }}>
          <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button ref={notifRef} onClick={() => { setShowNotifDropdown(!showNotifDropdown); setHasUnread(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink-strong)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: hasUnread ? 'swing 2s ease-in-out infinite' : 'none' }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {hasUnread && <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-default)' }} />}
              </button>
              {showNotifDropdown && (
                <div style={{ position: 'absolute', top: '40px', left: '0', width: '280px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '16px', zIndex: 999999, border: '1px solid var(--nav-border)', animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: 'var(--ink-strong)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notifications</h4>
                  {notifications.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '14px', color: 'var(--ink-strong)', fontWeight: '500' }}>
                          {n.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '10px 0' }}>No new notifications</p>
                  )}
                </div>
              )}
            </div>
            <div className="desktop-logo" style={{ color: '#1e3fd1', fontWeight: 900, fontSize: '28px', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }}>CASEILY</div>
          </div>
          <div className="navbar-links">
            {['track','reviews','blog','community','faq'].map(id => (
              <button key={id} className={`navbar-link ${activeSection === id ? 'active' : ''}`} onClick={() => scrollTo(id)} style={{ color: 'var(--ink-strong)' }}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
          <div className="navbar-right">
            <button className="theme-toggle" onClick={translateToHindi} aria-label="Translate to Hindi" title="Translate to Hindi" style={{ marginRight: '8px', color: 'var(--ink-strong)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
            </button>
            <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle theme" style={{ color: 'var(--ink-strong)' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <a href="https://wa.me/919987759591" target="_blank" rel="noopener noreferrer" className="navbar-cta" style={{ backgroundColor: '#bfdbfe', color: 'var(--ink-strong)' }}>Contact us</a>
          </div>
        </nav>

        {/* ─── MOBILE HEADER ─── */}
        <div className="mobile-app-header" style={{ justifyContent: 'center', backgroundColor: 'var(--bg-card)', padding: '16px 20px', width: '100%', boxSizing: 'border-box', position: 'relative', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
          <div ref={notifRef} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            <button onClick={() => { setShowNotifDropdown(!showNotifDropdown); setHasUnread(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink-strong)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: hasUnread ? 'swing 2s ease-in-out infinite' : 'none' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {hasUnread && <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-default)' }} />}
            </button>
            {showNotifDropdown && (
              <div style={{ position: 'absolute', top: '40px', left: '0', width: '280px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '16px', zIndex: 999999, border: '1px solid var(--nav-border)', animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: 'var(--ink-strong)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notifications</h4>
                {notifications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '14px', color: 'var(--ink-strong)', fontWeight: '500' }}>
                        {n.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '10px 0' }}>No new notifications</p>
                )}
              </div>
            )}
          </div>
          <div className="desktop-logo" style={{ color: '#1e3fd1', fontWeight: 900, fontSize: '24px', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }}>CASEILY</div>
          
          <div style={{ position: 'absolute', right: '20px', display: 'flex', alignItems: 'center', gap: '12px' }} ref={shortcutRef}>
            <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle theme" style={{ backgroundColor: 'transparent', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'var(--ink-strong)', fontSize: '20px' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="theme-toggle" onClick={() => setShortcutMenuOpen(o => !o)} aria-label="Menu" style={{ backgroundColor: 'transparent', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#1e3fd1' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
            {shortcutMenuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '44px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', padding: '8px', width: '160px', zIndex: 100, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <button type="button" onClick={() => { setShortcutMenuOpen(false); translateToHindi(); }} style={{ background: 'none', border: 'none', padding: '10px 12px', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: 'var(--ink-strong)' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>Change lang</button>
                <button type="button" onClick={() => { setShortcutMenuOpen(false); scrollTo('what-we-provide'); }} style={{ background: 'none', border: 'none', padding: '10px 12px', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: 'var(--ink-strong)' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>About us</button>
                <button type="button" onClick={() => { setShortcutMenuOpen(false); scrollTo('faq'); }} style={{ background: 'none', border: 'none', padding: '10px 12px', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: 'var(--ink-strong)' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>Faq</button>
                <button type="button" onClick={() => { setShortcutMenuOpen(false); window.open('https://twitter.com/caseily', '_blank'); }} style={{ background: 'none', border: 'none', padding: '10px 12px', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: 'var(--ink-strong)' }} onMouseEnter={e => e.target.style.backgroundColor='#f1f5f9'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>Follow us</button>
              </div>
            )}
          </div>
        </div>

        {/* ─── ANNOUNCEMENT BAR ─── */}
        <div style={{ width: '100%', backgroundColor: '#1e3a8a', color: '#ffffff', padding: '8px 0', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <marquee scrollamount="12" style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', width: '100%' }}>
            🎉 FLAT 21% OFFER ON ALL SILICON CASES — GET YOURS NOW 🎉 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 🎉 FLAT 21% OFFER ON ALL SILICON CASES — GET YOURS NOW 🎉
          </marquee>
        </div>

        {/* ─── HERO TITLE ─── */}
        <div className="container" style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
          <h1 className="hero-heading" style={{ color: '#ffffff', margin: 0, fontSize: '32px', lineHeight: '1.2' }}>
            The Ultimate Hub for Premium Cases.<br/>Live Tracking. Community Reviews.<br/>Creator Partnerships.
          </h1>
          <p className="hero-subtitle desktop-only" style={{ color: 'rgba(255,255,255,0.8)', marginTop: '16px' }}>
            Everything you need, right here.
          </p>
        </div>
      </div>

      <section id="track" style={{ position: 'relative', zIndex: 10, marginTop: '-64px', padding: '0 20px 40px' }}>
        
        {/* ─── AUTO-MOVING PROMO CAROUSEL ─── */}
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto 24px auto' }}>
          <div style={{ overflow: 'hidden', borderRadius: '32px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ 
              display: 'flex', 
              width: '300%', 
              transform: `translateX(-${currentPromoIndex * 33.3333}%)`, 
              transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' 
            }}>
              <div style={{ width: '33.3333%', flexShrink: 0, aspectRatio: '16/9' }}>
                <img src="/banner_apple.png" alt="Apple Event" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
              </div>
              <div style={{ width: '33.3333%', flexShrink: 0, aspectRatio: '16/9' }}>
                <img src="/banner_galaxy.png" alt="Galaxy Z Fold7" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
              </div>
              <div style={{ width: '33.3333%', flexShrink: 0, aspectRatio: '16/9' }}>
                <img src="/banner_fold.png" alt="Galaxy Fold" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>


            {/* ─── BOTTOM NAV PILL ─── */}
            <div className="mobile-dashboard" style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--bg-card)', borderRadius: '32px', padding: '12px 24px', display: 'flex', alignItems: 'center', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', zIndex: 100, width: 'max-content', maxWidth: '90vw', justifyContent: 'space-between' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: activeSection === 'track' ? 'var(--accent)' : 'transparent', color: activeSection === 'track' ? '#ffffff' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => scrollTo('track')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <div style={{ color: activeSection === 'reviews' ? '#ffffff' : 'var(--accent)', backgroundColor: activeSection === 'reviews' ? 'var(--accent)' : 'transparent', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => scrollTo('reviews')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div style={{ color: activeSection === 'blog' ? '#ffffff' : 'var(--accent)', backgroundColor: activeSection === 'blog' ? 'var(--accent)' : 'transparent', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => scrollTo('blog')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              
              <div style={{ color: 'var(--accent)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '50%' }} onClick={() => { window.history.pushState({}, '', '/insiders'); setCurrentPath('/insiders'); window.scrollTo(0, 0); }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
            </div>

          {/* ─── QUICK LINKS BAR ─── */}
          <div className="quick-links-bar" style={{ marginTop: '24px', justifyContent: 'center' }}>
            <button className="quick-link-btn active" onClick={() => scrollTo('highlights')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>The Community Wall</span>
            </button>
            <button className="quick-link-btn" onClick={() => { window.history.pushState({}, '', '/track-order'); setCurrentPath('/track-order'); window.scrollTo(0, 0); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <span>Track Your Order</span>
            </button>
            <button className="quick-link-btn" onClick={() => { window.history.pushState({}, '', '/reviews'); setCurrentPath('/reviews'); window.scrollTo(0, 0); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Post a Review</span>
            </button>
            <button className="quick-link-btn" onClick={() => scrollTo('blog')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>Techblogs & News</span>
            </button>
            <button className="quick-link-btn" onClick={() => scrollTo('deal-of-the-day')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              <span>Deal of the Day</span>
            </button>
            <button className="quick-link-btn" onClick={() => { window.history.pushState({}, '', '/creators-club'); setCurrentPath('/creators-club'); window.scrollTo(0, 0); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              <span>Creators Club</span>
            </button>
            <button className="quick-link-btn" onClick={() => { window.history.pushState({}, '', '/loyalty-points'); setCurrentPath('/loyalty-points'); window.scrollTo(0, 0); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              <span>Loyalty Points</span>
            </button>
            <button className="quick-link-btn" onClick={() => { window.history.pushState({}, '', '/bulk-order'); setCurrentPath('/bulk-order'); window.scrollTo(0, 0); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <span>Bulk Order</span>
            </button>
            <button className="quick-link-btn" onClick={() => { window.history.pushState({}, '', '/events'); setCurrentPath('/events'); window.scrollTo(0, 0); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>Events</span>
            </button>
          </div>
          
      </section>

      {/* ─── INSTAGRAM HIGHLIGHTS ─── */}
      <section id="highlights" className="highlights-section">
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}><span style={{fontSize: '24px'}}>✨</span><h2 className="highlights-title" style={{ fontSize: '24px', fontWeight: '900', margin: 0, background: 'linear-gradient(90deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Spotlight</h2></div>
        <div className="highlights-scroll" style={{ gap: '20px' }}>
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
                <div className="highlight-ring" style={{ background: 'none', border: '2px solid #2563eb', padding: '4px' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={h.cover} alt={h.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
                <span className="highlight-label" style={{ fontWeight: '600' }}>{h.label}</span>
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

      {/* ─── TRENDING REELS ─── */}
      <section id="trending-reels" className="section" style={{ padding: '10px 20px 40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}><span style={{fontSize: '24px'}}>🔥</span><h2 className="highlights-title" style={{ fontSize: '24px', fontWeight: '900', margin: 0, background: 'linear-gradient(90deg, #ef4444, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trending Reels</h2></div>
        <div className="cw-scroll" style={{ padding: '8px', display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', width: '100%', touchAction: 'pan-x' }}>
          {allReels.map((item) => (
            <div key={item.id} onClick={() => setActiveReelNum(item.index)} style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              backgroundColor: '#000', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              position: 'relative',
              flex: '0 0 45%',
              minWidth: '140px',
              maxWidth: '240px',
              aspectRatio: '9/16',
              cursor: 'pointer',
              scrollSnapAlign: 'start'
            }}>
              <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
              </div>
              <video 
                src={item.videoSrc} 
                muted
                autoPlay
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
              ></video>
              <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '30px 12px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', color: '#fff', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', zIndex: 2 }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reel Viewer Modal */}
      {activeReelNum !== null && (
        <ReelViewer
          initialNum={activeReelNum}
          allReels={allReels}
          onClose={() => setActiveReelNum(null)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════
         COMMUNITY WALL
         ═══════════════════════════════════════════════════════════════ */}
      <section id="reviews" className="community-wall-section">
        <div className="cw-header-row">
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', justifyContent: 'center'}}><span style={{fontSize: '24px'}}>💬</span><h2 className="cw-title" style={{ margin: 0, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Community Wall</h2></div>
          <a className="cw-show-all" onClick={() => { window.history.pushState({}, '', '/reviews'); setCurrentPath('/reviews'); window.scrollTo(0, 0); }}>Show all</a>
        </div>
        <div className="cw-scroll">
          {combinedReviews.map((post, i) => renderCommunityWallCard(post, i))}
        </div>
      </section>

      {/* ─── DEAL OF THE DAY ─── */}
      <section id="deal-of-the-day" className="section" style={{ padding: '40px 0 40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', margin: 0}}><span style={{fontSize: '20px'}}>🛍️</span><h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0, background: 'linear-gradient(90deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Deal of the Day</h2></div>
          <a href="http://wa.me/c/919167788773" target="_blank" rel="noreferrer" style={{ fontSize: '13px', fontWeight: '600', color: '#1e3fd1', textDecoration: 'none' }}>View all</a>
        </div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 20px 20px', WebkitOverflowScrolling: 'touch' }}>
          {[1, 2, 3].map(num => (
            <div key={num} onClick={() => { setSelectedDeal({num}); window.history.pushState({}, '', '/deal-detail'); setCurrentPath('/deal-detail'); window.scrollTo(0,0); }} style={{
              flex: '0 0 85%',
              maxWidth: '320px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}>
              <div style={{ flex: 1, paddingRight: '12px' }}>
                <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--ink-strong)', marginBottom: '4px' }}>Deal of the Day</div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4, marginBottom: '12px' }}>
                  Get up to 50% off on our premium cases & accessories. Shop now!
                </div>
                <a href="http://wa.me/c/919167788773" onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ display: 'inline-block', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: '600' }}>
                  Shop Now
                </a>
              </div>
              <div style={{ width: '90px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                {num === 1 ? (
                  <video src="/deal_of_the_day/video.mp4" autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={`/deal_of_the_day/img${num}.jpg`} alt="Deal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── OUR HAPPY CUSTOMERS ─── */}
      <HappyCustomers />

      {/* ═══════════════════════════════════════════════════════════════
         SHOP BANNER
         ═══════════════════════════════════════════════════════════════ */}
      <section id="shop-banner" style={{ padding: '0 20px', maxWidth: '800px', margin: '60px auto 40px auto' }}>
        <div onClick={() => { window.history.pushState({}, '', '/shop'); setCurrentPath('/shop'); window.scrollTo(0, 0); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px', cursor: 'pointer' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}><span style={{fontSize: '28px'}}>🛒</span><h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>CaseilyPlus+ shop</h2></div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-strong)' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        
        <div style={{ overflowX: 'auto', display: 'flex', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          {/* Banner 1 */}
          <div onClick={() => { window.history.pushState({}, '', '/shop'); setCurrentPath('/shop'); window.scrollTo(0, 0); }} style={{ width: '100%', flex: '0 0 100%', scrollSnapAlign: 'start', padding: '0 4px', boxSizing: 'border-box' }}>
            <div className="shop-banner-card">
              <div className="shop-banner-text" style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: '900', color: '#000000', lineHeight: 1.2, whiteSpace: 'normal', overflowWrap: 'break-word' }}>Accessorize your device...</h3>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#000000', lineHeight: 1.3, whiteSpace: 'normal', overflowWrap: 'break-word' }}>Explore latest Caseily accessories</p>
              </div>
              <div className="shop-banner-image" style={{ backgroundColor: '#f1f5f9' }}>
                <img src="/class_hero.jpg" alt="Accessories" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* Banner 2 */}
          <div onClick={() => { window.history.pushState({}, '', '/shop'); setCurrentPath('/shop'); window.scrollTo(0, 0); }} style={{ width: '100%', flex: '0 0 100%', scrollSnapAlign: 'start', padding: '0 4px', boxSizing: 'border-box' }}>
            <div className="shop-banner-card">
              <div className="shop-banner-text" style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: '900', color: '#000000', lineHeight: 1.2, whiteSpace: 'normal', overflowWrap: 'break-word' }}>Elevate your setup</h3>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#000000', lineHeight: 1.3, whiteSpace: 'normal', overflowWrap: 'break-word' }}>Simplify Connectivity. Boost Productivity.</p>
              </div>
              <div className="shop-banner-image" style={{ backgroundColor: '#e6e6e6' }}>
                <img src="/banner2_image.png" alt="Accessories" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         BLOG
         ═══════════════════════════════════════════════════════════════ */}
      <section id="blog" style={{ padding: '0 20px', maxWidth: '800px', margin: '40px auto' }}>
        <div onClick={() => { window.history.pushState({}, '', '/news'); setCurrentPath('/news'); window.scrollTo(0, 0); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px', cursor: 'pointer' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}><span style={{fontSize: '28px'}}>📰</span><h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', background: 'linear-gradient(90deg, #14b8a6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>News and tips</h2></div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-strong)' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '32px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {BLOGS.map((b, i) => (
              <div key={i} onClick={() => { window.history.pushState({}, '', '/news'); setCurrentPath('/news'); window.scrollTo(0, 0); }} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
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
         CASEILY INSIDERS
         ═══════════════════════════════════════════════════════════════ */}
      <section id="insiders-promo" style={{ padding: '0 20px', maxWidth: '800px', margin: '40px auto' }}>
        <div onClick={() => { window.history.pushState({}, '', '/insiders'); setCurrentPath('/insiders'); window.scrollTo(0, 0); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px', cursor: 'pointer' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}><span style={{fontSize: '28px'}}>🤝</span><h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', background: 'linear-gradient(90deg, #f59e0b, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>Caseily Insiders</h2></div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-strong)' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        
        <div onClick={() => { window.history.pushState({}, '', '/insiders'); setCurrentPath('/insiders'); window.scrollTo(0, 0); }} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '32px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg>
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)' }}>Join the exclusive community</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Vote on new products, get behind the scenes access, and interact with other Caseily fans.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SUPPORT & LINKS
         ═══════════════════════════════════════════════════════════════ */}
      <section id="support-links" style={{ padding: '0 20px', maxWidth: '800px', margin: '40px auto', textAlign: 'left' }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 8px'}}><span style={{fontSize: '28px'}}>🎧</span><h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', background: 'linear-gradient(90deg, #64748b, #475569)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>Support & Links</h2></div>
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '32px', padding: '12px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
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
      <footer className="footer-large">
        <div className="container">
          <div className="footer-large-grid">
            {/* Column 1: Company */}
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a onClick={() => scrollTo('track')}>Home</a></li>
                <li><a onClick={() => scrollTo('blog')}>News</a></li>
                <li><a onClick={() => scrollTo('reviews')}>Reviews</a></li>
                <li><a onClick={() => scrollTo('support-links')}>Contact Us</a></li>
                <li><a onClick={() => scrollTo('write-review')}>Leave Feedback</a></li>
              </ul>
            </div>

            {/* Column 2: Legal */}
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a>About Us</a></li>
                <li><a>Terms & Conditions</a></li>
                <li><a>Privacy Policy</a></li>
                <li><a>Shipping Policy</a></li>
                <li><a>Return Policy</a></li>
              </ul>
            </div>

            {/* Column 3: Social Media */}
            <div className="footer-column">
              <h4>Social Media</h4>
              <div className="footer-social-icons">
                <a href="https://youtube.com/@caseilyplus?si=GXIR-3isU2OCFKY8" target="_blank" rel="noopener noreferrer" title="YouTube">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://whatsapp.com/channel/0029VbApzgg9cDDUfdHPdQ2z" target="_blank" rel="noopener noreferrer" title="WhatsApp Channel">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
                <a href="https://www.snapchat.com/add/caseilyplus" target="_blank" rel="noopener noreferrer" title="Snapchat">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.146 1.768c-1.894 0-3.518.558-4.757 1.635-1.235 1.071-1.928 2.585-2.062 4.542-.146 2.128.536 3.512.923 4.298.397.808.574 1.168.328 1.458-.204.24-.766.425-1.428.643-1.077.355-2.392.79-3.045 1.503-.314.342-.505.776-.505 1.155 0 .393.18.847.531 1.25.437.5 1.16.89 2.023 1.09.28.064.385.16.347.315-.054.218-.176.621-.304 1.042-.15.49-.313 1.025-.333 1.348-.009.155.032.285.127.375.116.108.286.136.488.077.301-.088.757-.282 1.264-.496.653-.275 1.411-.595 1.954-.627.171-.01.32.063.504.16.398.21.942.497 1.554.809.84.428 1.83.932 2.394.932s1.554-.504 2.395-.932c.611-.312 1.155-.599 1.553-.809.183-.097.333-.17.503-.16.543.032 1.3.352 1.954.627.507.214.963.408 1.264.496.202.06.372.031.488-.077.095-.09.136-.22.127-.375-.02-.323-.183-.858-.333-1.348-.128-.421-.25-.824-.304-1.042-.038-.155.067-.251.347-.315.863-.2 1.586-.59 2.023-1.09.35-.403.531-.857.531-1.25 0-.379-.19-.813-.505-1.155-.653-.713-1.968-1.148-3.045-1.503-.662-.218-1.224-.403-1.428-.643-.246-.29-.069-.65.328-1.458.387-.786 1.069-2.17.923-4.298-.134-1.957-.827-3.471-2.062-4.542-1.239-1.077-2.863-1.635-4.757-1.635z"/></svg>
                </a>
                <a href="https://wa.me/c/919167788773" target="_blank" rel="noopener noreferrer" title="WhatsApp Catalog">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              </div>
            </div>

            {/* Column 4: Site links */}
            <div className="footer-column">
              <h4>Site links</h4>
              <ul>
                <li><a onClick={() => window.location.href = '/admin'}>Admin Dashboard</a></li>
                <li><a>B2B Pricing</a></li>
                <li><a>Distribution</a></li>
                <li><a>Careers</a></li>
              </ul>
            </div>

            {/* Column 5: Site Map */}
            <div className="footer-column">
              <h4>Site Map</h4>
              <ul>
                <li><a onClick={() => scrollTo('faq')}>FAQ</a></li>
                <li><a onClick={() => scrollTo('support-links')}>Help Center</a></li>
                <li><a>Site Map XML</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© {new Date().getFullYear()} Caseily · All rights reserved</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/c-logo.png" alt="Caseily" style={{ height: '24px', width: 'auto', borderRadius: '4px' }} />
              <span style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>caseily</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App