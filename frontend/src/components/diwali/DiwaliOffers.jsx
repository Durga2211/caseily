import React, { useState } from 'react';
import { DIWALI_CONFIG } from './diwaliConfig';

/**
 * Festive Offers Section
 * B2G1, Free Shipping, and DIWALI26 Coupon with one-tap copy
 */
export default function DiwaliOffers({ onShowToast }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(DIWALI_CONFIG.couponCode);
    setCopied(true);
    if (onShowToast) {
      onShowToast(`🎉 Code ${DIWALI_CONFIG.couponCode} copied! 26% discount applied.`);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="diwali-offers" style={{
      maxWidth: '820px',
      margin: '0 auto 32px',
      padding: '0 16px',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🪔</span>
          <h2 className="diwali-font" style={{
            fontSize: '22px',
            fontWeight: '900',
            margin: 0,
            background: 'linear-gradient(90deg, #F5B301 0%, #FF9933 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Festive Mega Offers
          </h2>
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: '800',
          color: '#F5B301',
          background: 'rgba(245, 179, 1, 0.15)',
          padding: '4px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(245, 179, 1, 0.3)'
        }}>
          Valid till Diwali
        </span>
      </div>

      {/* Grid of 3 Offer Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px'
      }}>
        {/* Card 1: B2G1 */}
        <div className="diwali-card" style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '28px' }}>🎁</span>
              <span className="festive-pill-badge">B2G1 Free</span>
            </div>
            <h3 style={{
              margin: '0 0 6px',
              fontSize: '17px',
              fontWeight: '800',
              color: '#FFFBEB'
            }}>
              Buy 2 Cases, Get 1 FREE
            </h3>
            <p style={{
              margin: 0,
              fontSize: '12.5px',
              color: '#cbd5e1',
              lineHeight: 1.45
            }}>
              Add any 3 cases to your cart. The 3rd case is automatically discounted to ₹0 at checkout!
            </p>
          </div>
          <div style={{
            marginTop: '16px',
            paddingTop: '10px',
            borderTop: '1px dashed rgba(245, 179, 1, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#FDE047',
            fontWeight: '700'
          }}>
            <span>Auto-applied in cart</span>
            <span>✓ Active</span>
          </div>
        </div>

        {/* Card 2: DIWALI26 Coupon */}
        <div className="diwali-card" style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1.5px solid #F5B301',
          background: 'linear-gradient(145deg, rgba(20, 30, 68, 0.95) 0%, rgba(10, 18, 42, 0.98) 100%)'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '28px' }}>✨</span>
              <span className="festive-pill-badge">Flat 26% OFF</span>
            </div>
            <h3 style={{
              margin: '0 0 6px',
              fontSize: '17px',
              fontWeight: '800',
              color: '#FFFBEB'
            }}>
              Coupon: {DIWALI_CONFIG.couponCode}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '12.5px',
              color: '#cbd5e1',
              lineHeight: 1.45
            }}>
              Get an instant 26% flat discount on all phone cases & accessories on orders above ₹499.
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={handleCopyCode}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: copied ? '#10B981' : 'linear-gradient(90deg, #F5B301, #FF9933)',
                color: copied ? '#ffffff' : '#070d1e',
                border: 'none',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245, 179, 1, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {copied ? (
                <><span>✓</span><span>Copied to Clipboard!</span></>
              ) : (
                <><span>📋</span><span>Tap to Copy: {DIWALI_CONFIG.couponCode}</span></>
              )}
            </button>
          </div>
        </div>

        {/* Card 3: Free Express Shipping */}
        <div className="diwali-card" style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '28px' }}>🚀</span>
              <span className="festive-pill-badge" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                Express
              </span>
            </div>
            <h3 style={{
              margin: '0 0 6px',
              fontSize: '17px',
              fontWeight: '800',
              color: '#FFFBEB'
            }}>
              Free Express Delivery
            </h3>
            <p style={{
              margin: 0,
              fontSize: '12.5px',
              color: '#cbd5e1',
              lineHeight: 1.45
            }}>
              Zero shipping fee on all orders. Packed in protective festive bubble mailers with live Ship24 tracking.
            </p>
          </div>
          <div style={{
            marginTop: '16px',
            paddingTop: '10px',
            borderTop: '1px dashed rgba(245, 179, 1, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#10B981',
            fontWeight: '700'
          }}>
            <span>Guaranteed pre-Diwali delivery</span>
            <span>⚡ In 48h</span>
          </div>
        </div>
      </div>
    </section>
  );
}
