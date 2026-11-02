import React, { useState } from 'react';

/**
 * Diwali Gifting Section
 * "Gift a Case" with gift-wrap toggle & personalized greeting card input
 * Plus Corporate / Bulk gifting CTA
 */
export default function DiwaliGifting({ onNavigateToBulk, onShowToast }) {
  const [addGiftWrap, setAddGiftWrap] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('Wishing you a festival full of sweet moments, bright memories, and unbreakable protection! 🪔✨');

  const handleSendGift = () => {
    if (onShowToast) {
      onShowToast(`🎁 Gift configuration saved for ${recipientName || 'your loved one'}! Proceed to select a case.`);
    }
    const collectionEl = document.getElementById('diwali-collection');
    if (collectionEl) {
      collectionEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="diwali-gifting" style={{
      maxWidth: '820px',
      margin: '0 auto 36px',
      padding: '0 16px',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '26px' }}>🎁</span>
        <div>
          <h2 className="diwali-font" style={{
            fontSize: '24px',
            fontWeight: '900',
            margin: 0,
            color: '#FFFFFF'
          }}>
            Diwali Gifting Studio
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Deliver a beautifully packaged case with a custom golden greeting card.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* ─── Configurator Card ─── */}
        <div className="diwali-card" style={{ padding: '22px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#FFFBEB' }}>
              Gift a Case
            </h3>
            <span className="festive-pill-badge">Festive Box</span>
          </div>

          {/* Gift Wrap Toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(245, 179, 1, 0.35)',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🎀</span>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#ffffff' }}>
                  Royal Diwali Gift Packaging
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Gold foil box + red silk satin ribbon
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={addGiftWrap}
              onChange={(e) => setAddGiftWrap(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#F5B301',
                cursor: 'pointer'
              }}
            />
          </label>

          {/* Recipient Name Field */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: '#FDE047',
              marginBottom: '6px'
            }}>
              Recipient Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul, Priya, Team..."
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(245, 179, 1, 0.3)',
                background: 'rgba(7, 13, 30, 0.8)',
                color: '#ffffff',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {/* Personal Greeting Input */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: '#FDE047',
              marginBottom: '6px'
            }}>
              Personal Message on Card
            </label>
            <textarea
              rows="3"
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(245, 179, 1, 0.3)',
                background: 'rgba(7, 13, 30, 0.8)',
                color: '#ffffff',
                fontSize: '12.5px',
                lineHeight: 1.4,
                boxSizing: 'border-box',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="button"
            className="diwali-gold-btn"
            onClick={handleSendGift}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13.5px'
            }}
          >
            <span>Proceed to Pick a Gift Case</span>
            <span style={{ marginLeft: '6px' }}>→</span>
          </button>
        </div>

        {/* ─── Live Card Preview & Corporate Gifting ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Live Card Preview */}
          <div style={{
            background: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
            borderRadius: '20px',
            padding: '20px',
            border: '2px solid #FDE047',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            color: '#FFFBEB',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>🪔</span>
              <span className="diwali-font" style={{ fontSize: '13px', fontWeight: '900', color: '#FEF08A' }}>
                CASEILY GREETINGS
              </span>
              <span style={{ fontSize: '20px' }}>✨</span>
            </div>

            <div style={{
              fontStyle: 'italic',
              fontSize: '13px',
              lineHeight: 1.5,
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px dashed rgba(254, 240, 138, 0.4)',
              minHeight: '70px'
            }}>
              "{greetingMessage || 'Wishing you a very Happy Diwali!'}"
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#FEF08A'
            }}>
              <span>For: {recipientName || 'Dear Friend'}</span>
              <span>With Love ❤️</span>
            </div>
          </div>

          {/* Corporate / Bulk Order CTA */}
          <div className="diwali-card" style={{
            padding: '18px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1.5px solid rgba(245, 179, 1, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(245, 179, 1, 0.15)',
                color: '#FDE047',
                fontSize: '10px',
                fontWeight: '900',
                padding: '2px 8px',
                borderRadius: '6px',
                marginBottom: '4px'
              }}>
                CORPORATE & B2B
              </div>
              <h4 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                Bulk Diwali Orders for Teams
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Custom company logo branding, tax invoices, & priority courier delivery.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToBulk}
              style={{
                flexShrink: 0,
                background: 'linear-gradient(90deg, #F5B301, #FF9933)',
                color: '#070d1e',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '12.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Bulk Order →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
