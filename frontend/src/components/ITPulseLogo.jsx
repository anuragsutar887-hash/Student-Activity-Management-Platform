import logoSrc from '../assets/it-pulse-logo.png'

export default function ITPulseLogo({ size = 48, className = '', shape = 'rounded' }) {
  const isCircle = shape === 'circle'
  const shapeClass = isCircle
    ? 'rounded-full border-2 border-amber-400/50 shadow-[0_0_20px_rgba(245,181,68,0.3)]'
    : 'rounded-xl border border-amber-400/30 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(245,181,68,0.15)]'

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative shrink-0 overflow-hidden bg-[#0d0f17] flex items-center justify-center transition-all duration-300 hover:border-amber-400/60 ${shapeClass} ${className}`}
    >
      <img
        src={logoSrc}
        alt="IT Pulse / IT Vertex Logo"
        width={size}
        height={size}
        className="h-full w-full object-contain p-1 select-none pointer-events-none transition-transform duration-300 hover:scale-105"
        loading="eager"
      />
    </div>
  )
}
