import { useState, useRef } from 'react';
import { api } from '../lib/api.js';

const SEVERITY_CONFIG = {
  low:       { label: 'Не срочно',      color: 'text-[#888890] border-[#888890]/30' },
  medium:    { label: 'Обратись к врачу', color: 'text-[#e8c882] border-[#e8c882]/30' },
  high:      { label: 'Срочно к врачу', color: 'text-[#f09050] border-[#f09050]/30' },
  emergency: { label: 'Скорая помощь',  color: 'text-[#f08080] border-[#f08080]/30' },
};

const POPULAR = [
  'кашель', 'температура', 'головная боль', 'боль в груди',
  'одышка', 'тошнота', 'слабость', 'боль в животе', 'головокружение', 'отёки',
];

function DiagnosisCard({ d, searchedSymptom }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[d.severity] || SEVERITY_CONFIG.medium;

  return (
    <div className="bg-[#111118] border border-white/5 hover:border-white/10 transition-colors">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-mono text-[9px] text-[#444450] uppercase tracking-widest mb-1">{d.category}</p>
            <h3 className="font-serif text-[18px] text-[#e8e8e0] leading-snug">{d.name}</h3>
          </div>
          <span className={`font-mono text-[9px] border px-2 py-1 flex-shrink-0 ${sev.color}`}>
            {sev.label}
          </span>
        </div>

        {/* Description */}
        <p className="font-serif text-[13px] text-[#666670] leading-relaxed mb-4">
          {d.description}
        </p>

        {/* Symptoms */}
        <div className="mb-3">
          <p className="font-mono text-[9px] text-[#444450] uppercase tracking-widest mb-2">Симптомы</p>
          <div className="flex flex-wrap gap-1.5">
            {d.symptoms.map(s => {
              const isMatch = s.toLowerCase().includes(searchedSymptom.toLowerCase());
              return (
                <span
                  key={s}
                  className={`font-mono text-[10px] px-2 py-1 border ${
                    isMatch
                      ? 'bg-[#c8f0a0]/10 border-[#c8f0a0]/40 text-[#c8f0a0]'
                      : 'bg-[#1a1a24] border-white/5 text-[#666670]'
                  }`}
                >
                  {s}
                </span>
              );
            })}
          </div>
        </div>

        {/* When to see doctor */}
        {d.when_to_see_doctor && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="font-mono text-[10px] text-[#444450] hover:text-[#c8f0a0] transition-colors mt-1"
          >
            {expanded ? '▲ Скрыть' : '▼ Когда обратиться к врачу'}
          </button>
        )}
        {expanded && d.when_to_see_doctor && (
          <p className="font-serif text-[12px] text-[#888890] italic leading-relaxed mt-2 border-l-2 border-[#c8f0a0]/20 pl-3">
            {d.when_to_see_doctor}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DiagnosPage() {
  const [query, setQuery] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState('');
  const timerRef = useRef(null);

  function handleInput(value) {
    setQuery(value);
    clearTimeout(timerRef.current);
    if (!value.trim()) {
      setDiagnoses([]);
      setSearched('');
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { diagnoses: result } = await api.searchDiagnoses(value.trim());
        setDiagnoses(result);
        setSearched(value.trim());
      } catch {
        setDiagnoses([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  function pickPopular(s) {
    setQuery(s);
    handleInput(s);
  }

  const emergency = diagnoses.filter(d => d.severity === 'emergency');
  const rest = diagnoses.filter(d => d.severity !== 'emergency');

  return (
    <div className="max-w-4xl mx-auto px-10 py-12">
      {/* Hero */}
      <p className="font-mono text-[11px] text-[#c8f0a0] uppercase tracking-widest mb-4">Симптомы</p>
      <h1 className="font-serif text-6xl font-bold leading-none mb-3">
        Что это<br /><em className="text-[#e8c882]">может быть?</em>
      </h1>
      <p className="font-serif text-[#444450] text-lg italic mb-10">
        Введи симптом — узнай, какие болезни с ним связаны
      </p>

      {/* Search input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          placeholder="Например: кашель, головная боль, отёки..."
          className="w-full bg-[#111118] border border-white/10 focus:border-[#c8f0a0]/40 outline-none font-serif text-[16px] text-[#e8e8e0] placeholder-[#333340] px-5 py-4 transition-colors"
        />
        {loading && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#444450]">
            поиск...
          </span>
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(''); setDiagnoses([]); setSearched(''); }}
            className="absolute right-5 top-1/2 -translate-y-1/2 font-mono text-[14px] text-[#444450] hover:text-[#e8e8e0] transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Popular symptoms */}
      {!searched && (
        <div className="flex flex-wrap gap-2 mb-10">
          {POPULAR.map(s => (
            <button
              key={s}
              onClick={() => pickPopular(s)}
              className="font-mono text-[10px] border border-white/5 text-[#444450] px-3 py-1.5 hover:border-white/20 hover:text-[#888890] transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      {searched && (
        <p className="font-mono text-[9px] text-[#333340] uppercase tracking-widest mb-6">
          ⚠ Информация носит справочный характер. Для постановки диагноза обратитесь к врачу.
        </p>
      )}

      {/* No results */}
      {searched && !loading && diagnoses.length === 0 && (
        <div className="py-12 border border-white/5 text-center">
          <p className="font-mono text-[11px] text-[#444450] uppercase tracking-widest mb-2">Ничего не найдено</p>
          <p className="font-serif text-[#333340] italic text-sm">Попробуй другой симптом</p>
        </div>
      )}

      {/* Emergency block */}
      {emergency.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-[#f08080]/20" />
            <p className="font-mono text-[9px] text-[#f08080] uppercase tracking-widest">Требует срочной помощи</p>
            <div className="h-px flex-1 bg-[#f08080]/20" />
          </div>
          <div className="space-y-3">
            {emergency.map(d => <DiagnosisCard key={d.id} d={d} searchedSymptom={searched} />)}
          </div>
        </div>
      )}

      {/* Rest of results */}
      {rest.length > 0 && (
        <>
          {searched && (
            <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest mb-4">
              Найдено: {rest.length} {emergency.length > 0 ? 'других ' : ''}диагноз{rest.length === 1 ? '' : rest.length < 5 ? 'а' : 'ов'}
            </p>
          )}
          <div className="space-y-3">
            {rest.map(d => <DiagnosisCard key={d.id} d={d} searchedSymptom={searched} />)}
          </div>
        </>
      )}
    </div>
  );
}
