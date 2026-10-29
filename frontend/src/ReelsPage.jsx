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
  const [retried, setRetried] = useState({})
  const [progress, setProgress] = useState({})
  const [toastMessage, setToastMessage] = useState('')
  const [showHeartBurst, setShowHeartBurst] = useState({})

  const containerRef = useRef(null)
  const videoRefs = useRef([])
  const lastTapRef = useRef(0)
  const tapTimeoutRef = useRef(null)

  // Hide Tawk.to live chat widget while Reels viewer is active so it never overlaps UI
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    try {
      if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
        window.Tawk_API.hideWidget()
      }
    } catch {}

    return () => {
      document.body.style.overflow = ''
      try {
        if (window.Tawk_API && typeof window.Tawk_API.showWidget === 'function') {
          window.Tawk_API.showWidget()
        }
      } catch {}
    }
  }, [])

  // Show a quick toast notification
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // Initialize likes from data
  useEffect(() => {
    const initLikes = {}
    allReels.forEach(r => {
      initLikes[r.id] = r.likes || 0
    })
    setLikes(initLikes)
  }, [allReels])

  // Play active video with autoplay fallback
  const playActiveVideo = (index) => {
    const v = videoRefs.current[index]
    if (!v) return

    videoRefs.current.forEach((otherV, idx) => {
      if (otherV && idx !== index) {
        otherV.pause()
        try { otherV.currentTime = 0 } catch {}
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
      threshold: 0.6
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

    // Trigger heart burst
    setShowHeartBurst(prev => ({ ...prev, [reelId]: true }))
    setTimeout(() => {
      setShowHeartBurst(prev => ({ ...prev, [reelId]: false }))
    }, 900)

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

  // Video time update for progress bar
  const handleTimeUpdate = (reelId, index) => {
    const v = videoRefs.current[index]
    if (!v || !v.duration) return
    const pct = (v.currentTime / v.duration) * 100
    setProgress(prev => ({ ...prev, [reelId]: pct }))
  }

  // Handle video error with auto-retry once
  const handleVideoError = (reel, index) => {
    console.warn("Video load error for reel:", reel.id, reel.videoSrc)
    if (!retried[reel.id]) {
      setRetried(prev => ({ ...prev, [reel.id]: true }))
      const v = videoRefs.current[index]
      if (v) {
        setTimeout(() => {
          v.src = reel.videoSrc
          v.load()
          v.play().catch(() => {})
        }, 500)
      }
    } else {
      setHasErrors(prev => ({ ...prev, [reel.id]: true }))
      setBuffering(prev => ({ ...prev, [reel.id]: false }))
    }
  }

  const manualReloadVideo = (reel, index) => {
    setHasErrors(prev => ({ ...prev, [reel.id]: false }))
    setBuffering(prev => ({ ...prev, [reel.id]: true }))
    const v = videoRefs.current[index]
    if (v) {
      v.src = reel.videoSrc
      v.load()
      v.play().catch(() => {})
    }
  }

  const loadComments = async (reelId) => {
    if (API_URL) {
      try {
        const res = await fetch(`${API_URL}/api/reels/${reelId}/comments`, { cache: 'no-store' })
        const data = await res.json()
        setComments(prev => ({ ...prev, [reelId]: data.comments || [] }))
      } catch {
        setComments(prev => ({ ...prev, [reelId]: [] }))
      }
    }
  }

  const submitComment = async () => {
    if (!commentText.trim() || !currentReel) return
    const newComment = { name: 'You', text: commentText.trim(), created_at: new Date().toISOString() }

    setComments(prev => ({
      ...prev,
      [currentReel.id]: [...(prev[currentReel.id] || []), newComment]
    }))
    const txt = commentText
    setCommentText('')

    if (API_URL) {
      try {
        await fetch(`${API_URL}/api/reels/${currentReel.id}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Guest', text: txt })
        })
      } catch (e) {
        console.error('Comment submission error:', e)
      }
    }
  }

  const formatCount = (n) => {
    if (!n) return '0'
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '70px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
          <span style={{ color: '#fff', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.3px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Caseily Reels
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
          {/* Mute/Unmute Toggle Button */}
          <button
            onClick={() => setMuted(!muted)}
            title={muted ? "Tap to unmute" : "Tap to mute"}
            style={{
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {muted ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                <span>Unmute</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                <span>Mute</span>
              </>
            )}
          </button>

          {/* Close Reels Button */}
          <button
            onClick={onClose}
            aria-label="Close Reels"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          padding: '8px 18px',
          borderRadius: '24px',
          fontSize: '13px',
          fontWeight: '600',
          zIndex: 50,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Main Snap-Scroll Container (100dvh for mobile address bar resilience) */}
      <div
        ref={containerRef}
        className="reels-scroller"
        style={{
          flex: 1,
          height: '100dvh',
          width: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          position: 'relative'
        }}
      >
        {allReels.map((reel, index) => {
          const isCurrent = index === currentIndex
          const isBuffering = buffering[reel.id]
          const isPaused = paused[reel.id]
          const isLiked = liked[reel.id]
          const hasError = hasErrors[reel.id]
          const likeCount = likes[reel.id] || 0
          const reelComments = comments[reel.id] || []
          const reelProgress = progress[reel.id] || 0

          // Smart preloading: active + next reel get auto preload, others metadata
          const preloadMode = isCurrent ? 'auto' : (index === currentIndex + 1 ? 'auto' : 'metadata')

          return (
            <div
              key={reel.id || index}
              style={{
                height: '100dvh',
                width: '100%',
                scrollSnapAlign: 'start',
                position: 'relative',
                backgroundColor: '#0b1120',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
              onClick={() => handleVideoTap(reel.id, index)}
            >
              {/* HTML5 Video Player */}
              <video
                ref={el => videoRefs.current[index] = el}
                data-index={index}
                data-id={reel.id}
                src={reel.videoSrc}
                poster={reel.thumbnailUrl || reel.thumbnail_url}
                loop
                playsInline
                webkit-playsinline="true"
                x5-playsinline="true"
                preload={preloadMode}
                muted={muted}
                onTimeUpdate={() => handleTimeUpdate(reel.id, index)}
                onWaiting={() => setBuffering(prev => ({ ...prev, [reel.id]: true }))}
                onPlaying={() => setBuffering(prev => ({ ...prev, [reel.id]: false }))}
                onCanPlay={() => setBuffering(prev => ({ ...prev, [reel.id]: false }))}
                onError={() => handleVideoError(reel, index)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: hasError ? 'none' : 'block'
                }}
              />

              {/* Error fallback card (only if video completely failed after automatic retry) */}
              {hasError && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0b1120',
                  color: '#fff',
                  padding: '24px',
                  textAlign: 'center',
                  zIndex: 10
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📹</div>
                  <div style={{ fontSize: '17px', fontWeight: '800', marginBottom: '6px' }}>Video Failed to Play</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '300px', marginBottom: '20px', lineHeight: '1.4' }}>
                    {reel.text || 'Unable to stream this video stream.'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      manualReloadVideo(reel, index)
                    }}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '12px',
                      background: '#1e3fd1',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      boxShadow: '0 4px 14px rgba(30, 63, 209, 0.4)'
                    }}
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
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  pointerEvents: 'none',
                  zIndex: 14
                }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              )}

              {/* Double-tap Heart Burst Animation */}
              {showHeartBurst[reel.id] && isCurrent && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '90px',
                  animation: 'heartBurst 0.9s ease forwards',
                  pointerEvents: 'none',
                  zIndex: 25
                }}>
                  ❤️
                </div>
              )}

              {/* Right Side Action Buttons */}
              <div style={{
                position: 'absolute',
                right: '12px',
                bottom: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '18px',
                zIndex: 20
              }}>
                {/* Like Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleLike(reel.id); }}
                  aria-label="Like reel"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease'
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : '#fff'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </div>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {formatCount(likeCount)}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowComments(true); loadComments(reel.id); }}
                  aria-label="View comments"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {reelComments.length}
                  </span>
                </button>

                {/* Share Button (Web Share API + Clipboard fallback) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const shareUrl = window.location.origin + '/reels'
                    if (navigator.share) {
                      navigator.share({
                        title: 'Caseily Reel',
                        text: reel.text || 'Watch this reel on Caseily!',
                        url: shareUrl
                      }).catch(() => {})
                    } else {
                      try {
                        navigator.clipboard.writeText(shareUrl)
                        showToast('✓ Link copied to clipboard!')
                      } catch {
                        showToast('Reel URL: ' + shareUrl)
                      }
                    }
                  }}
                  aria-label="Share reel"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </div>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Share</span>
                </button>
              </div>

              {/* Bottom Caption Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '0',
                right: '80px',
                padding: '80px 16px 20px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
                zIndex: 15,
                pointerEvents: 'none'
              }}>
                <div style={{ pointerEvents: 'auto' }}>
                  {/* Account Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e040fb, #ff5722)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '800',
                      fontSize: '14px',
                      border: '2px solid #fff'
                    }}>
                      C
                    </div>
                    <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      caseily.official
                    </span>
                  </div>

                  {/* Caption */}
                  <div style={{ color: '#fff', fontSize: '13px', lineHeight: '1.45', marginBottom: '8px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {reel.text}
                  </div>

                  {/* Audio Track */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3" fill="#fff"></circle><circle cx="18" cy="16" r="3" fill="#fff"></circle></svg>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                      Original Audio — caseily.official 🎵
                    </span>
                  </div>
                </div>
              </div>

              {/* Thin Bottom Progress Bar (Instagram-like) */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'rgba(255,255,255,0.25)',
                zIndex: 25
              }}>
                <div style={{
                  height: '100%',
                  width: `${reelProgress}%`,
                  background: '#fff',
                  transition: 'width 0.1s linear'
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Comments Drawer */}
      {showComments && currentReel && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: '60vh',
          background: '#0f172a',
          color: '#fff',
          borderRadius: '24px 24px 0 0',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
          animation: 'slideUp 0.25s ease'
        }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
              Comments ({(comments[currentReel.id] || []).length})
            </h3>
            <button
              onClick={() => setShowComments(false)}
              style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#fff' }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', maxHeight: '38vh' }}>
            {(!comments[currentReel.id] || comments[currentReel.id].length === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '14px' }}>
                No comments yet. Say something! 💬
              </div>
            ) : (
              (comments[currentReel.id] || []).map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `hsl(${(c.name || 'A').charCodeAt(0) * 37 % 360}, 60%, 50%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '13px',
                    flexShrink: 0
                  }}>
                    {(c.name || 'A')[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px', lineHeight: '1.4' }}>{c.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              placeholder="Add a comment..."
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.2)',
                outline: 'none',
                fontSize: '14px',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff'
              }}
            />
            <button
              onClick={submitComment}
              style={{
                background: '#1e5fd1',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}

      {/* Global Reel Animations and Styles */}
      <style>{`
        .reels-scroller::-webkit-scrollbar { display: none; }
        .reel-spinner {
          width: 38px;
          height: 38px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes heartBurst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.6); }
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  )
}
