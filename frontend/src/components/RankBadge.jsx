import { getRank } from '../lib/ranks.js';

export default function RankBadge({ score = 0, size = 'sm' }) {
  const rank = getRank(score);

  if (size === 'sm') {
    return (
      <span
        className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border"
        style={{ color: rank.color, borderColor: `${rank.color}40`, background: rank.bg }}
      >
        <span>{rank.symbol}</span>
        <span>{rank.label}</span>
      </span>
    );
  }

  // size === 'lg'
  return (
    <div
      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border"
      style={{ color: rank.color, borderColor: `${rank.color}50`, background: rank.bg }}
    >
      <span className="text-[16px]">{rank.symbol}</span>
      <span>{rank.label}</span>
    </div>
  );
}
