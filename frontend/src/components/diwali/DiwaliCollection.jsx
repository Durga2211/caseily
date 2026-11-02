import React from 'react';
import { DIWALI_CONFIG } from './diwaliConfig';

/**
 * Diwali Edition Collection Section
 * Horizontal scroll product cards for festive case designs
 */
export default function DiwaliCollection({ onAddToCart }) {
  const products = DIWALI_CONFIG.products;

  return (
    <section id="diwali-collection" style={{
      maxWidth: '820px',
      margin: '0 auto 36px',
      padding: '0 16px',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#F5B301',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}>
            <span>✨</span> LIMITED FESTIVE DROPS
          </div>
          <h2 className="diwali-font" style={{
            fontSize: '24px',
            fontWeight: '900',
            margin: 0,
            color: '#FFFFFF'
          }}>
            Diwali Edition Cases
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Hand-crafted festival designs with military drop protection.
          </p>
        </div>

        <span style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#FDE047',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          Scroll →
        </span>
      </div>

      {/* Horizontal Scroll Product Carousel */}
      <div style={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(250px, 280px)',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '14px',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}>
        {products.map((item) => (
          <div
            key={item.id}
            className="diwali-card"
            style={{
              scrollSnapAlign: 'start',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Badges */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span className="festive-pill-badge">{item.badge}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                color: '#FDE047',
                background: 'rgba(245, 179, 1, 0.15)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {item.discount}
              </span>
            </div>

            {/* Product Image / Visual Showcase Container */}
            <div style={{
              width: '100%',
              height: '170px',
              borderRadius: '16px',
              background: item.gradient,
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'
            }}>
              {/* Product Photo */}
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: '80%',
                  height: '80%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.6))',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06) rotate(2deg)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
              />

              {/* Decorative Diya Stamp */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(7, 13, 30, 0.65)',
                backdropFilter: 'blur(4px)',
                borderRadius: '8px',
                padding: '3px 7px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#FFFBEB',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <span>🪔</span> Caseily Plus+
              </div>
            </div>

            {/* Product Meta */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px'
              }}>
                <span style={{ color: '#F5B301', fontSize: '12px' }}>★</span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
                  {item.rating}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  ({item.reviewsCount} reviews)
                </span>
              </div>

              <h3 style={{
                margin: '0 0 4px',
                fontSize: '16px',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: 1.3
              }}>
                {item.name}
              </h3>

              <p style={{
                margin: '0 0 12px',
                fontSize: '12px',
                color: '#94a3b8',
                lineHeight: 1.35
              }}>
                {item.subtitle}
              </p>

              {/* Price Row */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                marginBottom: '14px'
              }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: '900',
                  color: '#FDE047'
                }}>
                  ₹{item.price}
                </span>
                <span style={{
                  fontSize: '13px',
                  color: '#64748b',
                  textDecoration: 'line-through'
                }}>
                  ₹{item.originalPrice}
                </span>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              className="diwali-gold-btn"
              onClick={() => onAddToCart(item)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                fontSize: '13px'
              }}
            >
              <span>Add to Festive Cart</span>
              <span style={{ marginLeft: '6px' }}>🛍️</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
