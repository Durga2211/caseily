/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DIWALI FESTIVE THEME CONFIGURATION (Caseily - Diwali 2026)
 * ─────────────────────────────────────────────────────────────────────────────
 * Festival Date: 8 November 2026
 * 
 * TO DISABLE THE THEME:
 * Simply change `DIWALI_THEME = false` below.
 * Everything will cleanly revert to the standard Caseily layout and styling.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const DIWALI_THEME = true;

export const DIWALI_CONFIG = {
  festivalName: 'Diwali 2026',
  festivalDate: '8 Nov 2026',
  // Target: 8 November 2026, 11:59:59 PM IST (UTC+05:30)
  targetCountdownDate: '2026-11-08T23:59:59+05:30',
  
  // Festive brand palette
  colors: {
    brandBlue: '#1e3fd1',
    navyNight: '#070d1e',
    navyDeep: '#0b1533',
    gold: '#F5B301',
    goldLight: '#FDE047',
    goldGlow: 'rgba(245, 179, 1, 0.45)',
    saffron: '#FF9933',
    marigoldOrange: '#F97316',
    deepMagenta: '#BE185D',
    flameYellow: '#FEF08A',
    cardDark: '#0e1a3a',
  },

  // Promo Coupon
  couponCode: 'DIWALI26',
  couponDiscount: '26% OFF',
  couponMinOrder: '₹499',

  // Ticker text
  tickerText: 'Happy Diwali from Caseily 🪔 Festive offers live now – use code DIWALI26',

  // Community Diya Counter initial state
  initialDiyaCount: 12480,

  // Dummy collection for Diwali Edition phone cases
  // (Easily editable with your live catalog or custom image URLs)
  products: [
    {
      id: 'diwali-case-1',
      name: 'The Royal Diya Edition',
      subtitle: '24K Gold Foil Embossed · ShockDrop Armor',
      price: 799,
      originalPrice: 1499,
      discount: '47% OFF',
      rating: 4.9,
      reviewsCount: 318,
      badge: 'Limited Edition',
      tag: 'Bestseller',
      image: '/class_hero.jpg', // uses existing project assets with festive styling
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      accentColor: '#F5B301',
      description: 'Hand-crafted royal blue matte case with raised 24K gold foil diya motifs and dual-layer drop protection up to 10ft.',
      compatible: 'iPhone 16 / 15 / 14 Series · Samsung S24'
    },
    {
      id: 'diwali-case-2',
      name: 'Prismatic Rangoli Glass',
      subtitle: 'Tempered Glass Back · MagSafe Compatible',
      price: 899,
      originalPrice: 1699,
      discount: '47% OFF',
      rating: 5.0,
      reviewsCount: 242,
      badge: 'Limited Edition',
      tag: 'New Drop',
      image: '/banner2_image.png',
      gradient: 'linear-gradient(135deg, #4a044e 0%, #701a75 50%, #86198f 100%)',
      accentColor: '#FF9933',
      description: '9H scratch-resistant tempered glass case showcasing an intricate glowing rangoli mandala with embedded MagSafe magnetics.',
      compatible: 'iPhone 16 / 15 / 14 Pro & Pro Max'
    },
    {
      id: 'diwali-case-3',
      name: 'Midnight Saffron Spark',
      subtitle: 'Liquid Silicone · Velvet Microfiber Interior',
      price: 649,
      originalPrice: 1299,
      discount: '50% OFF',
      rating: 4.8,
      reviewsCount: 195,
      badge: 'Festive Special',
      tag: 'Top Pick',
      image: '/banner_wallet.png',
      gradient: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)',
      accentColor: '#F5B301',
      description: 'Premium soft-touch saffron silicone with gold camera ring shield and anti-dust oleophobic coating.',
      compatible: 'All Major iPhone & Oneplus Models'
    },
    {
      id: 'diwali-case-4',
      name: 'Golden Lotus Metallic',
      subtitle: 'Aero-Grade Aluminum Bumper · Translucent Matte',
      price: 949,
      originalPrice: 1899,
      discount: '50% OFF',
      rating: 4.9,
      reviewsCount: 410,
      badge: 'Limited Edition',
      tag: 'Collector',
      image: '/banner_apple.png',
      gradient: 'linear-gradient(135deg, #172554 0%, #1e3a8a 50%, #1e40af 100%)',
      accentColor: '#FF9933',
      description: 'Sculpted gold floral mandala with satin midnight matte finish. Military-grade corner bumpers tested for severe impacts.',
      compatible: 'iPhone 16 / 15 / 14 / 13'
    }
  ],

  // Festive offers
  offers: [
    {
      id: 'offer-b2g1',
      tag: 'MEGA DEAL',
      title: 'Buy 2, Get 1 FREE',
      desc: 'Add any 3 cases to cart. The lowest price case is automatically 100% free at checkout.',
      icon: '🎁',
      color: '#FF9933'
    },
    {
      id: 'offer-code',
      tag: 'EXTRA 26% OFF',
      title: 'Use Code DIWALI26',
      desc: 'Flat 26% instant discount on orders above ₹499. One-tap to copy code.',
      icon: '✨',
      color: '#F5B301'
    },
    {
      id: 'offer-shipping',
      tag: 'FAST & FREE',
      title: 'Free Express Delivery',
      desc: 'Guaranteed dispatch within 24 hours with priority festive courier tracking.',
      icon: '🚀',
      color: '#10B981'
    }
  ],

  // Community Poll Data
  poll: {
    question: 'Favourite Diwali Sweet to eat while unboxing your Caseily order?',
    options: [
      { text: 'Kaju Katli', initialVotes: 1840 },
      { text: 'Hot Gulab Jamun', initialVotes: 1420 },
      { text: 'Motichoor Ladoo', initialVotes: 980 },
      { text: 'Rasgulla / Rasmalai', initialVotes: 730 },
      { text: 'Crispy Samosa', initialVotes: 890 }
    ]
  }
};
