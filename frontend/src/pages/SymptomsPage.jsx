import { useState, useMemo, useRef } from 'react';
import { DIAGNOSES } from '../data/diagnoses.js';

const SPECIALTY_COLORS = {
  'Кардиология':     '#ef4444',
  'Неврология':      '#3b82f6',
  'Пульмонология':   '#0ea5e9',
  'Гастроэнтерология': '#f97316',
  'Эндокринология':  '#a855f7',
  'Нефрология':      '#06b6d4',
  'Ревматология':    '#eab308',
  'Гематология':     '#f43f5e',
  'Инфектология':    '#22c55e',
  'Хирургия':        '#64748b',
  'Травматология':   '#f59e0b',
  'Дерматология':    '#ec4899',
  'Урология':        '#6366f1',
  'Гинекология':     '#d946ef',
  'Психиатрия':      '#8b5cf6',
  'ЛОР':             '#14b8a6',
  'Офтальмология':   '#84cc16',
};

function buildSymptomIndex(diagnoses) {
  const set = new Set();
  diagnoses.forEach(d => d.symptoms.forEach(s => set.add(s)));
  return Array.from(set).sort();
}

function matchScore(diagnosis, tags) {
  if (tags.length === 0) return 0;
  const matched = tags.filter(tag =>
    diagnosis.symptoms.some(s => s.includes(tag) || tag.includes(s))
  );
  return { matched, score: matched.length };
}

export default function SymptomsPage() {
  const [inputVal, setInputVal]           = useState('');
  const [tags, setTags]                   = useState([]);
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [expandedId, setExpandedId]       = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const allSymptoms  = useMemo(() => buildSymptomIndex(DIAGNOSES), []);
  const allSpecialties = useMemo(() =>
    [...new Set(DIAGNOSES.map(d => d.specialty))].sort(), []);

  const suggestions = useMemo(() => {
    const q = inputVal.trim().toLowerCase();
    if (q.length < 2) return [];
    return allSymptoms
      .filter(s => s.includes(q) && !tags.includes(s))
      .slice(0, 8);
  }, [inputVal, allSymptoms, tags]);

  const results = useMemo(() => {
    const freeText = inputVal.trim().toLowerCase();
    const hasQuery = tags.length > 0 || freeText.length >= 2;
    if (!hasQuery) return [];

    return DIAGNOSES
      .filter(d => !specialtyFilter || d.specialty === specialtyFilter)
      .map(d => {
        const { matched, score } = matchScore(d, tags);
        const nameHit = freeText && (
          d.name.toLowerCase().includes(freeText) ||
          d.icd.toLowerCase().includes(freeText) ||
          d.symptoms.some(s => s.includes(freeText))
        );
        const total = score + (nameHit ? 0.5 : 0);
        return { ...d, matched, score: total };
      })
      .filter(d => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60);
  }, [tags, inputVal, specialtyFilter]);

  function addTag(s) {
    const trimmed = s.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setInputVal('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeTag(s) {
    setTags(prev => prev.filter(x => x !== s));
  }

  function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
      e.preventDefault();
      addTag(suggestions.length ? suggestions[0] : inputVal);
    } else if (e.key === 'Backspace' && !inputVal && tags.length) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  const hasQuery = tags.length > 0 || inputVal.trim().length >= 2;

  return (
    <div className="min-h-screen bg-[#050918] px-4 py-8 md:px-10 md:py-10 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#3a4a6a] mb-1">Справочник</p>
        <h1 className="text-2xl font-light text-[#dce8ff] tracking-tight">Поиск по симптомам</h1>
        <p className="text-[#2a3a50] text-xs font-mono mt-1">400 диагнозов — введи симптомы, получи список вероятных диагнозов</p>
      </div>

      {/* Tag input */}
      <div className="relative mb-5">
        <div
          className="flex flex-wrap gap-2 items-center bg-[#0b1226] border border-[#1a2540] focus-within:border-[#4a80f5]/50 px-3 py-2.5 min-h-[52px] cursor-text transition-colors"
          onClick={() => inputRef.current?.focus()}
        >
          {tags.map(t => (
            <span key={t}
              className="flex items-center gap-1.5 bg-[#4a80f5]/15 border border-[#4a80f5]/30 text-[#7aabff] font-mono text-[11px] px-2.5 py-1 shrink-0"
            >
              {t}
              <button
                onClick={e => { e.stopPropagation(); removeTag(t); }}
                className="text-[#4a5a7a] hover:text-[#ef4444] transition-colors leading-none"
              >×</button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={inputVal}
            onChange={e => { setInputVal(e.target.value); setShowSuggestions(true); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
            placeholder={tags.length ? 'Ещё симптом...' : 'Симптом (напр. «одышка», «боль в груди», «отёки»)...'}
            className="flex-1 min-w-[180px] bg-transparent text-[#dce8ff] font-mono text-sm placeholder-[#1e2d45] outline-none py-0.5"
          />
        </div>

        {/* Autocomplete */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-20 bg-[#0b1226] border border-[#1a2540] border-t-0 max-h-52 overflow-y-auto">
            {suggestions.map(s => (
              <button
                key={s}
                onMouseDown={() => addTag(s)}
                className="block w-full text-left px-4 py-2.5 font-mono text-[12px] text-[#6a80aa] hover:bg-[#4a80f5]/10 hover:text-[#dce8ff] transition-colors"
              >
                {s}
              </button>
            ))}
            <div className="px-4 py-2 font-mono text-[10px] text-[#1e2d45] border-t border-white/[0.03]">
              Enter — добавить · Backspace — удалить последний
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {!hasQuery && (
        <div className="font-mono text-[10px] text-[#1e2d45] mb-5">
          Подсказка: вводи по одному симптому, нажимай Enter — система подбирает диагнозы по числу совпадений
        </div>
      )}

      {/* Specialty filter */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        <button
          onClick={() => setSpecialtyFilter('')}
          className={`font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 border transition-colors ${
            !specialtyFilter
              ? 'border-[#4a80f5] text-[#4a80f5] bg-[#4a80f5]/10'
              : 'border-white/[0.08] text-[#2a3a50] hover:border-white/[0.15] hover:text-[#6a80aa]'
          }`}
        >
          Все
        </button>
        {allSpecialties.map(sp => {
          const color = SPECIALTY_COLORS[sp] || '#4a80f5';
          const active = specialtyFilter === sp;
          return (
            <button
              key={sp}
              onClick={() => setSpecialtyFilter(active ? '' : sp)}
              className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 border transition-colors"
              style={active
                ? { borderColor: color, color, background: `${color}18` }
                : { borderColor: 'rgba(255,255,255,0.08)', color: '#2a3a50' }
              }
            >
              {sp}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#2a3a50] mb-4">
            {results.length} диагноз{results.length === 1 ? '' : results.length < 5 ? 'а' : 'ов'} · сортировка по совпадениям
          </div>
          <div className="space-y-px">
            {results.map(d => (
              <ResultCard
                key={d.id}
                diagnosis={d}
                tags={tags}
                expanded={expandedId === d.id}
                onToggle={() => setExpandedId(expandedId === d.id ? null : d.id)}
              />
            ))}
          </div>
        </div>
      ) : hasQuery ? (
        <div className="text-center text-[#1e2d45] font-mono text-xs py-16 uppercase tracking-widest">
          Диагнозы не найдены
        </div>
      ) : (
        <div className="text-center py-20 select-none">
          <div className="font-mono text-[100px] leading-none text-[#0a1020]">Rx</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#1a2535] mt-4">
            Введи симптомы выше
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ diagnosis, tags, expanded, onToggle }) {
  const color = SPECIALTY_COLORS[diagnosis.specialty] || '#4a80f5';
  const totalSymptoms = diagnosis.symptoms.length;
  const matchedCount  = diagnosis.matched.length;
  const pct = tags.length ? Math.round((matchedCount / tags.length) * 100) : 0;

  return (
    <div
      className="border-b border-white/[0.04] last:border-b-0"
      style={expanded ? { borderColor: `${color}20` } : {}}
    >
      <button
        className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-white/[0.015] transition-colors"
        onClick={onToggle}
      >
        {/* Score indicator */}
        {tags.length > 0 && (
          <div className="flex flex-col items-center gap-0.5 pt-1 shrink-0 w-6">
            <span className="font-mono text-[13px] font-bold" style={{ color }}>
              {matchedCount}
            </span>
            <span className="font-mono text-[8px] text-[#2a3a50]">/{tags.length}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color }}>
              {diagnosis.specialty}
            </span>
            <span className="font-mono text-[9px] text-[#1e2d45]">{diagnosis.icd}</span>
          </div>
          <div className="text-[#c5d8f8] text-sm font-light">{diagnosis.name}</div>

          {/* Matched symptom chips */}
          {matchedCount > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {diagnosis.matched.map(m => (
                <span
                  key={m}
                  className="font-mono text-[10px] px-1.5 py-0.5"
                  style={{ background: `${color}15`, color }}
                >
                  ✓ {m}
                </span>
              ))}
            </div>
          )}

          {/* Match bar */}
          {tags.length > 0 && (
            <div className="mt-2 h-px w-full bg-white/[0.04]">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          )}
        </div>

        <span className="text-[#1e2d45] text-[10px] pt-1 shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/[0.04]">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#2a3a50] mb-2.5">
            Все симптомы ({totalSymptoms})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {diagnosis.symptoms.map(s => {
              const isMatched = diagnosis.matched.includes(s);
              return (
                <span
                  key={s}
                  className="font-mono text-[11px] px-2 py-1 border"
                  style={isMatched
                    ? { borderColor: `${color}40`, background: `${color}12`, color }
                    : { borderColor: 'rgba(255,255,255,0.05)', color: '#3a4a6a' }
                  }
                >
                  {s}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
