import React from 'react'
import { useTilt } from './useTilt'

export function TiltCard({ children, className, style, onClick, options }) {
  const tiltRef = useTilt(options)
  return (
    <div ref={tiltRef} className={className} style={style} onClick={onClick}>
      {children}
    </div>
  )
}
