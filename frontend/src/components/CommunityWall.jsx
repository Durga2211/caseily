import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Box, Star, FileText, Film, Users,
  ChevronLeft, ChevronRight, ArrowRight, X
} from 'lucide-react';

/* ── Review Data ── */
const REVIEWS_DATA = [
  {
    id: '1', name: 'Sarah Jenkins', initials: 'SJ', verified: true,
    date: '2 days ago', rating: 5.0, tag: 'Highly Recommended',
    reviewText: "I was honestly blown away by the quality. The attention to detail is just incredible, and the customer service team was so helpful when I had questions. I've already recommended this to three of my friends. Will definitely be purchasing again soon! The packaging was also totally premium.",
    type: 'written', hasPhoto: true,
  },
  {
    id: '2', name: 'Michael Chen', initials: 'MC', verified: true,
    date: '1 week ago', rating: 5.0, tag: 'Highly Recommended',
    reviewText: "Best purchase I've made this year. It fits perfectly into my daily workflow and saves me hours of time every single week. The build quality feels solid and durable. Honestly, I can't imagine going back to how I did things before. Worth every penny.",
    type: 'product', hasPhoto: false,
  },
  {
    id: '3', name: 'Emily Davis', initials: 'ED', verified: true,
    date: '3 weeks ago', rating: 4.8, tag: 'Great Value',
    reviewText: "Really love the aesthetic and how smooth everything operates. It took me a little bit to get used to the new features, but once I did, it was smooth sailing. The community around this is also amazing. So many helpful tips and tricks shared daily.",
    type: 'testimonial', hasPhoto: true,
  },
  {
    id: '4', name: 'David Wilson', initials: 'DW', verified: false,
    date: '1 month ago', rating: 5.0, tag: 'Highly Recommended',
    reviewText: "Exceeded all my expectations. The video tutorials were super helpful to get started quickly. I'm seeing immediate results and my team is much happier. Highly recommend giving this a try if you're on the fence.",
    type: 'video', hasPhoto: false,
  },
  {
    id: '5', name: 'Priya Sharma', initials: 'PS', verified: true,
    date: '5 days ago', rating: 5.0, tag: 'Must Have',
    reviewText: "Absolutely love everything about this! The quality is top-notch and the design is sleek. I've been using it daily and it hasn't let me down once. Customer support was also incredibly responsive when I had a question. 10/10 would recommend to anyone looking for the best.",
    type: 'written', hasPhoto: true,
  },
];

const FILTERS = ['All Reviews 💬', '5-Star Rating ⭐'];


/* ── Card gradient palettes ── */
const CARD_THEMES = [
  { bg: 'linear-gradient(135deg, #4f46e5, #7c3aed)', fade: '#7c3aed', btnText: '#6d28d9' },
  { bg: 'linear-gradient(135deg, #0891b2, #2563eb)', fade: '#2563eb', btnText: '#1d4ed8' },
  { bg: 'linear-gradient(135deg, #db2777, #9333ea)', fade: '#9333ea', btnText: '#7e22ce' },
  { bg: 'linear-gradient(135deg, #059669, #0d9488)', fade: '#0d9488', btnText: '#0f766e' },
  { bg: 'linear-gradient(135deg, #ea580c, #dc2626)', fade: '#dc2626', btnText: '#b91c1c' },
];

/* ── Styles ── */
const S = {
  wrapper: {
    width: '100%', maxWidth: 400, margin: '0 auto', display: 'flex',
    flexDirection: 'column', alignItems: 'center', position: 'relative',
    fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
    padding: '32px 32px 100px 16px', boxSizing: 'border-box',
    overflow: 'visible',
  },
  header: {
    width: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'flex-start', marginBottom: 20, zIndex: 10,
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  iconBubble: {
    width: 40, height: 40, borderRadius: '50%', background: '#eff6ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb',
  },
  title: {
    fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5,
    background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  pillRow: {
    width: '100%', display: 'flex', gap: 8, overflowX: 'auto',
    paddingBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
  },
  pill: (active) => ({
    whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 100,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: active ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
    background: active ? '#0f172a' : '#ffffff', color: active ? '#fff' : '#475569',
    transition: 'all 0.25s ease', fontFamily: 'inherit',
  }),
  stackArea: {
    position: 'relative', width: '100%', height: 400,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, padding: '0 24px', boxSizing: 'border-box',
  },
  card: {
    position: 'absolute', width: 'calc(100% - 60px)', maxWidth: 310, height: 380,
    borderRadius: 22, padding: '20px 16px', boxSizing: 'border-box',
    color: '#fff', display: 'flex', flexDirection: 'column',
    cursor: 'grab', overflow: 'hidden',
    border: '1.5px solid rgba(255,255,255,0.22)',
    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.35)',
  },
  avatar: {
    width: 42, height: 42, borderRadius: '50%', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 16, border: '2px solid rgba(255,255,255,0.5)',
    flexShrink: 0,
  },
  verifiedPill: {
    fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em',
    fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '2px 8px',
    borderRadius: 100, marginTop: 3, width: 'max-content',
  },
  datePill: {
    fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.65)',
    background: 'rgba(0,0,0,0.15)', padding: '3px 10px', borderRadius: 100,
    flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px',
  },
  ratingPill: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    background: 'rgba(255,255,255,0.18)', padding: '4px 10px',
    borderRadius: 100, border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(6px)',
  },
  tagPill: {
    fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.12)',
    padding: '5px 12px', borderRadius: 100,
    border: '1px solid rgba(255,255,255,0.12)',
  },
  reviewText: {
    fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)',
    display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical',
    overflow: 'hidden', margin: 0,
  },
  readBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#fff', padding: '9px 18px', borderRadius: 100,
    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)', transition: 'transform 0.2s',
  },
  navArrow: (side) => ({
    position: 'absolute', [side]: -15, top: '50%', transform: 'translateY(-50%)',
    width: 36, height: 36, borderRadius: '50%', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    cursor: 'pointer', zIndex: 40, color: '#1e293b', transition: 'transform 0.2s',
  }),
  dock: {
    width: '100%', maxWidth: 290, margin: '0 auto',
    background: '#fff', borderRadius: 100, padding: 5,
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9',
  },
  dockBtn: (active) => ({
    position: 'relative', width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', border: 'none', background: 'transparent',
    color: active ? '#fff' : '#94a3b8', transition: 'color 0.25s',
    zIndex: 1,
  }),
  dockBubble: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    background: '#2563eb', zIndex: -1,
  },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)',
  },
  modal: {
    background: '#fff', width: '100%', maxWidth: 380, borderRadius: 24,
    padding: 24, position: 'relative',
    boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 14, width: 36, height: 36,
    borderRadius: '50%', background: '#f1f5f9', display: 'flex',
    alignItems: 'center', justifyContent: 'center', border: 'none',
    cursor: 'pointer', color: '#64748b',
  },
};

export default function CommunityWall({ reviews = REVIEWS_DATA, onBackgroundClick }) {
  const [activeFilter, setActiveFilter] = useState('All Reviews 💬');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize backend reviews to expected format
  const normalizedReviews = (reviews || []).map((r, i) => {
    if (r.reviewText) return r; // already in format
    
    // Convert from backend format (name, time, text, image, stars)
    const name = r.name || 'Anonymous';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    return {
      id: r.id || String(i),
      name: name,
      initials: initials || 'US',
      verified: true, 
      date: r.time || r.date || 'recently',
      rating: Number(r.stars || r.rating || 5.0),
      tag: 'Community',
      reviewText: r.text || '',
      type: r.image ? 'product' : 'written',
      hasPhoto: !!r.image,
      image: r.image
    };
  });

  // Derive filtered reviews
  let filtered = [...normalizedReviews];
  if (activeFilter === '5-Star Rating ⭐') filtered = filtered.filter(r => r.rating >= 4.5);
  if (filtered.length === 0) filtered = normalizedReviews;

  const safeIndex = filtered.length > 0 ? (currentIndex % filtered.length || 0) : 0;

  const next = useCallback(() => setCurrentIndex(i => (i + 1) % filtered.length), [filtered.length]);
  const prev = useCallback(() => setCurrentIndex(i => (i - 1 + filtered.length) % filtered.length), [filtered.length]);

  const handleDragEnd = (_, { offset, velocity }) => {
    if (offset.x < -50 || velocity.x < -500) next();
    else if (offset.x > 50 || velocity.x > 500) prev();
  };

  return (
    <div style={S.wrapper}>
      {/* ── HEADER ── */}
      <div style={S.header} onClick={(e) => e.stopPropagation()}>
        <div style={S.titleRow}>
          <div style={S.iconBubble}><MessageCircle size={22} strokeWidth={2.5} /></div>
          <h2 style={S.title}>Community Wall</h2>
        </div>
        <div style={S.pillRow}>
          {FILTERS.map(f => (
            <button key={f} style={S.pill(activeFilter === f)}
              onClick={() => { setActiveFilter(f); setCurrentIndex(0); }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── CARD STACK ── */}
      <div style={S.stackArea}>
        {filtered.length === 0 ? (
           <div style={{ color: '#64748b', fontSize: '15px' }}>No reviews yet. Be the first to leave one!</div>
        ) : (
          <AnimatePresence mode="popLayout">
            {[2, 1, 0].map(offset => {
              const idx = (safeIndex + offset) % filtered.length;
              const review = filtered[idx];
            if (!review) return null;
            if (offset > 0 && filtered.length <= offset) return null;
            const theme = CARD_THEMES[idx % CARD_THEMES.length];

            return (
              <motion.div
                key={`${review.id}-stack-${offset}`}
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{
                  scale: offset === 0 ? 1 : offset === 1 ? 0.95 : 0.9,
                  y: offset === 0 ? 0 : offset === 1 ? 10 : 20,
                  rotate: offset === 0 ? 0 : offset === 1 ? 2.5 : -2.5,
                  zIndex: 30 - offset * 10,
                  opacity: offset === 0 ? 1 : offset === 1 ? 0.75 : 0.45,
                }}
                exit={{ scale: 1.05, opacity: 0, y: -30 }}
                transition={{ duration: 0 }}
                style={{ ...S.card, background: theme.bg, cursor: offset === 0 ? 'pointer' : 'default' }}
                onClick={offset === 0 ? onBackgroundClick : undefined}
              >
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ ...S.avatar, color: theme.btnText }}>{review.initials}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{review.name}</div>
                      {review.verified && <div style={S.verifiedPill}>✓ Verified Buyer</div>}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={S.ratingPill}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="#facc15" color="#facc15" />
                    ))}
                    <span style={{ fontWeight: 700, fontSize: 13, marginLeft: 4 }}>{review.rating.toFixed(1)}</span>
                  </div>
                  <span style={S.tagPill}>{review.tag}</span>
                </div>

                {/* Review Text */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', marginBottom: 12 }}>
                  <p style={S.reviewText}>"{review.reviewText}"</p>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
                    background: `linear-gradient(to top, ${theme.fade}, transparent)`,
                    pointerEvents: 'none',
                  }} />
                </div>

                {/* Action */}
                <button
                  onClick={onBackgroundClick}
                  style={{ ...S.readBtn, color: theme.btnText }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Read full story <ArrowRight size={15} />
                </button>
              </motion.div>
            );
          })}
          </AnimatePresence>
        )}

        {/* Nav Arrows */}
        {filtered.length > 1 && (
          <>
            <button style={S.navArrow('left')} onClick={(e) => { e.stopPropagation(); prev(); }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}>
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button style={S.navArrow('right')} onClick={(e) => { e.stopPropagation(); next(); }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}>
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }} onClick={(e) => e.stopPropagation()}>
        {filtered.map((_, i) => (
          <div key={i} onClick={() => setCurrentIndex(i)} style={{
            width: safeIndex === i ? 20 : 8, height: 8, borderRadius: 100,
            background: safeIndex === i ? '#2563eb' : '#cbd5e1',
            transition: 'all 0.3s ease', cursor: 'pointer',
          }} />
        ))}
      </div>
    </div>
  );
}
