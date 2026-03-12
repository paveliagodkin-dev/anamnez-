export const RANKS = [
  { min: 0,    label: 'Новичок',    color: '#5c6e98', bg: 'rgba(92,110,152,0.15)',   symbol: '○'  },
  { min: 50,   label: 'Интерн',     color: '#4a80f5', bg: 'rgba(74,128,245,0.15)',   symbol: '◎'  },
  { min: 150,  label: 'Ординатор',  color: '#4fc97e', bg: 'rgba(79,201,126,0.15)',   symbol: '◆'  },
  { min: 350,  label: 'Резидент',   color: '#f5c842', bg: 'rgba(245,200,66,0.15)',   symbol: '★'  },
  { min: 700,  label: 'Врач',       color: '#f5a85a', bg: 'rgba(245,168,90,0.15)',   symbol: '✦'  },
  { min: 1500, label: 'Специалист', color: '#e05567', bg: 'rgba(224,85,103,0.15)',   symbol: '✸'  },
  { min: 3000, label: 'Знаток',     color: '#c084fc', bg: 'rgba(192,132,252,0.15)',  symbol: '✺'  },
];

export function getRank(score = 0) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (score >= r.min) rank = r;
  }
  return rank;
}

export function getNextRank(score = 0) {
  const idx = RANKS.findIndex(r => r === getRank(score));
  return RANKS[idx + 1] || null;
}

export function getRankProgress(score = 0) {
  const rank = getRank(score);
  const next = getNextRank(score);
  if (!next) return 100;
  return Math.round(((score - rank.min) / (next.min - rank.min)) * 100);
}
