import React from 'react';

/**
 * Diwali Festive Footer Ribbon & Greeting
 */
export default function DiwaliFooter() {
  const shareText = encodeURIComponent("Wishing you all a very Happy & Prosperous Diwali from the Caseily Family! 🪔 Check out the Diwali Edition cases & festive discounts: https://caseily.vercel.app #CaseilyDiwali");

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank');
  };

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(180deg, #070d1e 0%, #030611 100%)',
      borderTop: '1.5px solid rgba(245, 179, 1, 0.35)',
      padding: '24px 16px',
      color: '#ffffff',
      textAlign: 'center',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🪔 ✨ 🪔</div>

        <h3 className="diwali-font" style={{
          fontSize: '20px',
          fontWeight: '900',
          margin: '0 0 6px',
          background: 'linear-gradient(90deg, #FFFBEB, #FDE047, #FF9933)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Happy Diwali from Team Caseily!
        </h3>

        <p style={{
          fontSize: '13px',
          color: '#cbd5e1',
          lineHeight: 1.5,
          margin: '0 0 16px'
        }}>
          May the festival of lights brighten your life with endless success, good health, and stylish protection.
        </p>

        {/* Share buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#FDE047' }}>
            Share Festive Wishes:
          </span>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            style={{
              background: '#25D366',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleShareTwitter}
            style={{
              background: '#1DA1F2',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Twitter / X</span>
          </button>
        </div>

        <div style={{ fontSize: '11px', color: '#64748b' }}>
          Crafted with love in India 🇮🇳 · Festival of Lights 2026 Edition
        </div>
      </div>
    </div>
  );
}
