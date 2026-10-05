import logoSrc from '../assets/it-pulse-logo.png'

export default function ITPulseLogo({ size = 88, className = '', shape = 'rounded' }) {
  const isCircle = shape === 'circle'
  const shapeClass = isCircle
    ? 'rounded-full border-2 border-cyan-400/45 shadow-[0_0_30px_rgba(0,210,255,0.35),0_0_55px_rgba(232,121,249,0.2)]'
    : 'rounded-2xl border border-white/15 shadow-md'

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative shrink-0 overflow-hidden bg-[#070b28] transition-transform duration-300 ${shapeClass} ${className}`}
    >
      <img
        src={logoSrc}
        alt="IT Pulse Department Logo"
        width={size}
        height={size}
        className="h-full w-full object-cover scale-[1.26] transition-transform duration-300 select-none pointer-events-none"
        loading="eager"
      />
    </div>
  )
}
