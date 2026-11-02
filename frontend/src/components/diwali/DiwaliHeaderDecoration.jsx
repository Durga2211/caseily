import React from 'react';

/**
 * Hanging Toran / Marigold Garland + Twinkling Fairy Lights
 * Placed at the top of the header.
 */
export default function DiwaliHeaderDecoration() {
  const bulbs = [
    { color: '#F5B301' },
    { color: '#FF9933' },
    { color: '#F43F5E' },
    { color: '#FDE047' },
    { color: '#10B981' },
    { color: '#F5B301' },
    { color: '#FF9933' },
    { color: '#EC4899' },
    { color: '#FDE047' },
    { color: '#F5B301' },
    { color: '#FF9933' },
    { color: '#10B981' },
    { color: '#F5B301' },
    { color: '#FF9933' },
    { color: '#F43F5E' },
    { color: '#FDE047' },
  ];

  return (
    <div className="diwali-toran-container" style={{
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(7, 13, 30, 0.95) 0%, rgba(11, 21, 51, 0.75) 100%)',
      borderBottom: '1px solid rgba(245, 179, 1, 0.25)',
      zIndex: 40,
      pointerEvents: 'none'
    }}>
      {/* ─── Twinkling String Fairy Lights Wire ─── */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '2px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingLeft: '6px',
        paddingRight: '6px'
      }}>
        {/* Curved drooping line SVG */}
        <svg
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '14px',
            pointerEvents: 'none'
          }}
          preserveAspectRatio="none"
          viewBox="0 0 1000 20"
        >
          <path
            d="M0 4 Q 125 18, 250 4 T 500 4 T 750 4 T 1000 4"
            fill="none"
            stroke="rgba(245, 179, 1, 0.4)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Individual Fairy Bulbs hanging along the wire */}
        {bulbs.map((b, i) => (
          <div
            key={i}
            className="fairy-bulb"
            style={{
              color: b.color,
              backgroundColor: b.color,
              marginTop: `${Math.sin(i * 0.8) * 4 + 4}px`
            }}
          />
        ))}
      </div>

      {/* ─── Traditional Indian Marigold Garland (Toran) ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        width: '100%',
        paddingTop: '3px',
        paddingBottom: '3px',
        overflow: 'hidden'
      }}>
        {[...Array(14)].map((_, idx) => {
          const isOrange = idx % 2 === 0;
          const flowerColor = isOrange ? '#F97316' : '#F5B301';
          const innerColor = isOrange ? '#EA580C' : '#EAB308';

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Mango Leaf */}
              <svg width="12" height="10" viewBox="0 0 20 20" fill="none">
                <path d="M10 0 C4 6 2 14 10 20 C18 14 16 6 10 0 Z" fill="#15803D" />
                <path d="M10 0 L10 20" stroke="#166534" strokeWidth="1" />
              </svg>
              {/* Marigold flower (Genda Phool) */}
              <svg width="14" height="14" viewBox="0 0 40 40" style={{ marginTop: '-2px' }}>
                <circle cx="20" cy="20" r="16" fill={flowerColor} />
                <circle cx="20" cy="20" r="12" fill={innerColor} />
                <circle cx="20" cy="20" r="7" fill="#CA8A04" />
                {/* Petal scalloped rim */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, pi) => (
                  <circle
                    key={pi}
                    cx={20 + 13 * Math.cos((angle * Math.PI) / 180)}
                    cy={20 + 13 * Math.sin((angle * Math.PI) / 180)}
                    r="4"
                    fill={flowerColor}
                  />
                ))}
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
