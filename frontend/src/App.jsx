import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'
import { useTilt } from './useTilt'
import { TiltCard } from './TiltCard'
import TicTacToe from './TicTacToe'
import { TicTacToeGame, ConnectFourGame, MemoryMatchGame } from './InsiderGames'
import ReelsPage from './ReelsPage'
import CommunityWall from './components/CommunityWall'
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
  {
    id: 'about_us',
    label: 'About Us',
    emoji: '🤝',
    stories: ['/og-image.png'],
  },
  {
    id: 'our_vision',
    label: 'Our Vision',
    emoji: '👁️',
    stories: ['/og-image.png'],
  },
  {
    id: 'brands_we_deal',
    label: 'Brands We Deal',
    emoji: '📱',
    stories: ['/og-image.png'],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    emoji: '🧠',
    stories: ['/og-image.png'],
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
        <div className="splash-v2-headline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="splash-v2-wordmark">CASEILY</div>
          <div style={{
            background: '#ffffff',
            color: '#1e3fd1',
            padding: '4px 20px',
            borderRadius: '8px',
            fontSize: '32px',
            fontWeight: '900',
            marginTop: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8)',
            transform: 'rotate(-4deg)',
            letterSpacing: '1px'
          }}>
            INSIDER
          </div>
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
  const [news, setNews] = useState([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [newsForm, setNewsForm] = useState({ title: '', category: 'Updates', content: '', color: '#3b82f6' })
  const [newsPhoto, setNewsPhoto] = useState(null)
  const [vipRequests, setVipRequests] = useState([])
  const [loadingVip, setLoadingVip] = useState(false)
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [adminDrops, setAdminDrops] = useState([])
  const [loadingDrops, setLoadingDrops] = useState(false)
  const [dropForm, setDropForm] = useState({ title: '', subtitle: '', price: '', expires: '', expireColor: '#fef08a', expireText: '#854d0e', disabled: false })
  const [dropImage, setDropImage] = useState(null)
  const isLoggedIn = !!token

  async function fetchUsers() {
    setLoadingUsers(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/users`)
      const data = await res.json()
      setRegisteredUsers(data || [])
    } catch (err) { console.error(err) }
    setLoadingUsers(false)
  }

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

  async function fetchAdminDrops() {
    setLoadingDrops(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/drops`)
      const data = await res.json()
      setAdminDrops(data || [])
    } catch (err) { console.error(err) }
    setLoadingDrops(false)
  }

  async function handleDropSubmit(e) {
    e.preventDefault()
    try {
      const form = new FormData()
      form.append('title', dropForm.title)
      form.append('subtitle', dropForm.subtitle)
      form.append('price', dropForm.price)
      form.append('expires', dropForm.expires)
      form.append('expireColor', dropForm.expireColor)
      form.append('expireText', dropForm.expireText)
      form.append('disabled', dropForm.disabled)
      if (dropImage) form.append('image', dropImage)
      
      const res = await fetch(`${API_URL}/api/admin/drops`, { method: 'POST', body: form })
      if (res.ok) {
        setDropForm({ title: '', subtitle: '', price: '', expires: '', expireColor: '#fef08a', expireText: '#854d0e', disabled: false })
        setDropImage(null)
        fetchAdminDrops()
      }
    } catch (err) { console.error(err) }
  }

  async function handleDropDelete(id) {
    try {
      await fetch(`${API_URL}/api/admin/drops/${id}`, { method: 'DELETE' })
      fetchAdminDrops()
    } catch (err) { console.error(err) }
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

  async function fetchNews() {
    setLoadingNews(true)
    try {
      const res = await fetch(`${API_URL}/api/news`)
      const data = await res.json()
      setNews(data.news || [])
    } catch (err) { console.error(err) }
    setLoadingNews(false)
  }

  useEffect(() => {
    if (isLoggedIn) {
      if (adminTab === 'reviews') fetchReviews()
      if (adminTab === 'insiders') fetchInsiders()
      if (adminTab === 'notifications') fetchAdminNotifications()
      if (adminTab === 'news') fetchNews()
      if (adminTab === 'vip') fetchVipRequests()
      if (adminTab === 'users') fetchUsers()
      if (adminTab === 'drops') fetchAdminDrops()
    }
  }, [isLoggedIn, adminTab])

  async function fetchVipRequests() {
    setLoadingVip(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/vip-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setVipRequests(data.requests || [])
    } catch (err) { console.error(err) }
    setLoadingVip(false)
  }

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

  async function handleCreateNews(e) {
    e.preventDefault()
    const form = new FormData()
    form.append('title', newsForm.title)
    form.append('category', newsForm.category)
    form.append('content', newsForm.content)
    form.append('color', newsForm.color)
    if (newsPhoto) {
      form.append('photo', newsPhoto)
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/news`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      })
      if (!res.ok) {
        const errText = await res.text()
        alert('Failed to publish: ' + errText)
        return
      }
      setNewsForm({ title: '', category: 'Updates', content: '', color: '#3b82f6' })
      setNewsPhoto(null)
      fetchNews()
      alert('Article published successfully!')
    } catch (err) { 
      console.error(err)
      alert('Error: ' + err.message)
    }
  }

  async function handleDeleteNews(id) {
    if (!window.confirm('Delete this article?')) return;
    try {
      await fetch(`${API_URL}/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchNews()
    } catch (err) { console.error(err) }
  }

  async function handleVipAction(id, action) {
    try {
      await fetch(`${API_URL}/api/admin/vip-requests/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action })
      })
      fetchVipRequests()
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
          <img src={`${API_URL}/uploads/${r.photo}`} alt="Review" loading="lazy" decoding="async" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} />
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
          <button onClick={() => setAdminTab('news')} style={{ padding: '8px 12px', borderRadius: '10px', background: adminTab === 'news' ? '#1e3fd1' : 'transparent', color: adminTab === 'news' ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>News</button>
          <button onClick={() => setAdminTab('vip')} style={{ padding: '8px 12px', borderRadius: '10px', background: adminTab === 'vip' ? '#1e3fd1' : 'transparent', color: adminTab === 'vip' ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>VIP Requests</button>
          <button onClick={() => setAdminTab('users')} style={{ padding: '8px 12px', borderRadius: '10px', background: adminTab === 'users' ? '#1e3fd1' : 'transparent', color: adminTab === 'users' ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Users</button>
          <button onClick={() => setAdminTab('drops')} style={{ padding: '8px 12px', borderRadius: '10px', background: adminTab === 'drops' ? '#1e3fd1' : 'transparent', color: adminTab === 'drops' ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Drops</button>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>
          <button onClick={adminTab === 'reviews' ? fetchReviews : adminTab === 'insiders' ? fetchInsiders : adminTab === 'news' ? fetchNews : adminTab === 'vip' ? fetchVipRequests : adminTab === 'drops' ? fetchAdminDrops : fetchUsers} style={{ padding: '8px 12px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#334155' }}>↻ Refresh</button>
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
        ) : adminTab === 'news' ? (
          <>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Publish News & Tips</h2>
              <form onSubmit={handleCreateNews} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" placeholder="Article Title" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} required />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <select value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1 }}>
                    <option value="Tips">Tips</option>
                    <option value="Guide">Guide</option>
                    <option value="Case study">Case study</option>
                    <option value="Updates">Updates</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                  <input type="color" value={newsForm.color} onChange={e => setNewsForm({...newsForm, color: e.target.value})} style={{ padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '44px', width: '60px' }} />
                </div>
                <input type="file" accept="image/*" onChange={e => setNewsPhoto(e.target.files[0])} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                <textarea placeholder="Article Content..." value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} rows={6} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', resize: 'vertical' }} required />
                <button type="submit" style={{ padding: '12px', borderRadius: '12px', background: '#1e3fd1', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Publish Article</button>
              </form>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Published Articles ({news.length})</h2>
            {loadingNews ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {news.map(article => (
                  <div key={article.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: article.color, textTransform: 'uppercase' }}>{article.category}</span>
                      <h3 style={{ margin: '4px 0 8px 0', fontSize: '16px', color: 'var(--ink-strong)' }}>{article.title}</h3>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(article.created_at).toLocaleString()} • {article.likes} Likes</div>
                    </div>
                    <button onClick={() => handleDeleteNews(article.id)} style={{ padding: '8px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                  </div>
                ))}
                {news.length === 0 && <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No articles published.</p>}
              </div>
            )}
          </>
        ) : adminTab === 'vip' ? (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>VIP Access Requests ({vipRequests.length})</h2>
            {loadingVip ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {vipRequests.map(req => (
                  <div key={req.id} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--ink-strong)' }}>{req.phone}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Requested: {new Date(req.created_at).toLocaleString()}</div>
                      </div>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', background: req.status === 'approved' ? '#dcfce7' : req.status === 'rejected' ? '#fee2e2' : '#fef3c7', color: req.status === 'approved' ? '#16a34a' : req.status === 'rejected' ? '#dc2626' : '#d97706' }}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <button onClick={() => handleVipAction(req.id, 'approve')} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#22c55e', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✓ Accept</button>
                        <button onClick={() => handleVipAction(req.id, 'reject')} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#ef4444', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✕ Reject</button>
                      </div>
                    )}
                  </div>
                ))}
                {vipRequests.length === 0 && <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No requests.</p>}
              </div>
            )}
          </>
        ) : adminTab === 'users' ? (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Registered Users ({registeredUsers.length})</h2>
            {loadingUsers ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {registeredUsers.map(user => (
                  <div key={user.id} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--ink-strong)' }}>{user.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--ink-muted)', marginTop: '4px' }}>Phone: {user.phone}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Joined: {new Date(user.created_at).toLocaleString()}</div>
                  </div>
                ))}
                {registeredUsers.length === 0 && <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No registered users.</p>}
              </div>
            )}
          </>
        ) : adminTab === 'drops' ? (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>Exclusive Drops</h2>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Create New Drop</h3>
              <form onSubmit={handleDropSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="Title (e.g. Indian Exclusive)" value={dropForm.title} onChange={e => setDropForm({ ...dropForm, title: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
                <input type="text" placeholder="Subtitle (e.g. Limited Run)" value={dropForm.subtitle} onChange={e => setDropForm({ ...dropForm, subtitle: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <input type="text" placeholder="Price (e.g. ₹3,500)" value={dropForm.price} onChange={e => setDropForm({ ...dropForm, price: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <input type="text" placeholder="Expires Text (e.g. Expires: 11h 23m)" value={dropForm.expires} onChange={e => setDropForm({ ...dropForm, expires: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" placeholder="Expire Badge Color (#fef08a)" value={dropForm.expireColor} onChange={e => setDropForm({ ...dropForm, expireColor: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }} />
                  <input type="text" placeholder="Expire Text Color (#854d0e)" value={dropForm.expireText} onChange={e => setDropForm({ ...dropForm, expireText: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1 }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input type="checkbox" checked={dropForm.disabled} onChange={e => setDropForm({ ...dropForm, disabled: e.target.checked })} />
                  Disabled (Grayed out)
                </label>
                <input type="file" accept="image/*" onChange={e => setDropImage(e.target.files[0])} style={{ padding: '10px' }} />
                <button type="submit" style={{ padding: '10px', background: '#1e3fd1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Create Drop</button>
              </form>
            </div>
            
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--ink-strong)' }}>Existing Drops</h3>
            {loadingDrops ? <p>Loading...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {adminDrops.map(d => (
                  <div key={d._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {d.image && <img src={`${API_URL}/uploads/${d.image}`} alt="drop" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: 'var(--ink-strong)' }}>{d.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{d.subtitle} • {d.price}</div>
                      {d.expires && <div style={{ fontSize: '12px', marginTop: '4px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: d.expireColor, color: d.expireText }}>{d.expires}</div>}
                    </div>
                    <button onClick={() => handleDropDelete(d._id)} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                  </div>
                ))}
                {adminDrops.length === 0 && <p style={{ color: '#64748b' }}>No drops found.</p>}
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
// ─── COLORFUL REVIEWS DECK (REFERENCE DESIGN & ANIMATED SWIPE) ───
const REVIEW_THEMES = [
  {
    bg: 'linear-gradient(145deg, #9333EA 0%, #6B21A8 100%)', // Vibrant Purple (hero in reference)
    accent: '#C084FC',
    glow: 'rgba(147, 51, 234, 0.45)',
    btnColor: '#6B21A8',
    category: 'Art & Design',
    tag: 'Community Favorite 💜'
  },
  {
    bg: 'linear-gradient(145deg, #0284C7 0%, #0369A1 100%)', // Electric Blue (right peek / course card)
    accent: '#38BDF8',
    glow: 'rgba(2, 132, 199, 0.45)',
    btnColor: '#0369A1',
    category: 'MagSafe & Build',
    tag: 'Top Quality ⚡'
  },
  {
    bg: 'linear-gradient(145deg, #EC4899 0%, #BE185D 100%)', // Hot Pink / Magenta (course card)
    accent: '#F472B6',
    glow: 'rgba(236, 72, 153, 0.45)',
    btnColor: '#BE185D',
    category: 'Fit & Protection',
    tag: 'Super Satisfied 💖'
  },
  {
    bg: 'linear-gradient(145deg, #EA580C 0%, #C2410C 100%)', // Vibrant Tangerine (left peek)
    accent: '#FB923C',
    glow: 'rgba(234, 88, 12, 0.45)',
    btnColor: '#C2410C',
    category: 'Fast Shipping',
    tag: 'Express Delivery 📦'
  },
  {
    bg: 'linear-gradient(145deg, #059669 0%, #047857 100%)', // Emerald Green
    accent: '#34D399',
    glow: 'rgba(5, 150, 105, 0.45)',
    btnColor: '#047857',
    category: 'Premium Quality',
    tag: 'Flawless Finish 🌿'
  },
  {
    bg: 'linear-gradient(145deg, #4F46E5 0%, #3730A3 100%)', // Deep Indigo
    accent: '#818CF8',
    glow: 'rgba(79, 70, 229, 0.45)',
    btnColor: '#3730A3',
    category: 'Verified Purchase',
    tag: 'Highly Recommended ⭐'
  }
];

function ColorfulReviewsDeck({ reviews = [], onSelectReview, onLikeToggle, likedPosts = new Set(), onShowAll }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [filter, setFilter] = useState('all');
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const startXRef = useRef(0);
  const isMouseDownRef = useRef(false);

  const filteredReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    if (filter === 'five_star') return reviews.filter(r => r.stars === 5);
    if (filter === 'verified') return reviews.filter(r => r.city || r.name);
    return reviews;
  }, [reviews, filter]);

  const list = filteredReviews.length > 0 ? filteredReviews : reviews;
  const total = list.length;
  const safeIdx = total > 0 ? ((activeIdx % total) + total) % total : 0;

  const next = () => {
    if (total <= 1) return;
    setActiveIdx(prev => (prev + 1) % total);
  };
  const prev = () => {
    if (total <= 1) return;
    setActiveIdx(prev => (prev - 1 + total) % total);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total]);

  // Touch handlers
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    setDragX(currentX - startXRef.current);
  };
  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (dragX < -45) next();
    else if (dragX > 45) prev();
    setDragX(0);
    setIsDragging(false);
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    startXRef.current = e.clientX;
    isMouseDownRef.current = true;
    setIsDragging(true);
  };
  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    setDragX(e.clientX - startXRef.current);
  };
  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    if (dragX < -45) next();
    else if (dragX > 45) prev();
    setDragX(0);
    isMouseDownRef.current = false;
    setIsDragging(false);
  };
  const handleMouseLeave = () => {
    if (isMouseDownRef.current) {
      if (dragX < -45) next();
      else if (dragX > 45) prev();
      setDragX(0);
      isMouseDownRef.current = false;
      setIsDragging(false);
    }
  };

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)' }}>
        <p style={{ fontSize: '18px', fontWeight: '700' }}>No reviews found.</p>
      </div>
    );
  }

  // Pre-calculate the visible cards (previous, next, active)
  const prevIdx = (safeIdx - 1 + total) % total;
  const nextIdx = (safeIdx + 1) % total;

  const visibleCards = total === 1
    ? [{ post: list[safeIdx], index: safeIdx, offset: 0 }]
    : total === 2
    ? [
        { post: list[prevIdx], index: prevIdx, offset: -1 },
        { post: list[safeIdx], index: safeIdx, offset: 0 }
      ]
    : [
        { post: list[prevIdx], index: prevIdx, offset: -1 },
        { post: list[nextIdx], index: nextIdx, offset: 1 },
        { post: list[safeIdx], index: safeIdx, offset: 0 }
      ];

  const activeTheme = REVIEW_THEMES[safeIdx % REVIEW_THEMES.length];

  return (
    <div>
      {/* ─── HEADER ROW ─── */}
      <div className="cw-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '26px' }}>💬</span>
          <h2 className="cw-title" style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Community Wall
          </h2>
        </div>
        <a className="cw-show-all" onClick={onShowAll}>
          Show all ({reviews.length}) &rarr;
        </a>
      </div>

      {/* ─── CATEGORY CHIPS (REFERENCE STYLE TABS) ─── */}
      <div className="cw-category-chips">
        {[
          { id: 'all', label: 'All Reviews 💬' },
          { id: 'five_star', label: '5-Star Ratings ⭐' },
          { id: 'verified', label: 'Verified Buyers 💎' }
        ].map(chip => (
          <button
            key={chip.id}
            className={`cw-chip ${filter === chip.id ? 'active' : ''}`}
            onClick={() => {
              setFilter(chip.id);
              setActiveIdx(0);
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ─── STACKED STAGE / HERO CARD DECK ─── */}
      <div
        className="cw-stage-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              className="cw-nav-arrow prev"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous Review"
              title="Previous Review"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="cw-nav-arrow next"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next Review"
              title="Next Review"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}

        {/* The Card Stage */}
        <div
          className="cw-stage-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {visibleCards.map(({ post, index, offset }) => {
            const theme = REVIEW_THEMES[index % REVIEW_THEMES.length];
            const isLiked = likedPosts.has(index);

            let transformStyle = '';
            if (offset === 0) {
              transformStyle = isDragging
                ? `translate3d(${dragX}px, 0px, 0px) rotate(${dragX * 0.04}deg) scale(1)`
                : `translate3d(0px, 0px, 0px) rotate(0deg) scale(1)`;
            } else if (offset === -1) {
              transformStyle = isDragging
                ? `translate3d(calc(-20px + ${dragX * 0.35}px), 8px, -30px) scale(${0.92 + (dragX > 0 ? (dragX / 300) * 0.08 : 0)}) rotate(-3.5deg)`
                : `translate3d(-20px, 8px, -30px) scale(0.92) rotate(-3.5deg)`;
            } else if (offset === 1) {
              transformStyle = isDragging
                ? `translate3d(calc(20px + ${dragX * 0.35}px), 8px, -30px) scale(${0.92 - (dragX < 0 ? (dragX / 300) * 0.08 : 0)}) rotate(3.5deg)`
                : `translate3d(20px, 8px, -30px) scale(0.92) rotate(3.5deg)`;
            }

            return (
              <div
                key={`deck-${post.name}-${index}-${offset}`}
                className={`cw-deck-card ${offset === 0 ? 'is-active' : offset === -1 ? 'is-prev' : 'is-next'}`}
                style={{
                  background: theme.bg,
                  boxShadow: offset === 0
                    ? `0 24px 50px -12px ${theme.glow}, 0 12px 24px -6px rgba(0,0,0,0.22)`
                    : `0 12px 30px -10px ${theme.glow}`,
                  transform: transformStyle,
                  transition: 'none',
                  zIndex: offset === 0 ? 10 : 5,
                  opacity: offset === 0 ? 1 : 0.88,
                  cursor: offset === 0 ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
                }}
                onClick={() => {
                  if (offset === -1) { prev(); return; }
                  if (offset === 1) { next(); return; }
                  if (offset === 0) { onSelectReview(post); }
                }}
              >
                {/* Card Top Row */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.name)}&background=ffffff&color=${theme.btnColor.replace('#','')}&bold=true`}
                        alt={post.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.7)', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{post.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span className="cw-glass-pill">{post.city || 'Verified Buyer'}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>{post.time}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="cw-glass-like-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikeToggle(index, e);
                      }}
                      title="Like review"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? "#ff3366" : "none"} stroke={isLiked ? "#ff3366" : "#ffffff"} strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span>{post.likes + (isLiked ? 1 : 0)}</span>
                    </button>
                  </div>

                  {/* Rating & Category Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div className="cw-stars-pill">
                      <span style={{ color: '#fbbf24', fontSize: '13px', letterSpacing: '2px' }}>{'★'.repeat(post.stars || 5)}</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff' }}>5.0</span>
                    </div>
                    <div className="cw-glass-pill">{theme.tag}</div>
                  </div>

                  {/* Quote Headline */}
                  <div
                    className="cw-card-quote"
                    style={!post.image ? { flex: 1, display: 'flex', alignItems: 'center', fontSize: '18px', lineHeight: 1.45, WebkitLineClamp: 7, margin: '14px 0' } : {}}
                  >
                    "{post.text}"
                  </div>
                </div>

                {/* Center Visual Asset (only if photo uploaded) */}
                {post.image && (
                  <div className="cw-card-img-wrap">
                    <img src={post.image} alt="Customer Case Review" loading="lazy" />
                  </div>
                )}

                {/* Card Bottom Bar ("Start watching" style) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <button
                    className="cw-action-pill-btn"
                    style={{ color: theme.btnColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReview(post);
                    }}
                  >
                    <span>Read full story</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>

                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots Pagination Track */}
        {total > 1 && (
          <div className="cw-dots-track">
            {list.slice(0, Math.min(8, total)).map((_, i) => (
              <div
                key={i}
                className={`cw-dot ${i === safeIdx ? 'active' : ''}`}
                style={i === safeIdx ? { background: activeTheme.bg } : {}}
                onClick={() => setActiveIdx(i)}
              />
            ))}
          </div>
        )}

        {/* Swipe Hint */}
        <div className="cw-swipe-hint">
          <span>👈</span> Swipe left or right to explore reviews <span>👉</span>
        </div>
      </div>
    </div>
  );
}


function App() {
  // ─── Routing ─────────────────────────────────────────────────────────
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [notifications, setNotifications] = useState([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [publicNews, setPublicNews] = useState([])
  const [selectedNews, setSelectedNews] = useState(null)
  const [roomMessages, setRoomMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [roomMemberships, setRoomMemberships] = useState(() => {
    try {
      const saved = localStorage.getItem('caseily_room_memberships');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })
  const notifRef = useRef(null)
  
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('caseily_user')) || null; }
    catch { return null; }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authForm, setAuthForm] = useState({ name: '', phone: '', password: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('caseily_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('caseily_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('caseily_room_memberships', JSON.stringify(roomMemberships));
  }, [roomMemberships]);

  useEffect(() => {
    fetch(`${API_URL || ''}/api/notifications`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || [])
        if (data.notifications && data.notifications.length > 0) setHasUnread(true)
      })
      .catch(console.error)

    fetch(`${API_URL || ''}/api/news`)
      .then(res => res.json())
      .then(data => {
        const news = data.news || [];
        setPublicNews(news);
        if (news.length > 0) {
          setNotifications(prev => {
            if (!prev.some(n => n.id === 'news-notif')) {
              setHasUnread(true);
              return [{ id: 'news-notif', text: `New Update: ${news[0].title}` }, ...prev];
            }
            return prev;
          });
        }
      })
      .catch(console.error)
  }, [currentPath])

  useEffect(() => {
    if (currentPath.startsWith('/insider-room/')) {
      const roomId = currentPath.split('/').pop()
      const fetchMsgs = () => {
        fetch(`${API_URL || ''}/api/insiders/rooms/${roomId}/messages`)
          .then(res => res.json())
          .then(data => setRoomMessages(data.messages || []))
          .catch(console.error)
      }
      fetchMsgs()
      const interval = setInterval(fetchMsgs, 5000)
      return () => clearInterval(interval)
    } else {
      setRoomMessages([])
    }
  }, [currentPath])

  useEffect(() => {
    const joinedRooms = Object.keys(roomMemberships).filter(id => roomMemberships[id].joined && !roomMemberships[id].muted);
    if (joinedRooms.length === 0) return;

    let lastCheck = new Date().toISOString();
    const interval = setInterval(() => {
      joinedRooms.forEach(roomId => {
        // Skip fetching if we are currently looking at that room
        if (currentPath === `/insider-room/${roomId}`) return;
        
        fetch(`${API_URL || ''}/api/insiders/rooms/${roomId}/messages`)
          .then(res => res.json())
          .then(data => {
            const msgs = data.messages || [];
            const newMsgs = msgs.filter(m => m.created_at > lastCheck && m.sender_name !== currentUser?.name);
            if (newMsgs.length > 0) {
              const roomName = {
                'care': 'Care, Skins & Installations',
                'addicts': 'Accessory Addicts Anonymous',
                'lounge': 'Late-Night Work & Chill Lounge',
                'weekend': 'Weekend Plans & Getaways',
                'green-room': 'The Green Room / Member Hangout',
                'memes': 'Dumb Meme Dumpster',
                'vault': 'Flash Drop Friday (VIP Vault)'
              }[roomId] || 'a joined room';
              setNotifications(prev => [{ id: Date.now() + roomId, text: `New messages in ${roomName}` }, ...prev]);
              setHasUnread(true);
            }
          })
          .catch(console.error);
      });
      lastCheck = new Date().toISOString();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [roomMemberships, currentPath, currentUser]);

  async function handleAuthSubmit(e) {
    if (e) e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authMode === 'signup' ? '/signup' : '/login';
      const res = await fetch(`${API_URL || ''}/api/auth${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');
      setCurrentUser(data);
      setShowAuthModal(false);
      setAuthForm({ name: '', phone: '', password: '' });
    } catch (err) {
      setAuthError(err.message);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
  }

  async function handleSendMessage(roomId, e) {
    if (e) e.preventDefault()
    
    if (!messageInput.trim()) return
    
    const formData = new FormData()
    formData.append('text', messageInput)
    if (currentUser) {
      formData.append('sender_name', currentUser.name);
    }
    
    setMessageInput('') // Optimistic clear
    try {
      const res = await fetch(`${API_URL || ''}/api/insiders/rooms/${roomId}/messages`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setRoomMessages(prev => [...prev, data.message])
      }
    } catch (err) { console.error(err) }
  }

  async function handleDumpMeme(roomId, e) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const res = await fetch(`${API_URL || ''}/api/insiders/rooms/${roomId}/messages`, {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setRoomMessages(prev => [...prev, data.message]);
        }
      } catch (err) { console.error(err); }
    };
    input.click();
  }

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
  const [couriers, setCouriers] = useState([{key: '', name: 'Auto-detect / Not sure', country_iso: ''}])
  
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/carriers`)
      .then(res => res.json())
      .then(data => {
        if (data.carriers && data.carriers.length > 0) {
          setCouriers([{key: '', name: 'Auto-detect / Not sure', country_iso: ''}, ...data.carriers])
        }
      })
      .catch(err => console.error("Failed to load couriers", err))
  }, [])
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
  const [reviewForm, setReviewForm] = useState({ name: '', city: '', stars: 0, quote: '' })
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

  const [drops, setDrops] = useState([])
  useEffect(() => {
    fetch(`${API_URL}/api/reviews/approved`)
      .then(r => r.json())
      .then(data => setApprovedReviews(data.reviews || []))
      .catch(() => {})
  }, [])
  
  useEffect(() => {
    fetch(`${API_URL}/api/drops`)
      .then(r => r.json())
      .then(data => {
        const activeDrops = data || [];
        setDrops(activeDrops);
        if (activeDrops.length > 0 && !activeDrops[0].disabled) {
          setNotifications(prev => {
            if (!prev.some(n => n.id === 'drop-notif')) {
              setHasUnread(true);
              return [{ id: 'drop-notif', text: `Exclusive Drop: ${activeDrops[0].title} is live!` }, ...prev];
            }
            return prev;
          });
        }
      })
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
    if (reviewForm.stars === 0) {
      setReviewError('Please select a star rating before submitting.')
      return
    }
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
      setReviewForm({ name: '', city: '', stars: 0, quote: '' })
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
      setCurrentPromoIndex(prev => (prev + 1) % 2)
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
  const filteredCouriers = couriers.filter(c => 
    c.name.toLowerCase().includes(courierSearch.toLowerCase()) || 
    c.key.toLowerCase().includes(courierSearch.toLowerCase())
  )
  const selectedCourierObj = couriers.find(c => c.key === selectedCourier) || couriers[0]
  const courierDisplayText = selectedCourierObj?.key ? selectedCourierObj.name : 'Auto-detect / Not sure'
  const formatReviewDate = (dateStr, seed) => {
    if (dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    const now = new Date();
    const daysAgo = (seed % 7) + 1;
    now.setDate(now.getDate() - daysAgo);
    now.setHours(now.getHours() - (seed % 24));
    return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const combinedReviews = approvedReviews.map(r => ({
    name: r.name || 'Anonymous',
    time: formatReviewDate(r.created_at, r.quote.length),
    text: r.quote,
    image: r.photo ? `${API_URL}/uploads/${r.photo}` : null,
    likes: (r.quote.length * 7) % 200 + 15,
    comments: (r.quote.length * 3) % 20 + 2,
    stars: r.stars || 5
  }));

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

  const renderCommunityWallCard = (post, i) => {
    const theme = REVIEW_THEMES[i % REVIEW_THEMES.length];
    const isLiked = likedPosts.has(i);
    return (
      <div
        key={i}
        className="cw-card"
        style={{
          background: theme.bg,
          boxShadow: `0 14px 34px -8px ${theme.glow}, 0 6px 16px rgba(0,0,0,0.12)`,
          color: '#ffffff'
        }}
        onClick={() => {
          if (currentPath === '/reviews') {
            setSelectedReview(post);
            window.history.pushState({}, '', '/review-detail');
            setCurrentPath('/review-detail');
            window.scrollTo(0, 0);
          } else {
            window.history.pushState({}, '', '/reviews');
            setCurrentPath('/reviews');
            window.scrollTo(0, 0);
          }
        }}
      >
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                className="cw-avatar"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.name)}&background=ffffff&color=${theme.btnColor.replace('#','')}&bold=true`}
                alt={post.name}
                style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.6)', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{post.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span className="cw-glass-pill">{post.city || 'Verified Buyer'}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>{post.time}</span>
                </div>
              </div>
            </div>

            <button
              className="cw-glass-like-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleLikeToggle(i, e);
              }}
              title="Like review"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? "#ff3366" : "none"} stroke={isLiked ? "#ff3366" : "#ffffff"} strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{post.likes + (isLiked ? 1 : 0)}</span>
            </button>
          </div>

          {/* Stars & Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div className="cw-stars-pill">
              <span style={{ color: '#fbbf24', fontSize: '13px', letterSpacing: '2px' }}>{'★'.repeat(post.stars || 5)}</span>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff' }}>5.0</span>
            </div>
            <div className="cw-glass-pill">{theme.tag}</div>
          </div>

          {/* Quote */}
          {post.text && (
            <div className="cw-card-quote">
              "{post.text}"
            </div>
          )}
        </div>

        {/* Image (only if user uploaded photo) */}
        {post.image && (
          <div className="cw-card-img-wrap">
            <img src={post.image} alt="Review" loading="lazy" />
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <button
            className="cw-action-pill-btn"
            style={{ color: theme.btnColor }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReview(post);
              window.history.pushState({}, '', '/review-detail');
              setCurrentPath('/review-detail');
              window.scrollTo(0, 0);
            }}
          >
            <span>Read full story</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>Verified Purchase</span>
        </div>
      </div>
    );
  };

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
                  <img src={post.image} alt="Review photo" loading="lazy" decoding="async" style={{ width: '100%', display: 'block', borderRadius: '16px', objectFit: 'cover' }} />
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
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                 <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
                 <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)' }}>Community Wall</h2>
              </div>

              {/* ─── BANNER ─── */}
              <div style={{ marginBottom: '32px', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                <img src="/insider-banner.png" alt="Community Wall Banner" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
              </div>

              <div style={{ marginBottom: '48px', overflow: 'hidden' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px', color: 'var(--ink-strong)' }}>InsiderFam</h3>
                <div className="marquee-container" style={{ display: 'flex', width: 'max-content', animation: 'marquee 40s linear infinite' }}>
                  {[...['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.jpg', '8.png', '9.png', '10.png', '11.png', '12.png'], ...['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.jpg', '8.png', '9.png', '10.png', '11.png', '12.png']].map((img, index) => (
                    <div key={`${img}-${index}`} style={{ flexShrink: 0, width: '220px', height: '330px', borderRadius: '16px', overflow: 'hidden', marginRight: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <img src={`/insiderfam/${img}`} alt="InsiderFam" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px', color: 'var(--ink-strong)' }}>#UnfilteredFeedback</h3>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', snapType: 'x mandatory' }}>
                  {['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png', '11.png', '12.png', '13.png', '14.png', '15.png', '16.png', '17.png', '18.png'].map((img, index) => (
                    <div key={`${img}-${index}`} style={{ flexShrink: 0, width: '220px', height: '400px', borderRadius: '16px', overflow: 'hidden', scrollSnapAlign: 'start', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <img src={`/ourfamily/${img}`} alt="Our Family" style={{ width: '100%', height: '124%', objectFit: 'cover', objectPosition: 'center', marginTop: '-12%' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', color: 'var(--ink-strong)' }}>Reviews</h3>
                <div className="reviews-page-grid">
                    {combinedReviews.map((post, i) => renderCommunityWallCard(post, i))}
                </div>
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
  const insiderBanners = [
    '/insider_banners/banner1.png',
    '/insider_banners/banner2.png',
    '/insider_banners/banner3.png'
  ];

  const InsiderBannerCarousel = () => {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setIdx((prev) => (prev + 1) % insiderBanners.length);
      }, 4000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div style={{ position: 'relative', width: '100%', height: '250px', borderRadius: '20px', overflow: 'hidden', marginBottom: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
        {insiderBanners.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Insider Banner ${i}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: i === idx ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              pointerEvents: 'none'
            }}
          />
        ))}
        <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {insiderBanners.map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'background-color 0.4s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

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

    const INSIDER_MEMBERS = [
      { name: 'Arjun', color: '#f59e0b' },
      { name: 'Priya', color: '#ec4899' },
      { name: 'Rohit', color: '#8b5cf6' },
      { name: 'Ananya', color: '#10b981' },
      { name: 'Vikram', color: '#3b82f6' },
    ]

    const INSIDER_ROOMS = [
      { name: 'Unboxing Videos', count: '5', active: '25 users', emoji: '📦', id: 'unboxing' },
      { name: 'Custom Orders', count: '3', active: '10 users', emoji: '🎨', id: 'custom-orders' },
    ]

    const INSIDER_GAMES = [
      { name: 'Tic Tac Toe', emoji: '❌', id: 'tic-tac-toe' },
      { name: 'Connect Four', emoji: '🔴', id: 'connect-four' },
      { name: 'Memory Match', emoji: '🃏', id: 'memory-match' },
    ]

    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
        {/* Header */}
        <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', fontFamily: '"Poppins", sans-serif', letterSpacing: '1px' }}>
              <span style={{ color: 'var(--accent)' }}>CASEILY</span>
              <span style={{ color: 'var(--ink-strong)', fontWeight: '600' }}>insider</span>
            </span>
          </div>
          <button onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: '11px', fontWeight: '700', borderRadius: '12px', padding: '6px 12px', cursor: 'pointer', color: 'var(--ink-strong)' }}>Exit</button>
        </header>

        <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%', padding: '20px 16px' }}>



          {/* ─── INSIDER BANNER CAROUSEL ─── */}
          <InsiderBannerCarousel />

          {/* ─── MY INSIDER HUB ─── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '16px', marginBottom: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', pointerEvents: 'none', userSelect: 'none', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px' }}>🔒</span>
              <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink-strong)', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>My Insider Hub</h2>
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', justifyContent: 'center', flexWrap: 'wrap' }}>
              {INSIDER_MEMBERS.map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${m.color}, ${m.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent)', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                    {m.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--ink-muted)', fontWeight: '600', maxWidth: '50px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── QUICK POST ─── */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', padding: '20px', marginBottom: '20px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ink-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Post</div>
            <form onSubmit={handleUserCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', border: '1px dashed var(--border)' }}>
                    ＋
                    <input type="file" accept="image/*" multiple onChange={e => setUserPostPhotos(e.target.files)} style={{ display: 'none' }} />
                  </label>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px dashed var(--border)' }}>📷</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '2px' }}>CREATE AN INSIDER POST</div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>Share images, videos, and questions with the fam.</div>
                </div>
              </div>
              <textarea placeholder="What's on your mind?" value={userPostForm.content} onChange={e => setUserPostForm({...userPostForm, content: e.target.value})} rows={2} style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', outline: 'none', resize: 'vertical', fontSize: '14px', fontFamily: 'inherit', color: 'var(--ink-strong)' }} required />
              <button type="submit" style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent)', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '15px', letterSpacing: '0.5px', boxShadow: 'var(--shadow-btn)' }}>Post to Insider</button>
            </form>
          </div>

          {/* ─── EXCLUSIVE DROPS (full width, above rooms) ─── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent)', margin: '0 0 4px 0' }}>Exclusive Drops</h3>
              {drops.length > 0 ? (
                <div style={{ fontSize: '22px', fontWeight: '900', fontFamily: '"SF Mono", "Fira Code", monospace', color: 'var(--ink-strong)', letterSpacing: '1px' }}>
                  {drops[0].expires ? drops[0].expires.replace('Expires: ', '') : drops[0].title}
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>
                  Stay tuned for the next drop!
                </div>
              )}
            </div>
            <button onClick={() => { window.history.pushState({}, '', '/claim-drops'); setCurrentPath('/claim-drops'); window.scrollTo(0, 0); }} style={{ background: 'var(--accent)', color: '#ffffff', fontWeight: '700', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: 'var(--shadow-btn)' }}>
              {drops.length > 0 ? 'Claim Drop' : 'View Drops'}
            </button>
          </div>

          {/* ─── JOIN ROOM BRANDING ─── */}
          <div onClick={() => { window.history.pushState({}, '', '/join-rooms'); setCurrentPath('/join-rooms'); window.scrollTo(0, 0); }} style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '18px 20px', marginBottom: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>🚪</span>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)', margin: 0 }}>Explore Rooms</h3>
                <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontWeight: '600', marginTop: '2px' }}>Connect with insiders</div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>

          {/* ─── COMMUNITY CONTEST (full width, same size as games) ─── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '18px 20px', marginBottom: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>🏆</span>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)', margin: 0 }}>Community Contest</h3>
                  <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontWeight: '600', marginTop: '2px' }}>Best Case Design (July)</div>
                </div>
              </div>
              <button style={{ background: 'var(--accent)', color: '#ffffff', fontWeight: '700', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: 'var(--shadow-btn)' }}>
                Vote Now
              </button>
            </div>
          </div>

          {/* ─── INSIDER GAMES ─── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '18px 20px', marginBottom: '20px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)', margin: 0 }}>Insider Games</h3>
              <button onClick={() => { window.history.pushState({}, '', '/insider-games'); setCurrentPath('/insider-games'); window.scrollTo(0, 0); }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', padding: '6px 14px', color: 'var(--accent)', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                VIEW ALL <span style={{ fontSize: '14px' }}>›</span>
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {INSIDER_GAMES.map((g, i) => (
                <div key={i} onClick={() => { window.history.pushState({}, '', `/insider-game/${g.id}`); setCurrentPath(`/insider-game/${g.id}`); window.scrollTo(0, 0); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: '14px', padding: '10px 16px', border: '1px solid var(--border)', whiteSpace: 'nowrap', transition: 'transform 0.15s ease' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{g.emoji}</div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink-strong)' }}>{g.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── FULL INSIDER FEED (posts from API) ─── */}
          <div style={{ marginBottom: '100px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px' }}>📰 Latest Posts</h3>
            {insidersPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-muted)', background: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>No posts yet. Be the first to share!</div>
            ) : (
              insidersPosts.map(post => (
                <article key={post.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                      <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>{(post.author || 'U').charAt(0)}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--ink-strong)' }}>{post.author}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{new Date(post.created_at).toLocaleDateString()}</div>
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
                      <p style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '500', color: 'var(--ink-strong)', lineHeight: '1.5', wordBreak: 'break-word' }}>
                        {post.content}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                      <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-muted)', fontSize: '14px' }}>
                        ❤️ {post.likes || 0}
                      </button>
                    </div>

                    {post.type !== 'text' && (
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--ink-strong)', lineHeight: '1.5', wordBreak: 'break-word' }}>
                        <span style={{ fontWeight: '700', marginRight: '6px' }}>{post.author}</span>
                        {post.content}
                      </p>
                    )}

                    {post.comments && post.comments.length > 0 && (
                      <div style={{ marginBottom: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                        {post.comments.map(c => (
                          <div key={c.id} style={{ fontSize: '13px', marginBottom: '4px', color: 'var(--ink-strong)' }}>
                            <span style={{ fontWeight: '700', marginRight: '6px' }}>{c.author}</span>
                            {c.text}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        value={commentInput[post.id] || ''}
                        onChange={e => setCommentInput({...commentInput, [post.id]: e.target.value})}
                        style={{ border: 'none', flex: 1, outline: 'none', fontSize: '14px', background: 'transparent', color: 'var(--ink-strong)' }}
                      />
                      <button 
                        onClick={() => handleComment(post.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '700', cursor: 'pointer', opacity: commentInput[post.id]?.trim() ? 1 : 0.5 }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>

        {/* ─── BOTTOM ACTION BAR ─── */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '10px 0 12px', display: 'flex', justifyContent: 'space-around', zIndex: 50, boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' }}>
          <button style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent)', letterSpacing: '0.3px' }}>New Post</span>
          </button>
          <button style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"/><path d="M14 2h6a2 2 0 0 1 2 2v6"/><path d="M10 14L20 4"/></svg>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-muted)', letterSpacing: '0.3px' }}>Perks</span>
          </button>
          <button style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-muted)', letterSpacing: '0.3px' }}>Rules</span>
          </button>
        </div>
      </div>
    )
  }

  if (currentPath === '/join-rooms') {
    const INSIDER_ROOMS = [
      { name: 'Care, Skins & Installations', emoji: '🛡️', subtitle: 'Screen protector tips, case maintenance, and alignment help', desc: 'Practical troubleshooting, bubble-free installation videos, and cleaning advice that reduces customer support tickets.', id: 'care' },
      { name: 'Accessory Addicts Anonymous', emoji: '💸', subtitle: 'Confess how many cases you own vs. how many you use', desc: 'People post flat-lay shots of their drawer hoard—12 cases, 6 MagSafe wallets, 4 lanyards—and confess why they still felt the urge to buy another one this week.', id: 'addicts' },
      { name: 'Late-Night Work & Chill Lounge', emoji: '🎧', subtitle: 'Lo-fi beats, focus room, and casual after-hours talk', desc: 'A virtual "co-working lobby" where members drop their current Spotify jam or desk view, check in while burning the midnight oil, and chat during work breaks.', id: 'lounge' },
      { name: 'Weekend Plans & Getaways', emoji: '🏖️', subtitle: 'Road trips, chill Sundays, or doing absolutely nothing', desc: 'An easygoing lifestyle room to talk about weekend escapes, good local food spots, or simply bragging about sleeping until noon.', id: 'weekend' },
      { name: 'The Green Room / Member Hangout', emoji: '🛋️', subtitle: 'Casual open mic, say hi, and meet fellow insiders', desc: 'The default lobby of the community. Introduce yourself, drop a reaction, or just lurk and read through the daily chatter.', id: 'green-room' },
      { name: 'Dumb Meme Dumpster', emoji: '🗑️', subtitle: 'Zero context, stolen tech memes, pure brainrot', desc: 'Quick-hit humor room where anyone can dump their favorite tech reels, relatable WhatsApp stickers, or screenshot-worthy internet jokes without explanation.', id: 'memes' },
      { name: 'Flash Drop Friday (VIP Vault)', emoji: '⚡', subtitle: 'Limited drops, mystery discount codes, and quick giveaways', desc: 'Keeps retention high by training members to open the app at a specific weekly hour to catch secret perks or early stock access.', id: 'vault', locked: true },
    ]
    
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
        {/* Header */}
        <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <button onClick={() => { window.history.pushState({}, '', '/insiders'); setCurrentPath('/insiders'); window.scrollTo(0, 0); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)' }}>Explore Rooms</span>
          </div>
          <div style={{ width: '24px' }}></div>
        </header>

        <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%', padding: '20px 16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Available Rooms</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {INSIDER_ROOMS.map((r, i) => (
              <div key={i} onClick={async () => { 
                  if (!r.locked) { 
                    window.history.pushState({}, '', `/insider-room/${r.id}`); 
                    setCurrentPath(`/insider-room/${r.id}`); 
                    window.scrollTo(0, 0); 
                  } else {
                    const phone = window.prompt("Enter your phone number to access or request the VIP Vault:");
                    if (phone && phone.trim() !== "") {
                      try {
                        const checkRes = await fetch(`${API_URL}/api/insiders/vip-check`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone: phone.trim() })
                        });
                        const checkData = await checkRes.json();
                        
                        if (checkData.approved) {
                          window.history.pushState({}, '', `/insider-room/${r.id}`); 
                          setCurrentPath(`/insider-room/${r.id}`); 
                          window.scrollTo(0, 0);
                        } else if (checkData.status === "pending") {
                          alert("Your request is still pending. Our member will connect with you shortly.");
                        } else if (checkData.status === "rejected") {
                          alert("Your request for VIP access was not approved at this time.");
                        } else {
                          // Not found, so submit new request
                          const res = await fetch(`${API_URL}/api/insiders/vip-request`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone: phone.trim() })
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert("Our member will connect with you shortly");
                          } else {
                            alert("Failed to submit request.");
                          }
                        }
                      } catch (err) {
                        alert("Error connecting to server.");
                      }
                    }
                  } 
                }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'box-shadow 0.2s ease', opacity: r.locked ? 0.9 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{r.emoji}</div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ink-strong)' }}>{r.name} {r.locked && '🔒'}</div>
                      <div style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>{r.subtitle}</div>
                    </div>
                  </div>
                  {!r.locked && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '12px' }}><polyline points="9 18 15 12 9 6"></polyline></svg>}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (currentPath.startsWith('/insider-room/')) {
    const roomId = currentPath.split('/').pop()
    const roomDetails = {
      'care': { name: 'Care, Skins & Installations', emoji: '🛡️' },
      'addicts': { name: 'Accessory Addicts Anonymous', emoji: '💸' },
      'lounge': { name: 'Late-Night Work & Chill Lounge', emoji: '🎧' },
      'weekend': { name: 'Weekend Plans & Getaways', emoji: '🏖️' },
      'green-room': { name: 'The Green Room / Member Hangout', emoji: '🛋️' },
      'memes': { name: 'Dumb Meme Dumpster', emoji: '🗑️' },
      'vault': { name: 'Flash Drop Friday (VIP Vault)', emoji: '⚡' }
    }
    
    const room = roomDetails[roomId] || { name: 'Room', emoji: '🚪' }
    
    // Custom logic per room
    const isDarkMode = roomId === 'lounge';
    const bgPrimary = isDarkMode ? '#121212' : 'var(--bg-secondary)';
    const bgCard = isDarkMode ? '#1e1e1e' : 'var(--bg-card)';
    const textStrong = isDarkMode ? '#ffffff' : 'var(--ink-strong)';
    const textMuted = isDarkMode ? '#a0a0a0' : 'var(--ink-muted)';
    const borderColor = isDarkMode ? '#333333' : 'var(--border)';

    const isJoined = roomMemberships[roomId]?.joined || false;
    const isMuted = roomMemberships[roomId]?.muted || false;
    
    const handleJoin = () => {
      setRoomMemberships(prev => ({...prev, [roomId]: {...(prev[roomId] || {}), joined: true}}));
      setNotifications(prev => [{ id: Date.now(), text: `You joined ${room.name}` }, ...prev]);
      setHasUnread(true);
    };
    const handleLeave = () => {
      if(window.confirm('Are you sure you want to leave this room?')) {
        setRoomMemberships(prev => ({...prev, [roomId]: {...(prev[roomId] || {}), joined: false}}));
        setNotifications(prev => [{ id: Date.now(), text: `You left ${room.name}` }, ...prev]);
        setHasUnread(true);
      }
    };
    const handleToggleMute = () => setRoomMemberships(prev => ({...prev, [roomId]: {...(prev[roomId] || {}), muted: !isMuted}}));

    const renderRoomContent = () => {
      switch (roomId) {
        case 'care':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: bgCard, borderRadius: '16px', padding: '16px', border: `1px solid ${borderColor}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 12px 0', color: textStrong }}>Top Guides</h3>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  <a href="https://youtu.be/e7_VjVSBBlg" target="_blank" rel="noreferrer" style={{ width: '120px', flexShrink: 0, height: '80px', borderRadius: '8px', overflow: 'hidden', display: 'block', position: 'relative', textDecoration: 'none' }}>
                    <img src="https://img.youtube.com/vi/e7_VjVSBBlg/hqdefault.jpg" alt="Install Guide" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>▶ Install Guide</div>
                  </a>
                  <a href="https://youtu.be/e7_VjVSBBlg" target="_blank" rel="noreferrer" style={{ width: '120px', flexShrink: 0, height: '80px', borderRadius: '8px', overflow: 'hidden', display: 'block', position: 'relative', textDecoration: 'none' }}>
                    <img src="https://images.unsplash.com/photo-1601524909162-ae8725290836?q=80&w=300" alt="Case Cleaning" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>▶ Case Cleaning</div>
                  </a>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: bgCard, borderRadius: '16px', padding: '16px', border: `1px solid ${borderColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>S</div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: textStrong }}>Support Team <span style={{ color: '#22c55e', fontSize: '12px' }}>✓ Verified Advice</span></span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: textStrong, lineHeight: 1.5 }}>Make sure to use the included microfiber cloth and dust-removal sticker before applying your screen protector!</p>
                </div>
                {roomMessages.map((msg, i) => (
                  <div key={msg.id || i} style={{ background: bgCard, borderRadius: '16px', padding: '16px', border: `1px solid ${borderColor}` }}>
                    <p style={{ margin: 0, fontSize: '14px', color: textStrong, lineHeight: 1.5 }}>{msg.text}</p>
                    {msg.image && <img src={`${API_URL || ''}/uploads/${msg.image}`} style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} />}
                  </div>
                ))}
              </div>
            </div>
          )
        case 'addicts':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ height: '160px', borderRadius: '12px', background: 'url(/creators-club/how_it_works.png) center/cover', border: `1px solid ${borderColor}` }}></div>
                <div style={{ height: '160px', borderRadius: '12px', background: 'url(/creators-club/free_product.png) center/cover', border: `1px solid ${borderColor}` }}></div>
              </div>
              <div style={{ background: '#fef2f2', borderRadius: '16px', padding: '16px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#dc2626', marginBottom: '4px' }}>Confession #1042</div>
                <p style={{ margin: 0, fontSize: '15px', color: '#7f1d1d', fontStyle: 'italic' }}>"I just bought my 7th MagSafe wallet because it matched my new shoes... I need help."</p>
              </div>
              {roomMessages.map((msg, i) => (
                <div key={msg.id || i} style={{ background: '#fef2f2', borderRadius: '16px', padding: '16px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#dc2626', marginBottom: '4px' }}>Confession</div>
                  <p style={{ margin: 0, fontSize: '15px', color: '#7f1d1d', fontStyle: 'italic' }}>"{msg.text}"</p>
                  {msg.image && <img src={`${API_URL || ''}/uploads/${msg.image}`} style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} />}
                </div>
              ))}
            </div>
          )
        case 'lounge':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              <div style={{ background: 'linear-gradient(90deg, #4c1d95, #7c3aed)', borderRadius: '16px', padding: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🎧</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Currently Playing</div>
                  <div style={{ fontSize: '16px', fontWeight: '800' }}>Lo-fi chill beats to focus/study to</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>J</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>Jason • <span style={{ color: '#a78bfa' }}>🌙 Burning the midnight oil</span></div>
                    <div style={{ background: bgCard, padding: '12px', borderRadius: '0 12px 12px 12px', color: textStrong, fontSize: '14px' }}>Wrapping up this presentation. Anyone else still up?</div>
                  </div>
                </div>
                {roomMessages.map((msg, i) => (
                  <div key={msg.id || i} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>U</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>User • <span style={{ color: '#a78bfa' }}>🌙 Burning the midnight oil</span></div>
                      <div style={{ background: bgCard, padding: '12px', borderRadius: '0 12px 12px 12px', color: textStrong, fontSize: '14px' }}>
                        {msg.text}
                        {msg.image && <img src={`${API_URL || ''}/uploads/${msg.image}`} style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        case 'weekend':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ height: '200px', borderRadius: '16px', background: 'url(/banner_apple.png) center/cover', border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>📍 Current Vibe: Weekend Getaway</div>
              </div>
              <div style={{ background: bgCard, borderRadius: '16px', padding: '16px', border: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: textStrong, marginBottom: '8px' }}>📍 Miami Beach, FL</div>
                <p style={{ margin: 0, fontSize: '14px', color: textMuted }}>Just relaxing. Thinking about doing absolutely nothing today.</p>
              </div>
              {roomMessages.map((msg, i) => (
                <div key={msg.id || i} style={{ background: bgCard, borderRadius: '16px', padding: '16px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: textStrong, marginBottom: '8px' }}>📍 Somewhere, Earth</div>
                  <p style={{ margin: 0, fontSize: '14px', color: textMuted }}>{msg.text}</p>
                  {msg.image && <img src={`${API_URL || ''}/uploads/${msg.image}`} style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} />}
                </div>
              ))}
            </div>
          )
        case 'green-room':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '12px', borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '700' }}>
                👋 Welcome insiders!
              </div>
              {roomMessages.map((msg, i) => (
                <div key={msg.id || i} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👋</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: bgCard, padding: '12px', borderRadius: '0 12px 12px 12px', color: textStrong, fontSize: '14px', border: `1px solid ${borderColor}` }}>
                      {msg.text}
                      {msg.image && <img src={`${API_URL || ''}/uploads/${msg.image}`} style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        case 'memes':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {roomMessages.map((msg, i) => (
                <div key={msg.id || i} style={{ background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                  {msg.image ? (
                    <img src={`${API_URL || ''}/uploads/${msg.image}`} style={{ width: '100%', display: 'block', backgroundColor: '#e2e8f0', minHeight: '200px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: textStrong }}>{msg.text}</div>
                  )}
                  <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-around', background: 'var(--bg-secondary)' }}>
                    <span style={{ fontSize: '24px' }}>😂</span>
                    <span style={{ fontSize: '24px' }}>💀</span>
                  </div>
                </div>
              ))}
            </div>
          )
        case 'vault':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '16px', padding: '24px', border: '1px solid #334155', color: '#fff', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚡</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px' }}>VIP Vault Active</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                  You have unlocked exclusive access. Secret perks, limited drops, and early stock access will appear here weekly.
                </p>
                <div style={{ marginTop: '20px', display: 'inline-block', background: '#3b82f6', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Next Drop: Friday 12:00 PM
                </div>
              </div>

              <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '16px', border: '1px solid #fde68a', color: '#92400e' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎁</span> Current Perk
                </div>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                  Use code <strong style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px dashed #d97706' }}>VAULT20</strong> for 20% off all MagSafe accessories. Valid for the next 24 hours only.
                </p>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {roomMessages.map((msg, i) => (
                  <div key={msg.id || i} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>U</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: textMuted, marginBottom: '4px' }}>{msg.sender_name || 'VIP Member'}</div>
                      <div style={{ background: bgCard, padding: '12px', borderRadius: '0 12px 12px 12px', color: textStrong, fontSize: '14px', border: `1px solid ${borderColor}` }}>
                        {msg.text}
                        {msg.image && <img src={`${API_URL || ''}/uploads/${msg.image}`} style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        default:
          return <div style={{ textAlign: 'center', color: textMuted }}>Room content coming soon.</div>
      }
    }

    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: bgPrimary }}>
        {/* Header */}
        <header style={{ backgroundColor: bgCard, borderBottom: `1px solid ${borderColor}`, padding: '12px 20px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <button onClick={() => { window.history.pushState({}, '', '/join-rooms'); setCurrentPath('/join-rooms'); window.scrollTo(0, 0); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: textStrong, width: '40px', textAlign: 'left' }}>&larr;</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: textStrong, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>{room.emoji}</span> {room.name}
            </span>
          </div>
          <div style={{ width: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {isJoined && (
              <>
                <button onClick={handleToggleMute} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: isMuted ? textMuted : textStrong, padding: 0 }} title={isMuted ? "Unmute Room" : "Mute Room"}>
                  {isMuted ? '🔕' : '🔔'}
                </button>
                <button onClick={handleLeave} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#ef4444', padding: 0 }} title="Leave Room">
                  🚪
                </button>
              </>
            )}
          </div>
        </header>

        <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%', padding: '20px 16px', display: 'flex', flexDirection: 'column', paddingBottom: '80px' }}>
          {renderRoomContent()}
        </main>
        
        {/* Chat Input Bar */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: bgCard, borderTop: `1px solid ${borderColor}`, padding: '12px 16px', zIndex: 50, boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {!isJoined ? (
              <button onClick={handleJoin} style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: 'var(--shadow-btn)' }}>
                Join Group
              </button>
            ) : (
              <form onSubmit={(e) => handleSendMessage(roomId, e)} style={{ display: 'flex', gap: '12px' }}>
                <button type="button" style={{ background: bgPrimary, border: `1px solid ${borderColor}`, borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', flexShrink: 0, color: textStrong }}>＋</button>
                {roomId === 'memes' ? (
                  <button type="button" onClick={(e) => handleDumpMeme(roomId, e)} style={{ flex: 1, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>🗑️ Dump Meme</button>
                ) : (
                  <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder={`Message ${room.name}...`} style={{ flex: 1, background: bgPrimary, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '0 16px', fontSize: '14px', outline: 'none', color: textStrong }} />
                )}
                {roomId !== 'memes' && (
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: 'var(--shadow-btn)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentPath === '/claim-drops') {


    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
        <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <button onClick={() => { window.history.pushState({}, '', '/insiders'); setCurrentPath('/insiders'); window.scrollTo(0, 0); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>🎟️</span> Exclusive Claim Drops
            </span>
          </div>
          <div style={{ width: '24px' }}></div>
        </header>

        <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {drops.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-muted)' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎟️</span>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)', marginBottom: '8px' }}>No active drops right now</h3>
              <p style={{ fontSize: '15px' }}>Stay tuned! New exclusive drops are coming soon to the Insider fam.</p>
            </div>
          )}
          {drops.map((drop) => (
            <div key={drop._id} style={{ background: drop.disabled ? 'var(--bg-secondary)' : 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)', boxShadow: drop.disabled ? 'none' : 'var(--shadow-card)', opacity: drop.disabled ? 0.9 : 1 }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', position: 'relative' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#f1f5f9', flexShrink: 0, overflow: 'hidden' }}>
                  {drop.image && <img src={`${API_URL}/uploads/${drop.image}`} alt={drop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {drop.title && <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--ink-strong)' }}>{drop.title}</div>}
                  {drop.price && <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--ink-strong)' }}>{drop.price}</div>}
                  {drop.subtitle && <div style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>{drop.subtitle}</div>}
                </div>
                
                {drop.expires && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: drop.expireColor, color: drop.expireText, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                    {drop.expires}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button disabled={drop.disabled} style={{ padding: '12px', borderRadius: '12px', background: drop.disabled ? '#d1d5db' : '#22c55e', color: drop.disabled ? '#9ca3af' : '#fff', fontWeight: '800', border: 'none', cursor: drop.disabled ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                  {drop.disabled ? 'Ended' : 'Claim Drop'}
                </button>
                <button style={{ padding: '12px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </main>
      </div>
    )
  }

  if (currentPath === '/insider-games') {
    const games = [
      { name: 'Tic Tac Toe', emoji: '❌', id: 'tic-tac-toe', desc: 'Classic 3×3 grid. Beat the computer!' },
      { name: 'Connect Four', emoji: '🔴', id: 'connect-four', desc: 'Drop discs & connect 4 in a row!' },
      { name: 'Memory Match', emoji: '🃏', id: 'memory-match', desc: 'Flip cards & find matching pairs!' },
    ]
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
        <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <button onClick={() => { window.history.pushState({}, '', '/insiders'); setCurrentPath('/insiders'); window.scrollTo(0, 0); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)' }}>🎮 Insider Games</span>
          </div>
          <div style={{ width: '24px' }}></div>
        </header>
        <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%', padding: '20px 16px' }}>
          {games.map((g, i) => (
            <div key={i} onClick={() => { window.history.pushState({}, '', `/insider-game/${g.id}`); setCurrentPath(`/insider-game/${g.id}`); window.scrollTo(0, 0); }} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>{g.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink-strong)' }}>{g.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>{g.desc}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          ))}
        </main>
      </div>
    )
  }

  if (currentPath.startsWith('/insider-game/')) {
    const gameId = currentPath.split('/').pop()
    const goBack = () => { window.history.pushState({}, '', '/insider-games'); setCurrentPath('/insider-games'); window.scrollTo(0, 0); }

    const gameConfig = {
      'tic-tac-toe': { title: '❌ Tic Tac Toe', component: <TicTacToeGame />, desc: 'Tap any empty square to place your X. Get three in a row (horizontal, vertical, or diagonal) before the computer does!' },
      'connect-four': { title: '🔴 Connect Four', component: <ConnectFourGame />, desc: 'Tap the ▼ arrow to drop your red disc into a column. Connect four discs in a row — horizontally, vertically, or diagonally — to win!' },
      'memory-match': { title: '🃏 Memory Match', component: <MemoryMatchGame />, desc: 'Tap two cards to flip them. If they match, they stay face up. Find all 8 pairs in as few moves as possible!' },
    }

    const game = gameConfig[gameId]
    if (game) {
      return (
        <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
          <header style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
            <div style={{ flex: 1, textAlign: 'center' }}><span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink-strong)' }}>{game.title}</span></div>
            <div style={{ width: '24px' }}></div>
          </header>
          <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%', padding: '30px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {game.component}
            <div style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '14px 18px', border: '1px solid var(--border)', maxWidth: '320px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>How to Play</div>
              <div style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: '1.5' }}>{game.desc}</div>
            </div>
          </main>
        </div>
      )
    }
  }

  if (currentPath === '/reels') {
    const computedReels = [
      ...FALLBACK_REELS.map((r, i) => ({ ...r, index: i })),
      ...backendReels.map((r, i) => ({ 
        id: r.id, 
        videoSrc: r.is_local_promo ? `/${r.video}` : `${API_URL}/uploads/${r.video}`, 
        text: r.caption, 
        index: i + FALLBACK_REELS.length 
      }))
    ];
    return <ReelsPage allReels={computedReels} onClose={() => { window.history.pushState({}, '', '/'); setCurrentPath('/'); window.scrollTo(0, 0); }} API_URL={API_URL} />
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
                {publicNews.map((b) => (
                  <div key={b.id} onClick={() => { setSelectedNews(b); window.history.pushState({}, '', '/news-detail'); setCurrentPath('/news-detail'); window.scrollTo(0,0) }} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                    <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', backgroundColor: b.color }}>
                      {b.photo && <img src={`${API_URL}/uploads/${b.photo}`} alt="Article cover" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: b.color, marginBottom: '8px', textTransform: 'uppercase' }}>{b.category}</span>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--ink-strong)', lineHeight: 1.4 }}>{b.title}</h3>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>{new Date(b.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
                {publicNews.length === 0 && <p style={{ color: '#64748b', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No news available yet.</p>}
              </div>
           </div>
        </main>
      </div>
    )
  }

  if (currentPath === '/news-detail' && selectedNews) {
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-default)' }}>
        <header style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => { window.history.pushState({}, '', '/news'); setCurrentPath('/news'); window.scrollTo(0, 0); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '16px', color: 'var(--ink-strong)' }}>&larr;</button>
          <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--ink-strong)' }}>Article</div>
        </header>
        <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <div style={{ width: '100%', height: '240px', backgroundColor: selectedNews.color }}>
            {selectedNews.photo && <img src={`${API_URL}/uploads/${selectedNews.photo}`} alt="Article cover" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ padding: '24px 20px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: selectedNews.color, textTransform: 'uppercase' }}>{selectedNews.category}</span>
            <h1 style={{ margin: '8px 0 16px 0', fontSize: '28px', fontWeight: '900', color: 'var(--ink-strong)', lineHeight: 1.3 }}>{selectedNews.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: '#64748b', fontSize: '14px' }}>
              <span>{new Date(selectedNews.created_at).toLocaleString()}</span>
            </div>
            
            <div style={{ fontSize: '16px', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap', marginBottom: '40px' }}>
              {selectedNews.content}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <button onClick={async () => {
                  await fetch(`${API_URL}/api/news/${selectedNews.id}/like`, { method: 'POST' });
                  setSelectedNews(prev => ({...prev, likes: (prev.likes||0) + 1}));
                }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '16px', background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: '600' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {selectedNews.likes || 0} Likes
                </button>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Comments ({selectedNews.comments?.length || 0})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {selectedNews.comments?.map(c => (
                  <div key={c.id} style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--ink-strong)' }}>{c.username}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', color: '#334155' }}>{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const text = form.get('text');
                const username = form.get('username') || 'Anonymous User';
                const res = await fetch(`${API_URL}/api/news/${selectedNews.id}/comment`, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ text, username })
                });
                const data = await res.json();
                if (data.success) {
                  setSelectedNews(prev => ({...prev, comments: [...(prev.comments||[]), data.comment]}));
                  e.target.reset();
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input name="username" placeholder="Your name (optional)" style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                <textarea name="text" placeholder="Add a comment..." required rows="3" style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', resize: 'vertical', fontSize: '14px' }}></textarea>
                <button type="submit" style={{ padding: '14px', borderRadius: '12px', background: 'var(--ink-strong)', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Post Comment</button>
              </form>
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
                          <span className="flag">{c.country_iso ? isoToFlag(c.country_iso) : '🔍'}</span>
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
                  {loading && <div className="loading-container"><div className="spinner" /><p>Fetching from courier…</p><p className="loading-hint">This may take up to a minute</p></div>}
                  {error && <p className="status-text error">{error}</p>}
                  {result && (
                    <div className="result">
                      <div className="result-head">
                        <div className="oid">Tracking number</div>
                        <h2>{trackingNumber}</h2>
                        {result.courier_name && <div className="selected-courier-badge"><span className="badge-name">{result.courier_name}</span></div>}
                        <div className={getStatusPillClass(result.status_tag)}><span className="dot" />{result.status}</div>
                      </div>
                      {result.message && (
                        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--ink-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                          {result.message}
                        </div>
                      )}
                      {result.events && result.events.length > 0 && (
                        <div className="timeline" style={{ marginTop: '32px' }}>
                          {result.events.map((evt, i) => (
                            <div key={i} className={`tl-step ${i === 0 ? 'current' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
                              <div className="tl-step-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingLeft: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '15px', color: i === 0 ? 'var(--ink-strong)' : 'var(--ink)' }}>{evt.description}</h3>
                                <div style={{ fontSize: '12px', color: 'var(--ink-faint)', whiteSpace: 'nowrap' }}>
                                  {evt.datetime ? new Date(evt.datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                              </div>
                              {evt.location && (
                                <p className="step-location" style={{ paddingLeft: '8px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-muted)' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                  {evt.location}
                                </p>
                              )}
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


  return (
    <div className="app-wrapper">
      <SplashScreen />

      <div style={{ backgroundColor: '#ffffff', position: 'relative', zIndex: 1, paddingBottom: '80px' }}>
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
            <div className="desktop-logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }}>
              <span style={{ color: '#1e3fd1', fontWeight: 900, fontSize: 'clamp(20px, 4vw, 28px)', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase' }}>CASEILY</span>
              <span style={{ color: 'var(--ink-strong)', fontWeight: 700, fontSize: 'clamp(16px, 3vw, 22px)', fontFamily: '"Poppins", sans-serif', marginLeft: '2px' }}>insider</span>
            </div>
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
            <button onClick={() => setShowAuthModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--ink-strong)', marginRight: '8px' }} title="Profile">
              👤
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
          <div className="desktop-logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => { window.history.pushState({}, '', '/'); setCurrentPath('/') }}>
            <span style={{ color: '#1e3fd1', fontWeight: 900, fontSize: 'clamp(20px, 4vw, 24px)', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase' }}>CASEILY</span>
            <span style={{ color: 'var(--ink-strong)', fontWeight: 700, fontSize: 'clamp(16px, 3vw, 20px)', fontFamily: '"Poppins", sans-serif', marginLeft: '2px' }}>insider</span>
          </div>
          
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
        <div style={{ width: '100%', padding: '0', backgroundColor: 'transparent' }}>
          <img src="/hero-image-v3.png" alt="Caseily Hero" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
        </div>
      </div>

      <section id="track" style={{ position: 'relative', zIndex: 10, marginTop: '-64px', padding: '0 20px 40px' }}>
        
        {/* ─── AUTO-MOVING PROMO CAROUSEL ─── */}
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto 24px auto' }}>
          <div style={{ overflow: 'hidden', borderRadius: '32px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ 
              display: 'flex', 
              width: '200%', 
              transform: `translateX(-${currentPromoIndex * 50}%)`, 
              transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' 
            }}>
              <div style={{ width: '50%', flexShrink: 0, aspectRatio: '16/9' }}>
                <img src="/banner_wallet.png" alt="Caseilyplus+" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
              </div>
              <div style={{ width: '50%', flexShrink: 0, aspectRatio: '16/9' }}>
                <img src="/banner_apple.png" alt="Apple Event" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
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
              
              <div style={{ color: 'var(--accent)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '50%' }} onClick={() => { window.history.pushState({}, '', '/reels'); setCurrentPath('/reels'); window.scrollTo(0, 0); }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
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
        <div className="highlights-scroll" style={{ gap: '20px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
          {(() => {
            const dynamicHighlights = HIGHLIGHTS.map(h => {
              if (h.id === 'reviews') {
                const approvedPhotos = approvedReviews.filter(r => r.photo).map(r => `${API_URL}/uploads/${r.photo}`)
                return { ...h, stories: [...h.stories, ...approvedPhotos] }
              }
              return h
            })
            return dynamicHighlights.map(h => (
              <div key={h.id} className="highlight-item" onClick={() => { if (h.id === 'happy_customers') { window.history.pushState({}, '', '/insiders'); setCurrentPath('/insiders'); window.scrollTo(0, 0); } else { setActiveStoryHighlight(h); } }} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                <div className="highlight-ring" style={{ background: 'none', border: '2px solid #2563eb', padding: '4px' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {h.emoji ? (
                      <span style={{ fontSize: '32px' }}>{h.emoji}</span>
                    ) : (
                      <img src={h.cover} alt={h.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
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



      {/* ═══════════════════════════════════════════════════════════════
         COMMUNITY WALL
         ═══════════════════════════════════════════════════════════════ */}
      <section id="reviews" className="community-wall-section cursor-pointer">
        <CommunityWall 
          reviews={combinedReviews} 
          onBackgroundClick={() => {
            window.history.pushState({}, '', '/reviews');
            setCurrentPath('/reviews');
            window.scrollTo(0, 0);
          }} 
        />
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

      {/* ─── OUR HAPPY CUSTOMERS (REMOVED) ─── */}

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
          {publicNews.length > 1 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              {publicNews.slice(0, 4).map((b) => (
                <div key={b.id} onClick={() => { setSelectedNews(b); window.history.pushState({}, '', '/news-detail'); setCurrentPath('/news-detail'); window.scrollTo(0, 0); }} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', backgroundColor: b.color }}>
                    {b.photo && <img src={`${API_URL}/uploads/${b.photo}`} alt="Article cover" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: b.color, marginBottom: '4px', textTransform: 'uppercase' }}>{b.category}</span>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#000000', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.title}</h3>
                </div>
              ))}
            </div>
          ) : publicNews.length === 1 ? (
            <div onClick={() => { setSelectedNews(publicNews[0]); window.history.pushState({}, '', '/news-detail'); setCurrentPath('/news-detail'); window.scrollTo(0, 0); }} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', backgroundColor: publicNews[0].color }}>
                {publicNews[0].photo && <img src={`${API_URL}/uploads/${publicNews[0].photo}`} alt="Article cover" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '800', color: publicNews[0].color, marginBottom: '8px', textTransform: 'uppercase' }}>{publicNews[0].category}</span>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#000000', lineHeight: 1.3 }}>{publicNews[0].title}</h3>
            </div>
          ) : null}
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

      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000000, backdropFilter: 'blur(4px)' }} onClick={() => setShowAuthModal(false)}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--ink-strong)' }}>
                {currentUser ? 'Profile' : (authMode === 'login' ? 'Log In' : 'Sign Up')}
              </h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ink-muted)' }}>✕</button>
            </div>
            
            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>Name</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink-strong)' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--ink-muted)', marginTop: '8px' }}>Phone</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink-strong)' }}>{currentUser.phone}</div>
                </div>
                <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
                  Log Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {authError && <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', background: '#fee2e2', padding: '8px', borderRadius: '8px' }}>{authError}</div>}
                
                {authMode === 'signup' && (
                  <input type="text" placeholder="Full Name" required value={authForm.name} onChange={e => setAuthForm(f => ({...f, name: e.target.value}))} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', outline: 'none', background: 'var(--bg-default)', color: 'var(--ink-strong)' }} />
                )}
                <input type="tel" placeholder="Phone Number" required value={authForm.phone} onChange={e => setAuthForm(f => ({...f, phone: e.target.value}))} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', outline: 'none', background: 'var(--bg-default)', color: 'var(--ink-strong)' }} />
                <input type="password" placeholder="Password" required value={authForm.password} onChange={e => setAuthForm(f => ({...f, password: e.target.value}))} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', outline: 'none', background: 'var(--bg-default)', color: 'var(--ink-strong)' }} />
                
                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '8px' }}>
                  {authMode === 'login' ? 'Log In' : 'Sign Up'}
                </button>
                
                <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink-muted)', marginTop: '8px' }}>
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '700', cursor: 'pointer', padding: 0 }}>
                    {authMode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default App