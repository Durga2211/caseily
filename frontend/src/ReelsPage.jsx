import React, { useState, useEffect, useRef } from 'react'

export default function ReelsPage({ allReels = [], onClose, API_URL }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likes, setLikes] = useState({})
  const [liked, setLiked] = useState({})
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState({})
  const [commentText, setCommentText] = useState('')
  const [showDesc, setShowDesc] = useState(false)
  const [muted, setMuted] = useState(true) // Start muted so all browsers permit instant autoplay
  const [paused, setPaused] = useState({})
  const [buffering, setBuffering] = useState({})
  const [hasErrors, setHasErrors] = useState({})
  const [showMuteHint, setShowMuteHint] = useState(true)

  const containerRef = useRef(null)
  const videoRefs = useRef([])
  const lastTapRef = useRef(0)
  const tapTimeoutRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Fade out mute hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowMuteHint(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  // Initialize likes from data
  useEffect(() => {
    const initLikes = {}
    allReels.forEach(r => { initLikes[r.id] = r.likes || Math.floor(Math.random() * 500) + 50 })
    setLikes(initLikes)
  }, [allReels])

  // Play active video with autoplay fallback
  const playActiveVideo = (index) => {
    const v = videoRefs.current[index]
    if (!v) return

    videoRefs.current.forEach((otherV, idx) => {
      if (otherV && idx !== index) {
        otherV.pause()
        otherV.currentTime = 0
      }
    })

    if (!paused[allReels[index]?.id]) {
      v.muted = muted
      const playPromise = v.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocked unmuted autoplay, mute and retry
          v.muted = true
          setMuted(true)
          v.play().catch(() => {})
        })
      }
    }
  }

  // Auto-play active reel on index change or mount
  useEffect(() => {
    if (allReels.length > 0) {
      playActiveVideo(currentIndex)
    }
  }, [currentIndex, allReels])

  // Sync mute state across all video elements
  useEffect(() => {
    videoRefs.current.forEach(v => {
      if (v) v.muted = muted
    })
  }, [muted])

  // IntersectionObserver to track active slide during scroll
  useEffect(() => {
    if (!containerRef.current) return
    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.55
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index, 10)
          if (!isNaN(index) && index !== currentIndex) {
            setCurrentIndex(index)
            setShowComments(false)
            setShowDesc(false)
          }
        }
      })
    }, options)

    videoRefs.current.forEach((v) => {
      if (v) observer.observe(v)
    })

    return () => observer.disconnect()
  }, [allReels, currentIndex])

  // Load comments on reel change
  useEffect(() => {
    const currentReel = allReels[currentIndex]
    if (currentReel && !comments[currentReel.id]) {
      loadComments(currentReel.id)
    }
  }, [currentIndex, allReels])

  const currentReel = allReels[currentIndex]

  const handleLike = (reelId) => {
    if (liked[reelId]) return
    setLiked(prev => ({ ...prev, [reelId]: true }))
    setLikes(prev => ({ ...prev, [reelId]: (prev[reelId] || 0) + 1 }))
    if (API_URL) {
      fetch(`${API_URL}/api/reels/${reelId}/like`, { method: 'POST' }).catch(() => {})
    }
  }

  // Handle single tap (Play/Pause) vs double tap (Like)
  const handleVideoTap = (reelId, index) => {
    const now = Date.now()
    const diff = now - lastTapRef.current

    if (diff < 300) {
      // Double tap -> Like
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
      handleLike(reelId)
      lastTapRef.current = 0
    } else {
      // Single tap -> Toggle Play/Pause after short delay
      lastTapRef.current = now
      tapTimeoutRef.current = setTimeout(() => {
        const v = videoRefs.current[index]
        if (!v) return
        if (v.paused) {
          v.play().catch(() => {})
          setPaused(prev => ({ ...prev, [reelId]: false }))
        } else {
          v.pause()
          setPaused(prev => ({ ...prev, [reelId]: true }))
        }
      }, 250)
    }
  }

  const loadComments = async (reelId) => {
    if (API_URL) {
      try {
        const res = await fetch(`${API_URL}/api/reels/${reelId}/comments`)
        const data = await res.json()
        setComments(prev => ({ ...prev, [reelId]: data.comments || [] }))
      } catch (e) { /* use local */ }
    }
    if (!comments[reelId]) {
      setComments(prev => ({ ...prev, [reelId]: [] }))
    }
  }

  const submitComment = async () => {
    if (!commentText.trim() || !currentReel) return
    const id = currentReel.id
    const newComment = { id: Date.now().toString(), name: 'You', text: commentText, created_at: new Date().toISOString() }
    setComments(prev => ({ ...prev, [id]: [...(prev[id] || []), newComment] }))
    setCommentText('')

    if (API_URL) {
      fetch(`${API_URL}/api/reels/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'User', text: newComment.text })
      }).catch(() => {})
    }
  }

  const formatCount = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n || 0
  }

  const descriptions = [
    'Military-grade drop protection tested from 10ft. Available in multiple finishes. 🛒',
    'Ultra-slim aerodynamic profile. MagSafe snap aligned. Limited batch drop! ✨',
    'Handcrafted precision engineered with tactile aerospace buttons. Free shipping across India! 🇮🇳',
    'Fresh arrival! Trending design built for daily drops and high-pace adventures. 🔥',
    'Creator edition collab. Scratch-resistant frosted finish that resists yellowing! 🎨',
    'Customer top pick! Rated 4.9⭐ for drop absorption and grip texture. 💯'
  ]

  if (!allReels || allReels.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <p>No reels available right now.</p>
        <button onClick={onClose} style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '8px', background: '#1e3fd1', color: '#fff', border: 'none', cursor: 'pointer' }}>Close</button>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }}>
        <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Reels</span>
        <button onClick={() => { setMuted(!muted); setShowMuteHint(false); }} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          )}
        </button>
      </div>

      {/* Floating Mute Hint Pill */}
      {muted && showMuteHint && (
        <div
          onClick={() => { setMuted(false); setShowMuteHint(false); }}
          style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <span>🔇</span> Tap to Unmute
        </div>
      )}

      {/* Scrollable Reels Container */}
      <div
        ref={containerRef}
        style={{ flex: 1, position: 'relative', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="reels-scroller"
      >
        {allReels.map((reel, index) => {
          const reelComments = comments[reel.id] || []
          const isLiked = liked[reel.id]
          const likeCount = likes[reel.id] || 0
          const isCurrent = currentIndex === index
          const isPaused = paused[reel.id]
          const isBuffering = buffering[reel.id]
          const hasError = hasErrors[reel.id]

          return (
            <div
              key={reel.id || index}
              style={{ height: '100vh', width: '100%', scrollSnapAlign: 'start', position: 'relative', backgroundColor: '#0b1120' }}
              onClick={() => handleVideoTap(reel.id, index)}
            >
              {/* HTML5 Video Player */}
              <video
                ref={el => videoRefs.current[index] = el}
                data-index={index}
                data-id={reel.id}
                src={reel.videoSrc}
                loop
                playsInline
                webkit-playsinline="true"
                x5-playsinline="true"
                preload="auto"
                muted={muted}
                onWaiting={() => setBuffering(prev => ({ ...prev, [reel.id]: true }))}
                onPlaying={() => setBuffering(prev => ({ ...prev, [reel.id]: false }))}
                onCanPlay={() => setBuffering(prev => ({ ...prev, [reel.id]: false }))}
                onError={(e) => {
                  console.error("Video error on reel:", reel.id, reel.videoSrc, e)
                  setHasErrors(prev => ({ ...prev, [reel.id]: true }))
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: hasError ? 'none' : 'block' }}
              />

              {/* Error fallback card */}
              {hasError && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b1120', color: '#fff', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📹</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>Video Preview</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '280px', marginBottom: '16px' }}>{reel.text}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setHasErrors(prev => ({ ...prev, [reel.id]: false }))
                      if (videoRefs.current[index]) {
                        videoRefs.current[index].load()
                        videoRefs.current[index].play().catch(() => {})
                      }
                    }}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: '#1e3fd1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                  >
                    ↻ Reload Video
                  </button>
                </div>
              )}

              {/* Buffering Spinner */}
              {isBuffering && isCurrent && !hasError && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 12, pointerEvents: 'none' }}>
                  <div className="reel-spinner"></div>
                </div>
              )}

              {/* Pause Icon Indicator */}
              {isPaused && isCurrent && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', pointerEvents: 'none', zIndex: 14 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              )}

              {/* Like heart burst animation */}
              {isLiked && isCurrent && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '80px', animation: 'fadeOut 0.8s ease forwards', pointerEvents: 'none', zIndex: 25 }}>❤️</div>
              )}

              {/* Right Side Action Buttons */}
              <div style={{ position: 'absolute', right: '12px', bottom: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', zIndex: 20 }}>
                {/* Like */}
                <button onClick={(e) => { e.stopPropagation(); handleLike(reel.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </div>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{formatCount(likeCount)}</span>
                </button>

                {/* Comment */}
                <button onClick={(e) => { e.stopPropagation(); setShowComments(true); loadComments(reel.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{reelComments.length}</span>
                </button>

                {/* Share */}
                <button onClick={(e) => {
                  e.stopPropagation()
                  if (navigator.share) {
                    navigator.share({ title: 'Caseily Reel', text: reel.text, url: window.location.href }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Reel link copied to clipboard!')
                  }
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </div>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Share</span>
                </button>

                {/* Info / Description toggle */}
                <button onClick={(e) => { e.stopPropagation(); setShowDesc(!showDesc); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                  </div>
                </button>
              </div>

              {/* Bottom Info Section (Username, Caption, Music) */}
              <div style={{ position: 'absolute', bottom: '0', left: '0', right: '70px', padding: '80px 16px 28px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', zIndex: 15, pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto' }}>
                  {/* Profile Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #e040fb, #ff5722)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '14px', border: '2px solid #fff' }}>C</div>
                    <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>caseily.official</span>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '6px', padding: '3px 12px', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Follow</button>
                  </div>

                  {/* Caption */}
                  <div style={{ color: '#fff', fontSize: '13px', lineHeight: '1.4', marginBottom: '8px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {reel.text}
                    {isCurrent && showDesc && (
                      <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.9)', fontSize: '12px', lineHeight: '1.5' }}>
                        {descriptions[index % descriptions.length]}
                        <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#8ecafc' }}>#caseily</span>
                          <span style={{ color: '#8ecafc' }}>#phonecase</span>
                          <span style={{ color: '#8ecafc' }}>#premium</span>
                          <span style={{ color: '#8ecafc' }}>#trending</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Audio Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3" fill="#fff"></circle><circle cx="18" cy="16" r="3" fill="#fff"></circle></svg>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', whiteSpace: 'nowrap', animation: 'scrollText 9s linear infinite' }}>
                        Original Audio — caseily.official • Trending 🎵
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comments Bottom Sheet */}
      {showComments && currentReel && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '60vh', background: 'var(--bg-card, #fff)', borderRadius: '20px 20px 0 0', zIndex: 40, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease' }}>
          <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--ink-strong, #111)' }}>Comments ({(comments[currentReel.id] || []).length})</h3>
            <button onClick={() => setShowComments(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ink-strong, #111)' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', maxHeight: '40vh' }}>
            {(!comments[currentReel.id] || comments[currentReel.id].length === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-muted, #999)', fontSize: '14px' }}>No comments yet. Be the first! 💬</div>
            ) : (
              (comments[currentReel.id] || []).map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${(c.name || 'A').charCodeAt(0) * 37 % 360}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>{(c.name || 'A')[0]}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink-strong, #111)' }}>{c.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-muted, #555)', marginTop: '2px', lineHeight: '1.4' }}>{c.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border, #e5e7eb)', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              placeholder="Add a comment..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid var(--border, #e5e7eb)', outline: 'none', fontSize: '14px', background: 'var(--bg-secondary, #f5f5f5)', color: 'var(--ink-strong, #111)' }}
            />
            <button onClick={submitComment} style={{ background: 'var(--accent, #1e5fd1)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}

      {/* Description overlay */}
      {showDesc && !showComments && (
        <div onClick={() => setShowDesc(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 18 }}></div>
      )}

      {/* CSS Styles */}
      <style>{`
        .reels-scroller::-webkit-scrollbar { display: none; }
        .reel-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeOut { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes scrollText { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  )
}
