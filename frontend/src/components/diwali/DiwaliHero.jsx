import React, { useEffect, useRef, useState } from 'react';
import { diwaliAudio } from './DiwaliAudio';

/**
 * Diwali Hero Section
 * Headline: "Plug into the Diwali madness"
 * Background fireworks canvas, floating diyas, ambient music toggle
 */
export default function DiwaliHero({ onExploreCollection, onScrollToDiya }) {
  const canvasRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Fireworks canvas animation (lightweight, GPU friendly, pauses if tab hidden or reduced-motion)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const colors = ['#F5B301', '#FF9933', '#FDE047', '#EC4899', '#38BDF8', '#4ADE80'];

    function createBurst(x, y) {
      const count = 28;
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
        const speed = Math.random() * 2.8 + 1.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: Math.random() * 0.018 + 0.012,
          color: Math.random() > 0.4 ? baseColor : '#FFFBEB',
          size: Math.random() * 2.2 + 1.2
        });
      }
    }

    let lastBurstTime = 0;

    function render(time) {
      ctx.clearRect(0, 0, width, height);

      // Periodically trigger soft firework bursts
      if (time - lastBurstTime > 1800) {
        createBurst(
          Math.random() * (width * 0.8) + width * 0.1,
          Math.random() * (height * 0.45) + 30
        );
        lastBurstTime = time;
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035; // gentle gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleToggleAudio = () => {
    const active = diwaliAudio.toggle();
    setIsAudioPlaying(active);
  };

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      minHeight: '440px',
      background: 'linear-gradient(175deg, #070d1e 0%, #0e1b42 45%, #1e3fd1 100%)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px 40px',
      color: '#ffffff',
      boxSizing: 'border-box',
      textAlign: 'center',
      borderBottom: '2px solid rgba(245, 179, 1, 0.35)'
    }}>
      {/* ─── Background Fireworks Canvas ─── */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* ─── Floating Decorative Diyas (Left & Right) ─── */}
      <div className="floating-diya" style={{
        position: 'absolute',
        top: '20px',
        left: '12px',
        zIndex: 2,
        opacity: 0.85
      }}>
        <svg width="44" height="44" viewBox="0 0 100 100">
          <ellipse cx="50" cy="65" rx="36" ry="16" fill="#EA580C" />
          <ellipse cx="50" cy="60" rx="30" ry="10" fill="#F5B301" />
          <path className="diya-flame" d="M50 20 C42 34 40 44 44 54 C48 60 52 60 56 54 C60 44 58 34 50 20 Z" fill="#FEF08A" />
        </svg>
      </div>

      <div className="floating-diya" style={{
        position: 'absolute',
        top: '32px',
        right: '12px',
        zIndex: 2,
        animationDelay: '1.8s',
        opacity: 0.85
      }}>
        <svg width="40" height="40" viewBox="0 0 100 100">
          <ellipse cx="50" cy="65" rx="36" ry="16" fill="#C2410C" />
          <ellipse cx="50" cy="60" rx="30" ry="10" fill="#F5B301" />
          <path className="diya-flame" d="M50 20 C42 34 40 44 44 54 C48 60 52 60 56 54 C60 44 58 34 50 20 Z" fill="#FEF08A" />
        </svg>
      </div>

      {/* ─── Ambient Audio Toggle Pill ─── */}
      <button
        type="button"
        onClick={handleToggleAudio}
        aria-label={isAudioPlaying ? "Mute festive ambient sound" : "Unmute festive ambient sound"}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          background: isAudioPlaying ? 'rgba(245, 179, 1, 0.25)' : 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(245, 179, 1, 0.45)',
          borderRadius: '999px',
          padding: '6px 12px',
          color: '#FFFBEB',
          fontSize: '12px',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s'
        }}
      >
        <span>{isAudioPlaying ? '🪔 Sound: On' : '🔇 Festive Music'}</span>
      </button>

      {/* ─── Hero Content ─── */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '640px' }}>
        {/* Festive Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(245, 179, 1, 0.15)',
          border: '1.5px solid rgba(245, 179, 1, 0.5)',
          borderRadius: '999px',
          padding: '5px 14px',
          marginBottom: '16px',
          boxShadow: '0 0 20px rgba(245, 179, 1, 0.25)'
        }}>
          <span style={{ fontSize: '15px' }}>🪔</span>
          <span style={{
            color: '#FDE047',
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            Diwali 2026 Celebration
          </span>
          <span style={{ fontSize: '15px' }}>✨</span>
        </div>

        {/* Headline */}
        <h1 className="diwali-font" style={{
          fontSize: 'clamp(28px, 7vw, 48px)',
          fontWeight: '900',
          lineHeight: 1.15,
          margin: '0 0 14px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 35%, #FDE047 70%, #F5B301 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 24px rgba(245, 179, 1, 0.4)'
        }}>
          Plug into the Diwali madness.
        </h1>

        {/* Subtitle with hashtags */}
        <p style={{
          fontSize: 'clamp(14px, 3.8vw, 17px)',
          lineHeight: 1.5,
          color: 'rgba(255, 255, 255, 0.92)',
          maxWidth: '520px',
          margin: '0 auto 22px'
        }}>
          Festive drops, glowing discounts up to 50%, and tech perks designed to celebrate the festival of lights.
        </p>

        {/* Dual Hashtags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '26px'
        }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            color: '#FFFBEB',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            #caseilyinsider
          </span>
          <span style={{
            background: 'linear-gradient(90deg, rgba(245, 179, 1, 0.25), rgba(255, 153, 51, 0.25))',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '800',
            color: '#FDE047',
            border: '1px solid rgba(245, 179, 1, 0.5)',
            boxShadow: '0 0 12px rgba(245, 179, 1, 0.25)'
          }}>
            #CaseilyDiwali 🪔
          </span>
        </div>

        {/* Hero CTA Action Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            type="button"
            className="diwali-gold-btn"
            onClick={onExploreCollection}
            style={{
              padding: '14px 28px',
              borderRadius: '14px',
              fontSize: '15px',
              textDecoration: 'none'
            }}
          >
            <span>Shop Diwali Edition</span>
            <span style={{ marginLeft: '6px' }}>✨</span>
          </button>

          <button
            type="button"
            onClick={onScrollToDiya}
            style={{
              padding: '14px 24px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '700',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'background 0.2s'
            }}
          >
            <span>Light a Diya 🪔</span>
          </button>
        </div>
      </div>
    </section>
  );
}
