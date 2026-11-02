import React from 'react';

/**
 * 2x Loyalty Points Festive Banner
 */
export default function DiwaliLoyaltyBanner({ onNavigateToLoyalty }) {
  return (
    <section id="diwali-loyalty-banner" style={{
      maxWidth: '820px',
      margin: '0 auto 32px',
      padding: '0 16px',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <div
        className="diwali-card"
        onClick={onNavigateToLoyalty}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToLoyalty(); }}
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 50%, #431407 100%)',
          border: '1.5px solid #F5B301',
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(245, 179, 1, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #FF9933 0%, #F5B301 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(245, 179, 1, 0.4)'
          }}>
            🪙
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#FDE047',
              fontSize: '11px',
              fontWeight: '900',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '2px'
            }}>
              <span>✨</span> FESTIVE MULTIPLIER ACTIVE
            </div>
            <h3 style={{
              margin: '0 0 2px',
              fontSize: '16px',
              fontWeight: '900',
              color: '#ffffff',
              letterSpacing: '-0.2px'
            }}>
              2X Loyalty Points on Every Festive Order
            </h3>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#cbd5e1'
            }}>
              Earn double Caseily Coins on all purchases till 8 Nov. Redeem for free cases & accessories!
            </p>
          </div>
        </div>

        <div style={{
          flexShrink: 0,
          background: 'linear-gradient(90deg, #F5B301, #FF9933)',
          color: '#070d1e',
          padding: '8px 14px',
          borderRadius: '10px',
          fontWeight: '800',
          fontSize: '12px',
          whiteSpace: 'nowrap'
        }}>
          Claim 2X →
        </div>
      </div>
    </section>
  );
}
