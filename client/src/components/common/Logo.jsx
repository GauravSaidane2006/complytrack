export function LogoMark({ size = 40, className = '' }) {
  return (
    <svg
      viewBox="0 0 48 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * (52 / 48)}
      className={className}
      role="img"
      aria-label="ComplyTrack"
    >
      {/* Shield shape */}
      <path
        d="M24 2 L44 10 L44 26 C44 38 36 46 24 50 C12 46 4 38 4 26 L4 10 Z"
        fill="#4A7FB5"
      />
      {/* Inner lighter shield layer */}
      <path
        d="M24 6 L40 13 L40 26 C40 36 33 43 24 46.5 C15 43 8 36 8 26 L8 13 Z"
        fill="#5A90CC"
        opacity="0.4"
      />
      {/* Checkmark */}
      <path
        d="M16 26 L22 32 L33 19"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default function Logo({ light = false, className = '' }) {
  const textColor = light ? '#FFFFFF' : '#1A2332'

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      role="img"
      aria-label="ComplyTrack Logo"
    >
      <LogoMark size={36} />
      <span
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: textColor, fontFamily: "'Inter', sans-serif" }}
      >
        Comply<span style={{ color: '#4A7FB5' }}>Track</span>
      </span>
    </div>
  )
}

export function LogoWithTagline({ collapsed = false, light = false, className = '' }) {
  const textColor = light ? '#FFFFFF' : '#1A2332'
  const taglineColor = light ? 'rgba(255,255,255,0.65)' : '#64748b'

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="inline-flex items-center gap-3"
        role="img"
        aria-label="ComplyTrack Logo"
      >
        <LogoMark size={44} />
        <span
          className="text-3xl font-extrabold tracking-tight"
          style={{ color: textColor, fontFamily: "'Inter', sans-serif" }}
        >
          Comply<span style={{ color: '#4A7FB5' }}>Track</span>
        </span>
      </div>

      {!collapsed && (
        <p
          className="text-[11px] font-medium tracking-[0.2em] uppercase mt-2"
          style={{ color: taglineColor }}
        >
          Compliance Management Platform
        </p>
      )}
    </div>
  )
}
