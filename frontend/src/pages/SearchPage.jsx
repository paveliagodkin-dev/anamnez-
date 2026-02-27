import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';

const DIFF_LABEL = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };
const DIFF_COLOR = { easy: 'text-[#4ade80]', medium: 'text-[#facc15]', hard: 'text-[#f87171]' };

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') || '';

  const [inputVal, setInputVal] = useState(q);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setInputVal(q);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    api.searchCases(q)
      .then(r => setResults(r.cases || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  function handleSubmit(e) {
    e.preventDefault();
    if (inputVal.trim()) setParams({ q: inputVal.trim() });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-10 pb-20">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          ref={inputRef}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Введите симптом, диагноз, специальность..."
          className="flex-1 bg-[#0b1226] border border-white/[0.07] focus:border-[#4a80f5] px-4 py-3 font-mono text-sm text-[#dce8ff] placeholder-[#3a4a6a] outline-none transition-colors"
        />
        <button
          type="submit"
          className="bg-[#4a80f5] text-white font-mono text-[11px] uppercase tracking-widest px-6 hover:bg-[#6a97f7] transition-colors"
        >
          Найти
        </button>
      </form>

      {/* Status */}
      {q && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#3a4a6a] mb-5">
          {loading ? 'Поиск...' : `Найдено: ${results.length} случаев по запросу «${q}»`}
        </p>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map(c => (
            <button
              key={c.id}
              onClick={() => navigate('/diagnoz')}
              className="w-full text-left border border-white/[0.06] bg-white/[0.02] hover:border-[#4a80f5]/40 hover:bg-white/[0.04] px-5 py-4 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[#dce8ff] text-sm font-medium group-hover:text-[#4a80f5] transition-colors mb-1">
                    {c.title}
                  </p>
                  {c.specialty && (
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#3a4a6a]">
                      {c.specialty}
                    </p>
                  )}
                </div>
                {c.difficulty && (
                  <span className={`font-mono text-[10px] uppercase tracking-widest shrink-0 ${DIFF_COLOR[c.difficulty]}`}>
                    {DIFF_LABEL[c.difficulty]}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && q && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#2a3a50] font-mono text-sm mb-2">Ничего не найдено</p>
          <p className="text-[#1e2a3a] font-mono text-[11px]">Попробуйте другой запрос</p>
        </div>
      )}

      {/* Hint when empty query */}
      {!q && (
        <div className="text-center py-16">
          <p className="text-[#2a3a50] font-mono text-sm">Начните вводить запрос</p>
        </div>
      )}
    </div>
  );
}
