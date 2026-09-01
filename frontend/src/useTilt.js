import { useEffect, useRef } from 'react'

export function useTilt(options = {}) {
  const ref = useRef(null)
  
  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    // Disable on reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return
    
    // Disable on small screens (mobile)
    if (window.innerWidth <= 768) return

    const { max = 10, perspective = 1000, scale = 1, speed = 400, easing = "cubic-bezier(.03,.98,.52,.99)" } = options

    el.style.transition = `transform ${speed}ms ${easing}`
    
    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      
      const width = el.offsetWidth
      const height = el.offsetHeight
      
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const xPct = mouseX / width - 0.5
      const yPct = mouseY / height - 0.5
      
      const xTilt = (max * -yPct).toFixed(2)
      const yTilt = (max * xPct).toFixed(2)
      
      el.style.transform = `perspective(${perspective}px) rotateX(${xTilt}deg) rotateY(${yTilt}deg) scale3d(${scale}, ${scale}, ${scale})`
    }
    
    const handleMouseLeave = () => {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    }
    
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [options])
  
  return ref
}
