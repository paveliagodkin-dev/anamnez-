export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Анамнез">
      {/* A — левая нога */}
      <line x1="3" y1="37" x2="20" y2="4" stroke="#4a80f5" strokeWidth="2.5" strokeLinecap="round" />
      {/* A — правая нога */}
      <line x1="37" y1="37" x2="20" y2="4" stroke="#4a80f5" strokeWidth="2.5" strokeLinecap="round" />
      {/* ЭКГ-перекладина */}
      <polyline
        points="10,25 13,25 15,15 18.5,33 20.5,18 22,25 30,25"
        stroke="#7ab4ff"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoFull({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={28} />
      <span className="font-bold text-lg tracking-wide select-none" style={{ color: '#dce8ff', letterSpacing: '0.04em' }}>
        Анам<span style={{ color: '#4a80f5' }}>нез</span>
      </span>
    </div>
  );
}
