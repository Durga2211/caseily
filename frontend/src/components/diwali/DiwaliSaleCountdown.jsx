import React, { useState, useEffect } from 'react';
import { DIWALI_CONFIG } from './diwaliConfig';

/**
 * Diwali Sale Live Countdown Banner
 * Counts down to 8 Nov 2026, 11:59 PM IST
 */
export default function DiwaliSaleCountdown({ onCtaClick }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const targetDate = new Date(DIWALI_CONFIG.targetCountdownDate).getTime();

    function calculateTime() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="diwali-sale-banner" style={{
      maxWidth: '820px',
      margin: '0 auto 28px',
      padding: '0 16px',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <div className="diwali-card" style={{
        background: 'linear-gradient(135deg, #09122c 0%, #0d1e4c 50%, #1e3a8a 100%)',
        border: '1.5px solid #F5B301',
        borderRadius: '24px',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35), 0 0 25px rgba(245, 179, 1, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Festive corner glow element */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(245, 179, 1, 0.35) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        {/* Top Sale Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(245, 179, 1, 0.2)',
          border: '1px solid #F5B301',
          borderRadius: '999px',
          padding: '4px 12px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '13px' }}>⚡</span>
          <span style={{
            color: '#FDE047',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            Grand Diwali Festive Sale
          </span>
          <span style={{ fontSize: '13px' }}>🪔</span>
        </div>

        {/* Headline */}
        <h2 className="diwali-font" style={{
          fontSize: 'clamp(22px, 5.5vw, 32px)',
          fontWeight: '900',
          margin: '0 0 6px',
          color: '#FFFFFF'
        }}>
          Festive Deals End In
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.8)',
          margin: '0 0 18px',
          maxWidth: '440px'
        }}>
          Exclusive festive prices live until 8 Nov 2026, 11:59 PM IST. Grab your Diwali edition cases before stock sells out!
        </p>

        {/* ─── 4 Countdown Metric Tiles ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(62px, 80px))',
          gap: '10px',
          marginBottom: '20px'
        }}>
          {[
            { label: 'DAYS', val: timeLeft.days },
            { label: 'HOURS', val: timeLeft.hours },
            { label: 'MINUTES', val: timeLeft.minutes },
            { label: 'SECONDS', val: timeLeft.seconds }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(7, 13, 30, 0.85)',
                border: '1px solid rgba(245, 179, 1, 0.45)',
                borderRadius: '14px',
                padding: '10px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(245, 179, 1, 0.2)'
              }}
            >
              <span style={{
                fontFamily: 'monospace',
                fontSize: 'clamp(20px, 4.5vw, 28px)',
                fontWeight: '900',
                color: '#FDE047',
                lineHeight: 1.1,
                textShadow: '0 0 10px rgba(245, 179, 1, 0.4)'
              }}>
                {String(item.val).padStart(2, '0')}
              </span>
              <span style={{
                fontSize: '9px',
                fontWeight: '800',
                color: '#94a3b8',
                letterSpacing: '0.08em',
                marginTop: '4px'
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          type="button"
          className="diwali-gold-btn"
          onClick={onCtaClick}
          style={{
            padding: '12px 28px',
            borderRadius: '12px',
            fontSize: '14px',
            textDecoration: 'none'
          }}
        >
          <span>Shop Diwali Edition Deals →</span>
        </button>
      </div>
    </section>
  );
}
