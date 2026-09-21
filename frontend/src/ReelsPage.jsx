import React, { useState, useEffect, useRef } from 'react'

export default function ReelsPage({ allReels, onClose, API_URL }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likes, setLikes] = useState({})
  const [liked, setLiked] = useState({})
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState({})
  const [commentText, setCommentText] = useState('')
  const [showDesc, setShowDesc] = useState(false)
  const [muted, setMuted] = useState(false)
  
  const containerRef = useRef(null)
  const videoRefs = useRef([])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Initialize likes from data
  useEffect(() => {
    const initLikes = {}
    allReels.forEach(r => { initLikes[r.id] = r.likes || Math.floor(Math.random() * 500) + 50 })
    setLikes(initLikes)
  }, [allReels])

  // IntersectionObserver to auto-play/pause videos and track currentIndex
  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.6 // Video is considered "in view" when 60% visible
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        const index = parseInt(video.dataset.index, 10);
        
        if (entry.isIntersecting) {
          setCurrentIndex(index);
          // Play the video
          video.play().catch(() => {});
          setShowComments(false); // Auto-close comments when scrolling
          setShowDesc(false); // Auto-close descriptions
        } else {
          // Pause the video if it's out of view
          video.pause();
          video.currentTime = 0; // Optional: reset video
        }
      });
    }, options);

    videoRefs.current.forEach((v) => {
      if (v) observer.observe(v);
    });

    return () => {
      observer.disconnect();
    };
  }, [allReels]);

  // Load comments whenever currentIndex changes (if not already loaded)
  useEffect(() => {
    const currentReel = allReels[currentIndex];
    if (currentReel && !comments[currentReel.id]) {
        loadComments(currentReel.id);
    }
  }, [currentIndex, allReels]);

  const currentReel = allReels[currentIndex]

  const handleLike = (reelId) => {
    if (liked[reelId]) return
    setLiked(prev => ({ ...prev, [reelId]: true }))
    setLikes(prev => ({ ...prev, [reelId]: (prev[reelId] || 0) + 1 }))
    // Persist to backend for all reels (stub will be created if hardcoded)
    if (API_URL) {
      fetch(`${API_URL}/api/reels/${reelId}/like`, { method: 'POST' }).catch(() => {})
    }
  }

  const handleDoubleTap = (() => {
    let lastTap = 0
    return (reelId) => {
      const now = Date.now()
      if (now - lastTap < 300) { handleLike(reelId) }
      lastTap = now
    }
  })()

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
    return n
  }

  const descriptions = [
    'Premium quality case with military-grade drop protection. Available in multiple colors. Shop now! 🛒',
    'Ultra-slim design that fits perfectly in your pocket. MagSafe compatible. Limited edition! ✨',
    'Handcrafted with precision. Made from sustainable materials. Free shipping across India! 🇮🇳',
    'New arrival! This design is trending right now. Grab yours before it sells out! 🔥',
    'Collab with top creators. Exclusive design you won\'t find anywhere else. Link in bio! 🎨',
    'Customer favorite! Over 10,000 units sold. 4.9⭐ average rating. Order today! 💯'
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>Reels</span>
        <button onClick={() => setMuted(!muted)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' }}>
          {muted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          )}
        </button>
      </div>

      {/* Scrollable Container (Replaces manual swiping) */}
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
          
          return (
            <div key={reel.id} style={{ height: '100vh', width: '100%', scrollSnapAlign: 'start', position: 'relative' }} onClick={() => handleDoubleTap(reel.id)}>
              <video
                ref={el => videoRefs.current[index] = el}
                data-index={index}
                src={reel.videoSrc}
                loop
                playsInline
                muted={muted}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Like animation */}
              {isLiked && isCurrent && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '80px', animation: 'fadeOut 0.8s ease forwards', pointerEvents: 'none' }}>❤️</div>
              )}

              {/* Right side action buttons */}
              <div style={{ position: 'absolute', right: '12px', bottom: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 15 }}>
                {/* Like */}
                <button onClick={(e) => { e.stopPropagation(); handleLike(reel.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>{formatCount(likeCount)}</span>
                </button>

                {/* Comment */}
                <button onClick={(e) => { e.stopPropagation(); setShowComments(true); loadComments(reel.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>{reelComments.length}</span>
                </button>

                {/* Share */}
                <button onClick={(e) => e.stopPropagation()} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>Share</span>
                </button>

                {/* More */}
                <button onClick={(e) => { e.stopPropagation(); setShowDesc(!showDesc); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                </button>
              </div>

              {/* Bottom info (username + caption) */}
              <div style={{ position: 'absolute', bottom: '0', left: '0', right: '70px', padding: '60px 16px 24px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', zIndex: 10 }}>
                {/* Profile row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #e040fb, #ff5722)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '14px', border: '2px solid #fff' }}>C</div>
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>caseily.official</span>
                  <button style={{ background: 'transparent', border: '1px solid #fff', borderRadius: '6px', padding: '4px 14px', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Follow</button>
                </div>
                {/* Caption */}
                <div style={{ color: '#fff', fontSize: '13px', lineHeight: '1.5', marginBottom: '8px' }}>
                  {reel.text}
                  {isCurrent && showDesc && (
                    <div style={{ marginTop: '8px', color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: '1.6' }}>
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
                {/* Music bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3" fill="#fff"></circle><circle cx="18" cy="16" r="3" fill="#fff"></circle></svg>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', whiteSpace: 'nowrap', animation: 'scrollText 8s linear infinite' }}>
                      Original Audio — caseily.official • Trending 🎵
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comments bottom sheet (Global to the page, tied to currentIndex) */}
      {showComments && currentReel && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '60vh', background: 'var(--bg-card, #fff)', borderRadius: '20px 20px 0 0', zIndex: 30, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease' }}>
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
        <div onClick={() => setShowDesc(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 15 }}></div>
      )}

      {/* CSS animations */}
      <style>{`
        .reels-scroller::-webkit-scrollbar { display: none; }
        @keyframes fadeOut { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes scrollText { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>
    </div>
  )
}
