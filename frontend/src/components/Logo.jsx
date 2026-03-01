export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Анамнез">
      {/* Left leg of A */}
      <line x1="3.5" y1="37" x2="20" y2="4" stroke="#4a80f5" strokeWidth="3.5" strokeLinecap="round" />
      {/* Right leg of A */}
      <line x1="36.5" y1="37" x2="20" y2="4" stroke="#4a80f5" strokeWidth="3.5" strokeLinecap="round" />
      {/* Medical cross — horizontal bar (replaces A crossbar) */}
      <rect x="11" y="22" width="18" height="4" rx="2" fill="#ef4444" />
      {/* Medical cross — vertical bar */}
      <rect x="18" y="15" width="4" height="18" rx="2" fill="#ef4444" />
    </svg>
  );
}

export function LogoFull({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={28} />
      <span className="font-bold text-lg text-[#dce8ff] tracking-wide select-none">
        Анам<span className="text-[#4a80f5]">нез</span>
      </span>
    </div>
  );
}
