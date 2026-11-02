import React from 'react';

/**
 * Rangoli-style SVG Section Divider
 * Lightweight vector divider featuring golden lotus petals and central diya
 */
export function RangoliDivider({ title = '', subtitle = '' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '36px auto 24px',
      padding: '0 16px',
      maxWidth: '680px',
      textAlign: 'center'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: '12px',
        marginBottom: title ? '8px' : '0'
      }}>
        {/* Left ornament line */}
        <div style={{
          flex: 1,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(245, 179, 1, 0.65))'
        }} />

        {/* Central Rangoli SVG Motif */}
        <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          {/* Outer circle dots */}
          <circle cx="50" cy="50" r="44" stroke="#F5B301" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          
          {/* 8-Petal Mandala */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <path
              key={i}
              d="M50 50 Q43 28 50 16 Q57 28 50 50"
              fill="url(#rangoliGoldGradient)"
              opacity="0.85"
              transform={`rotate(${angle} 50 50)`}
            />
          ))}

          {/* Central Diya Bowl */}
          <ellipse cx="50" cy="53" rx="14" ry="7" fill="#FF9933" />
          <ellipse cx="50" cy="51" rx="11" ry="4" fill="#F5B301" />

          {/* Flickering Flame */}
          <path
            className="diya-flame"
            d="M50 33 C46 39 45 44 47 48 C49 51 51 51 53 48 C55 44 54 39 50 33 Z"
            fill="#FEF08A"
          />

          <defs>
            <linearGradient id="rangoliGoldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5B301" />
              <stop offset="100%" stopColor="#FF9933" />
            </linearGradient>
          </defs>
        </svg>

        {/* Right ornament line */}
        <div style={{
          flex: 1,
          height: '1px',
          background: 'linear-gradient(90deg, rgba(245, 179, 1, 0.65), transparent)'
        }} />
      </div>

      {title && (
        <h3 className="diwali-font" style={{
          margin: '4px 0 2px',
          fontSize: '22px',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #FFFBEB 0%, #F5B301 50%, #FF9933 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 10px rgba(245, 179, 1, 0.3)'
        }}>
          {title}
        </h3>
      )}

      {subtitle && (
        <p style={{
          margin: 0,
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: '500'
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Ornate corner flourish for cards and banners
 */
export function DiwaliCorner({ position = 'top-left' }) {
  const isTop = position.includes('top');
  const isLeft = position.includes('left');

  return (
    <div style={{
      position: 'absolute',
      [isTop ? 'top' : 'bottom']: '4px',
      [isLeft ? 'left' : 'right']: '4px',
      transform: `${!isTop ? 'scaleY(-1)' : ''} ${!isLeft ? 'scaleX(-1)' : ''}`,
      pointerEvents: 'none',
      opacity: 0.7,
      zIndex: 1
    }}>
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
        <path d="M2 2 L38 2 C22 2 2 22 2 38 Z" fill="none" stroke="#F5B301" strokeWidth="1.5" opacity="0.6" />
        <circle cx="8" cy="8" r="3" fill="#FF9933" />
        <circle cx="16" cy="6" r="1.5" fill="#F5B301" />
        <circle cx="6" cy="16" r="1.5" fill="#F5B301" />
      </svg>
    </div>
  );
}
