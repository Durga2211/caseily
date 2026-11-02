import React, { useEffect, useRef } from 'react';
import { DIWALI_CONFIG } from './diwaliConfig';

/**
 * First-Visit Diwali Greeting Popup / Modal
 * Displays festive wish + welcome coupon once per user.
 */
export default function DiwaliGreetingModal({ isOpen, onClose, onExplore }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open for accessibility
    closeBtnRef.current?.focus();

    // Trap ESC key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="diwali-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="diwali-greeting-title"
    >
      <div
        className="diwali-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close Diwali Greeting"
          style={{
            position: 'absolute',
            top: '14px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#cbd5e1',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          ✕
        </button>

        {/* Diya Icon with radiating glow */}
        <div style={{
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 179, 1, 0.3) 0%, transparent 70%)',
          border: '1.5px solid #F5B301',
          boxShadow: '0 0 25px rgba(245, 179, 1, 0.45)',
          margin: '0 auto 16px'
        }}>
          <span style={{ fontSize: '36px' }}>🪔</span>
        </div>

        {/* Heading */}
        <h2 id="diwali-greeting-title" className="diwali-font" style={{
          fontSize: '24px',
          fontWeight: '900',
          margin: '0 0 10px',
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FDE047 50%, #F5B301 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.25
        }}>
          Wishing You a Bright & Happy Diwali!
        </h2>

        <p style={{
          fontSize: '13.5px',
          color: '#e2e8f0',
          lineHeight: 1.5,
          margin: '0 0 20px'
        }}>
          May your festival of lights be filled with joy, prosperity, and unbreakable moments. Here is an exclusive festive gift for you!
        </p>

        {/* Coupon Code Highlight Box */}
        <div style={{
          background: 'rgba(7, 13, 30, 0.85)',
          border: '1.5px dashed #F5B301',
          borderRadius: '16px',
          padding: '14px 18px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>
              FESTIVE VOUCHER
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#FDE047', fontFamily: 'monospace' }}>
              {DIWALI_CONFIG.couponCode}
            </div>
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #FF9933, #F5B301)',
            color: '#070d1e',
            padding: '5px 10px',
            borderRadius: '8px'
          }}>
            FLAT 26% OFF
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="diwali-gold-btn"
          onClick={onExplore}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            fontSize: '14.5px'
          }}
        >
          <span>Explore Diwali Edition Cases</span>
          <span style={{ marginLeft: '6px' }}>✨</span>
        </button>
      </div>
    </div>
  );
}
