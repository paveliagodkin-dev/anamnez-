import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api.js';

const DIFFICULTY_LABEL = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };
const DIFFICULTY_COLOR = {
  easy: 'text-[#c8f0a0] border-[#c8f0a0]/30',
  medium: 'text-[#e8c882] border-[#e8c882]/30',
  hard: 'text-[#f08080] border-[#f08080]/30',
};

const POPULAR_SYMPTOMS = [
  'кашель', 'лихорадка', 'боль в груди', 'одышка', 'головная боль',
  'тошнота', 'слабость', 'отёки', 'боль в животе', 'головокружение',
];

function CaseCard({ c, onClick }) {
  const diff = DIFFICULTY_COLOR[c.difficulty] || 'text-[#666670] border-[#666670]/30';
  const accuracy = c.solve_count ? Math.round((c.correct_count / c.solve_count) * 100) : null;

  return (
    <div
      className="bg-[#111118] border border-white/5 p-6 cursor-pointer hover:border-[#c8f0a0]/20 transition-colors group"
      onClick={() => onClick(c)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest">{c.specialty}</p>
        <span className={`font-mono text-[9px] border px-1.5 py-0.5 flex-shrink-0 ${diff}`}>
          {DIFFICULTY_LABEL[c.difficulty] || c.difficulty}
        </span>
      </div>

      <h3 className="font-serif text-[17px] text-[#e8e8e0] mb-2 group-hover:text-white transition-colors leading-snug">
        {c.title}
      </h3>

      <p className="font-serif text-[13px] text-[#666670] leading-relaxed mb-4 line-clamp-2">
        {c.description}
      </p>

      {c.symptoms?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {c.symptoms.map(s => (
            <span key={s} className="font-mono text-[9px] bg-[#1a1a24] text-[#888890] px-2 py-0.5">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="font-mono text-[10px] text-[#444450]">
          {c.solve_count ? `${c.solve_count} решений${accuracy !== null ? ` · ${accuracy}% правильно` : ''}` : 'Ещё не решали'}
        </span>
        <span className="font-mono text-[10px] text-[#c8f0a0] opacity-0 group-hover:opacity-100 transition-opacity">
          Открыть →
        </span>
      </div>
    </div>
  );
}

function CaseModal({ caseData, onClose }) {
  const [fullCase, setFullCase] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    api.getCase(caseData.id)
      .then(data => setFullCase(data))
      .catch(() => setFullCase(caseData))
      .finally(() => setLoading(false));
  }, [caseData.id]);

  async function handleAnswer() {
    if (!selected || answering) return;
    setAnswering(true);
    try {
      const res = await api.answerCase(caseData.id, selected);
      setResult(res);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setAnswering(false);
    }
  }

  const diff = DIFFICULTY_COLOR[caseData.difficulty] || 'text-[#666670] border-[#666670]/30';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4 pb-8 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0d0d14] border border-white/10 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest">{caseData.specialty}</p>
              <span className={`font-mono text-[9px] border px-1.5 py-0.5 ${diff}`}>
                {DIFFICULTY_LABEL[caseData.difficulty] || caseData.difficulty}
              </span>
            </div>
            <h2 className="font-serif text-2xl text-[#e8e8e0] leading-tight">{caseData.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-[11px] text-[#444450] hover:text-[#e8e8e0] transition-colors ml-4 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center font-mono text-[11px] text-[#444450]">Загрузка...</div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Description */}
            <div>
              <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest mb-2">Анамнез</p>
              <p className="font-serif text-[14px] text-[#c8c8c0] leading-relaxed">{fullCase.description}</p>
            </div>

            {/* History */}
            {fullCase.history && (
              <div>
                <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest mb-2">История болезни</p>
                <p className="font-serif text-[14px] text-[#c8c8c0] leading-relaxed">{fullCase.history}</p>
              </div>
            )}

            {/* Vitals */}
            {fullCase.vitals && Object.keys(fullCase.vitals).length > 0 && (
              <div>
                <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest mb-2">Показатели</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(fullCase.vitals).map(([k, v]) => (
                    <div key={k} className="bg-[#111118] border border-white/5 px-3 py-2">
                      <p className="font-mono text-[9px] text-[#444450] uppercase">{k}</p>
                      <p className="font-mono text-[13px] text-[#e8e8e0]">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Symptoms */}
            {fullCase.symptoms?.length > 0 && (
              <div>
                <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest mb-2">Симптомы</p>
                <div className="flex flex-wrap gap-1.5">
                  {fullCase.symptoms.map(s => (
                    <span key={s} className="font-mono text-[10px] bg-[#1a1a24] border border-white/5 text-[#888890] px-2 py-1">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            {fullCase.options?.length > 0 && (
              <div>
                <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest mb-3">Ваш диагноз</p>
                <div className="space-y-2">
                  {fullCase.options.map(opt => {
                    const isUserAnswer = result && fullCase.user_answer?.option_id === opt.id;
                    const isCorrect = opt.is_correct;
                    const showResult = result && (isCorrect || isUserAnswer);

                    let borderColor = 'border-white/5 hover:border-white/20';
                    if (showResult && isCorrect) borderColor = 'border-[#c8f0a0]/50 bg-[#c8f0a0]/5';
                    else if (showResult && isUserAnswer && !isCorrect) borderColor = 'border-[#f08080]/50 bg-[#f08080]/5';
                    else if (selected === opt.id) borderColor = 'border-[#c8f0a0]/30';

                    return (
                      <div
                        key={opt.id}
                        className={`border p-3 cursor-pointer transition-all ${borderColor} ${result ? 'cursor-default' : ''}`}
                        onClick={() => !result && setSelected(opt.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-[11px] text-[#444450] flex-shrink-0 mt-0.5">{opt.letter}.</span>
                          <div className="flex-1">
                            <p className="font-serif text-[13px] text-[#c8c8c0]">{opt.text}</p>
                            {showResult && opt.explanation && (
                              <p className="font-serif text-[12px] text-[#666670] mt-1.5 italic">{opt.explanation}</p>
                            )}
                          </div>
                          {showResult && isCorrect && (
                            <span className="font-mono text-[10px] text-[#c8f0a0] flex-shrink-0">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {result?.error && (
                  <p className="font-mono text-[11px] text-[#f08080] mt-3">{result.error}</p>
                )}

                {!result && (
                  <button
                    onClick={handleAnswer}
                    disabled={!selected || answering}
                    className="mt-4 w-full font-mono text-[11px] uppercase tracking-wider bg-[#c8f0a0] text-[#0a0a0f] py-3 hover:bg-[#d8ffb0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {answering ? 'Проверяем...' : 'Поставить диагноз'}
                  </button>
                )}

                {result && !result.error && (
                  <div className={`mt-4 p-3 border font-mono text-[11px] ${result.is_correct ? 'border-[#c8f0a0]/30 text-[#c8f0a0]' : 'border-[#f08080]/30 text-[#f08080]'}`}>
                    {result.is_correct ? '+ Правильно! Очки начислены.' : '× Неверно. Изучи объяснения выше.'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiagnosPage() {
  const [symptoms, setSymptoms] = useState([]);
  const [input, setInput] = useState('');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeCase, setActiveCase] = useState(null);
  const inputRef = useRef(null);

  function addSymptom(value) {
    const v = value.trim().toLowerCase();
    if (v && !symptoms.includes(v)) {
      setSymptoms(prev => [...prev, v]);
    }
    setInput('');
  }

  function removeSymptom(s) {
    setSymptoms(prev => prev.filter(x => x !== s));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addSymptom(input);
    } else if (e.key === 'Backspace' && !input && symptoms.length) {
      setSymptoms(prev => prev.slice(0, -1));
    }
  }

  useEffect(() => {
    if (!symptoms.length) {
      setCases([]);
      setSearched(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { cases: result } = await api.searchCases(symptoms);
        setCases(result);
        setSearched(true);
      } catch {
        setCases([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [symptoms]);

  return (
    <div className="max-w-6xl mx-auto px-10 py-12">
      {/* Hero */}
      <p className="font-mono text-[11px] text-[#c8f0a0] uppercase tracking-widest mb-4">Диагноз</p>
      <h1 className="font-serif text-7xl font-bold leading-none mb-10">
        Поставь<br /><em className="text-[#e8c882]">правильный</em><br />диагноз
      </h1>

      {/* Search block */}
      <div className="mb-8">
        <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest mb-3">
          Введите симптомы пациента
        </p>

        {/* Tag input */}
        <div
          className="flex flex-wrap gap-2 min-h-[52px] bg-[#111118] border border-white/10 px-3 py-2 cursor-text focus-within:border-[#c8f0a0]/40 transition-colors"
          onClick={() => inputRef.current?.focus()}
        >
          {symptoms.map(s => (
            <span
              key={s}
              className="flex items-center gap-1.5 font-mono text-[11px] bg-[#1a1a24] text-[#c8f0a0] border border-[#c8f0a0]/20 px-2 py-1"
            >
              {s}
              <button
                onClick={e => { e.stopPropagation(); removeSymptom(s); }}
                className="text-[#c8f0a0]/50 hover:text-[#c8f0a0] transition-colors leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => input.trim() && addSymptom(input)}
            placeholder={symptoms.length ? '' : 'кашель, лихорадка, боль в груди...'}
            className="flex-1 min-w-[160px] bg-transparent font-mono text-[13px] text-[#e8e8e0] placeholder-[#333340] outline-none py-1"
          />
        </div>

        <p className="font-mono text-[9px] text-[#333340] mt-1.5">Enter — добавить симптом · Backspace — удалить последний</p>

        {/* Popular symptoms */}
        <div className="flex flex-wrap gap-2 mt-4">
          {POPULAR_SYMPTOMS.map(s => (
            <button
              key={s}
              onClick={() => symptoms.includes(s) ? removeSymptom(s) : addSymptom(s)}
              className={`font-mono text-[10px] border px-3 py-1.5 transition-all ${
                symptoms.includes(s)
                  ? 'border-[#c8f0a0]/40 text-[#c8f0a0] bg-[#c8f0a0]/5'
                  : 'border-white/5 text-[#444450] hover:border-white/20 hover:text-[#888890]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="font-mono text-[11px] text-[#444450] py-8">Ищем кейсы...</div>
      )}

      {!loading && searched && cases.length === 0 && (
        <div className="py-12 border border-white/5 text-center">
          <p className="font-mono text-[11px] text-[#444450] uppercase tracking-widest mb-2">Ничего не найдено</p>
          <p className="font-serif text-[#333340] text-sm italic">Попробуй другие симптомы или добавь больше</p>
        </div>
      )}

      {!loading && cases.length > 0 && (
        <>
          <p className="font-mono text-[10px] text-[#444450] uppercase tracking-widest mb-4">
            Найдено кейсов: {cases.length}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map(c => (
              <CaseCard key={c.id} c={c} onClick={setActiveCase} />
            ))}
          </div>
        </>
      )}

      {/* Case modal */}
      {activeCase && (
        <CaseModal caseData={activeCase} onClose={() => setActiveCase(null)} />
      )}
    </div>
  );
}
