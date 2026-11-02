import React, { useState, useEffect } from 'react';
import { DIWALI_CONFIG } from './diwaliConfig';

/**
 * Interactive Light-a-Diya Component
 * Tap an unlit diya to trigger a golden flame ignition & sparkle burst,
 * incrementing the community counter.
 */
export default function DiwaliLightDiya({ onShowToast }) {
  const [hasLit, setHasLit] = useState(() => {
    try {
      return localStorage.getItem('caseily_diya_lit') === 'true';
    } catch {
      return false;
    }
  });

  const [counter, setCounter] = useState(() => {
    try {
      const saved = localStorage.getItem('caseily_diya_counter');
      if (saved) return parseInt(saved, 10);
    } catch {}
    return DIWALI_CONFIG.initialDiyaCount;
  });

  const [animating, setAnimating] = useState(false);

  const handleLightDiya = () => {
    if (hasLit) {
      if (onShowToast) {
        onShowToast('🪔 You already lit your community diya! May your Diwali be radiant.');
      }
      return;
    }

    const nextCount = counter + 1;
    setCounter(nextCount);
    setHasLit(true);
    setAnimating(true);

    try {
      localStorage.setItem('caseily_diya_lit', 'true');
      localStorage.setItem('caseily_diya_counter', nextCount.toString());
    } catch {}

    if (onShowToast) {
      onShowToast(`🪔 Diya lit! You are supporter #${nextCount.toLocaleString()} to spread light.`);
    }

    setTimeout(() => setAnimating(false), 2000);
  };

  return (
    <section id="light-a-diya" style={{
      maxWidth: '820px',
      margin: '0 auto 36px',
      padding: '0 16px',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <div className="diwali-card" style={{
        background: 'linear-gradient(135deg, #070d1e 0%, #172554 50%, #431407 100%)',
        border: '1.5px solid #F5B301',
        borderRadius: '24px',
        padding: '28px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hasLit
          ? '0 16px 45px rgba(0,0,0,0.4), 0 0 35px rgba(245, 179, 1, 0.45)'
          : '0 12px 36px rgba(0,0,0,0.3)'
      }}>
        {/* Decorative corner lights */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '16px',
          color: '#FDE047',
          fontSize: '18px'
        }}>
          ✨
        </div>
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          color: '#FDE047',
          fontSize: '18px'
        }}>
          ✨
        </div>

        {/* Counter Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(245, 179, 1, 0.15)',
          border: '1px solid #F5B301',
          borderRadius: '999px',
          padding: '4px 14px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '13px' }}>🪔</span>
          <span style={{
            color: '#FDE047',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            Community Diya Wall
          </span>
        </div>

        {/* Headline */}
        <h2 className="diwali-font" style={{
          fontSize: 'clamp(22px, 5.5vw, 30px)',
          fontWeight: '900',
          margin: '0 0 6px',
          color: '#ffffff'
        }}>
          Light a Diya for the Caseily Community
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.85)',
          maxWidth: '460px',
          margin: '0 0 24px',
          lineHeight: 1.45
        }}>
          Tap the clay diya below to ignite your flame. Join thousands of creators & tech lovers lighting up India this Diwali.
        </p>

        {/* ─── Interactive Diya Graphic ─── */}
        <div
          onClick={handleLightDiya}
          role="button"
          tabIndex={0}
          aria-label={hasLit ? "Diya is lit" : "Tap to light the diya"}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLightDiya(); }}
          style={{
            cursor: hasLit ? 'default' : 'pointer',
            padding: '16px',
            borderRadius: '50%',
            background: hasLit
              ? 'radial-gradient(circle, rgba(245, 179, 1, 0.28) 0%, transparent 70%)'
              : 'rgba(255, 255, 255, 0.05)',
            transform: animating ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.5s',
            marginBottom: '18px'
          }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            {/* Ambient Flame Glow (if lit) */}
            {hasLit && (
              <circle
                cx="50"
                cy="40"
                r="30"
                fill="url(#glowGradient)"
                opacity="0.6"
              />
            )}

            {/* Clay Bowl / Diya Base */}
            <path
              d="M15 62 C15 78 30 84 50 84 C70 84 85 78 85 62 C85 58 75 58 50 58 C25 58 15 58 15 62 Z"
              fill="url(#clayGradient)"
              stroke="#B45309"
              strokeWidth="2"
            />
            {/* Inner Oil Basin */}
            <ellipse cx="50" cy="62" rx="32" ry="10" fill="#78350F" />
            <ellipse cx="50" cy="62" rx="28" ry="7" fill={hasLit ? '#F59E0B' : '#451A03'} />

            {/* Diya Rim Patterns */}
            <path
              d="M20 62 Q 35 66 50 62 Q 65 66 80 62"
              stroke="#FDE047"
              strokeWidth="1.2"
              fill="none"
              opacity="0.8"
            />

            {/* Flickering Flame (visible if lit) */}
            {hasLit ? (
              <g className="diya-flame">
                {/* Outer Flame (Orange) */}
                <path
                  d="M50 16 C42 28 38 42 43 54 C46 60 54 60 57 54 C62 42 58 28 50 16 Z"
                  fill="url(#outerFlameGradient)"
                />
                {/* Inner Core Flame (Bright Yellow) */}
                <path
                  d="M50 26 C46 34 44 42 47 50 C49 53 51 53 53 50 C56 42 54 34 50 26 Z"
                  fill="#FFFBEB"
                />
              </g>
            ) : (
              /* Unlit wick */
              <line x1="50" y1="58" x2="50" y2="48" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
            )}

            <defs>
              <linearGradient id="clayGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>
              <linearGradient id="outerFlameGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#F5B301" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
              <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Counter Display */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px',
          marginBottom: '6px'
        }}>
          <span style={{
            fontSize: 'clamp(28px, 6vw, 36px)',
            fontWeight: '900',
            fontFamily: 'monospace',
            color: '#FDE047',
            textShadow: '0 0 16px rgba(245, 179, 1, 0.5)'
          }}>
            {counter.toLocaleString()}
          </span>
          <span style={{ fontSize: '14px', fontWeight: '800', color: '#cbd5e1' }}>
            diyas lit across India
          </span>
        </div>

        {/* Status Text / Button */}
        {hasLit ? (
          <div style={{
            color: '#4ADE80',
            fontSize: '13px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>✓</span> Your flame is burning bright! Happy Diwali.
          </div>
        ) : (
          <button
            type="button"
            className="diwali-gold-btn"
            onClick={handleLightDiya}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              marginTop: '4px'
            }}
          >
            <span>Tap to Light Your Diya</span>
            <span style={{ marginLeft: '6px' }}>🪔</span>
          </button>
        )}
      </div>
    </section>
  );
}
