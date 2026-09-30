import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ src, alt, className, style, sizes = "(max-width: 600px) 100vw, 50vw", priority = false, width, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);

  // Determine if src is the new optimized dictionary format or an old string
  let blurData = null;
  let srcSet = null;
  let finalSrc = src;
  let w = width;
  let h = height;

  if (src && typeof src === 'object' && src !== null) {
    // New optimized format
    blurData = src.blur;
    finalSrc = src.large || src.medium || src.thumb; // Fallback src
    w = width || src.width;
    h = height || src.height;
    
    const setParts = [];
    if (src.thumb) setParts.push(`${src.thumb} 300w`);
    if (src.medium) setParts.push(`${src.medium} 700w`);
    if (src.large) setParts.push(`${src.large} 1200w`);
    if (setParts.length > 0) {
      srcSet = setParts.join(", ");
    }
  } else if (typeof src === 'string') {
    // Old string format, append API_URL/uploads if it's a relative db path
    if (src && !src.startsWith('http') && !src.startsWith('/')) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      finalSrc = `${API_URL}/uploads/${src}`;
    }
  }

  useEffect(() => {
    if (!finalSrc) return;
    const img = new Image();
    if (srcSet) {
      img.srcset = srcSet;
      img.sizes = sizes;
    } else {
      img.src = finalSrc;
    }
    img.onload = () => {
      setCurrentSrc(img.currentSrc || finalSrc);
      setIsLoaded(true);
    };
  }, [finalSrc, srcSet, sizes]);

  if (!finalSrc) return null;

  return (
    <div 
      className={`optimized-image-wrapper ${className || ''}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: w ? '100%' : 'auto',
        maxWidth: w ? `${w}px` : '100%',
        aspectRatio: w && h ? `${w} / ${h}` : 'auto',
        ...style
      }}
    >
      {/* Blur Placeholder */}
      {blurData && (
        <img
          src={blurData}
          alt={alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: style?.objectFit || 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            opacity: isLoaded ? 0 : 1,
            transition: 'opacity 0.4s ease-out',
            zIndex: 1
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Real Image */}
      <img
        src={finalSrc}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        width={w}
        height={h}
        style={{
          width: '100%',
          height: '100%',
          objectFit: style?.objectFit || 'cover',
          opacity: (isLoaded || !blurData) ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
          zIndex: 2,
          position: 'relative'
        }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default OptimizedImage;
