import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuthStore } from '../hooks/useAuth.js';

const SECTION_TABS = [
  { to: '/feed', label: 'Лента' },
  { to: '/diagnoz', label: 'Клинические случаи' },
  { to: '/cards', label: 'Карточки' },
];

function SectionTabs() {
  return (
    <div className="flex gap-1 mb-8 border-b border-white/[0.06] pb-0 overflow-x-auto scrollbar-none">
      {SECTION_TABS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `font-mono text-[10px] md:text-[11px] uppercase tracking-widest px-3 md:px-4 py-3 border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
              isActive
                ? 'border-[#4a80f5] text-[#4a80f5]'
                : 'border-transparent text-[#3a4a6a] hover:text-[#dce8ff]'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  );
}

const DIFFICULTIES = [
  { value: '', label: 'Все' },
  { value: 'easy', label: 'Лёгкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'hard', label: 'Сложный' },
];

const DIFF_LABELS = {
  easy: { text: 'Лёгкий', color: 'text-[#4fc97e] border-[#4fc97e]/30' },
  medium: { text: 'Средний', color: 'text-[#f5c842] border-[#f5c842]/30' },
  hard: { text: 'Сложный', color: 'text-[#e05567] border-[#e05567]/30' },
};

function CaseCard({ c, onOpen }) {
  const diff = DIFF_LABELS[c.difficulty] || { text: c.difficulty, color: 'text-[#5c6e98] border-[#5c6e98]/30' };

  return (
    <div
      className="bg-[#0b1226] border border-white/[0.06] p-5 hover:border-[#4a80f5]/40 transition-all cursor-pointer group"
      onClick={() => onOpen(c)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-1 ${diff.color}`}>
          {diff.text}
        </span>
        {c.is_solved && (
          <span className="font-mono text-[9px] text-[#4fc97e]">✓ решён</span>
        )}
      </div>

      <h3 className="font-serif text-[15px] text-[#dce8ff] leading-snug mb-2 group-hover:text-white transition-colors">
        {c.title}
      </h3>

      <p className="font-serif text-[13px] text-[#5c6e98] leading-relaxed line-clamp-2 mb-4">
        {c.description}
      </p>

      <div className="flex items-center justify-between text-[#3a4a6a] font-mono text-[10px]">
        <span>{c.author?.display_name || c.author?.username || 'Аноним'}</span>
        {c.accuracy !== null && c.accuracy !== undefined && (
          <span>{c.accuracy}% верных</span>
        )}
      </div>
    </div>
  );
}

function CaseModal({ c, onClose }) {
  const { user } = useAuthStore();
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getCase(c.id)
      .then(data => { setFull(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [c.id]);

  async function handleAnswer() {
    if (!selected || answering) return;
    setAnswering(true);
    try {
      const res = await api.answerCase(c.id, selected);
      setResult(res);
      // Обновляем варианты с объяснениями
      if (res.all_options) {
        setFull(f => ({ ...f, options: res.all_options }));
      }
    } finally {
      setAnswering(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 pt-12 sm:pt-16 overflow-y-auto" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl bg-[#0b1226] border border-white/[0.08] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 font-mono text-[#3a4a6a] hover:text-[#dce8ff] text-lg transition-colors z-10 w-9 h-9 flex items-center justify-center"
        >
          ✕
        </button>

        {loading ? (
          <div className="p-8 text-center font-mono text-[12px] text-[#3a4a6a]">Загрузка...</div>
        ) : !full ? (
          <div className="p-8 text-center font-mono text-[12px] text-[#e05567]">Ошибка загрузки</div>
        ) : (
          <div className="p-4 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              {DIFF_LABELS[full.difficulty] && (
                <span className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-1 ${DIFF_LABELS[full.difficulty].color}`}>
                  {DIFF_LABELS[full.difficulty].text}
                </span>
              )}
              <span className="font-mono text-[10px] text-[#3a4a6a]">
                {full.author?.display_name || full.author?.username}
              </span>
            </div>

            <h2 className="font-serif text-2xl text-[#dce8ff] mb-4">{full.title}</h2>
            <p className="font-serif text-[15px] text-[#a8b8d8] leading-relaxed mb-6 whitespace-pre-wrap">{full.description}</p>

            {full.image_url && (
              <img src={full.image_url} alt="" className="w-full max-h-60 object-cover mb-6 border border-white/[0.06]" />
            )}

            {full.options && full.options.length > 0 && (
              <div className="space-y-2 mb-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#5c6e98] mb-3">Выбери диагноз:</p>
                {full.options.map(opt => {
                  const isSelected = selected === opt.id;
                  const isCorrect = result && opt.is_correct;
                  const isWrong = result && !opt.is_correct && selected === opt.id;

                  let cls = 'border border-white/[0.06] bg-[#050918] text-[#a8b8d8] hover:border-[#4a80f5]/50 hover:text-[#dce8ff]';
                  if (isCorrect) cls = 'border-[#4fc97e]/60 bg-[#4fc97e]/5 text-[#4fc97e]';
                  else if (isWrong) cls = 'border-[#e05567]/60 bg-[#e05567]/5 text-[#e05567]';
                  else if (isSelected && !result) cls = 'border-[#4a80f5]/60 bg-[#4a80f5]/8 text-[#dce8ff]';

                  return (
                    <button
                      key={opt.id}
                      onClick={() => !result && setSelected(opt.id)}
                      disabled={!!result}
                      className={`w-full text-left px-4 py-3 font-serif text-[14px] transition-all ${cls} ${!result ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className="font-mono text-[11px] mr-3 opacity-60">{opt.letter}.</span>
                      {opt.text}
                      {opt.explanation && result && (
                        <p className="mt-1 font-mono text-[11px] opacity-70">{opt.explanation}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {result && (
              <div className={`px-4 py-3 mb-4 border font-serif text-[14px] ${result.is_correct ? 'border-[#4fc97e]/30 bg-[#4fc97e]/5 text-[#4fc97e]' : 'border-[#e05567]/30 bg-[#e05567]/5 text-[#e05567]'}`}>
                {result.is_correct ? '✓ Верно!' : '✗ Неверно'}
                {result.explanation && <p className="mt-1 font-mono text-[12px] opacity-80">{result.explanation}</p>}
              </div>
            )}

            {!result && full.options && full.options.length > 0 && (
              user ? (
                <button
                  onClick={handleAnswer}
                  disabled={!selected || answering}
                  className="w-full bg-[#4a80f5] text-white font-mono text-[11px] uppercase tracking-widest py-3.5 hover:bg-[#6a97f7] transition-colors disabled:opacity-40"
                >
                  {answering ? 'Проверяем...' : 'Ответить →'}
                </button>
              ) : (
                <p className="font-mono text-[12px] text-[#3a4a6a] text-center">
                  <Link to="/register" className="text-[#4a80f5] hover:underline">Зарегистрируйся</Link> или{' '}
                  <Link to="/login" className="text-[#4a80f5] hover:underline">войди</Link>, чтобы отвечать
                </p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiagnosPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [daily, setDaily] = useState(null);
  const [activeCase, setActiveCase] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getCases(difficulty, page).then(({ cases, total }) => {
      setCases(cases);
      setTotal(total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [difficulty, page]);

  useEffect(() => {
    api.getDailyCase().then(setDaily).catch(() => {});
  }, []);

  function changeDifficulty(val) {
    setDifficulty(val);
    setPage(1);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <SectionTabs />
      {/* Hero */}
      <div className="mb-8 md:mb-12">
        <p className="font-mono text-[10px] md:text-[11px] text-[#4a80f5] uppercase tracking-widest mb-2 md:mb-3">Диагноз</p>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-bold leading-none mb-3 md:mb-5 text-[#dce8ff]">
          Поставь<br /><em className="text-[#7eb8f8]">правильный</em><br />диагноз
        </h1>
        <p className="font-serif italic text-[#5c6e98] text-base md:text-lg max-w-lg">
          Реальные клинические случаи для врачей и студентов-медиков
        </p>
      </div>

      {/* Случай дня */}
      {daily && (
        <div
          className="mb-10 border border-[#4a80f5]/25 bg-[#4a80f5]/5 p-6 cursor-pointer hover:border-[#4a80f5]/50 transition-all"
          onClick={() => setActiveCase(daily)}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#4a80f5] border border-[#4a80f5]/30 px-2 py-1">Случай дня</span>
          </div>
          <h3 className="font-serif text-xl text-[#dce8ff] mb-2">{daily.title}</h3>
          <p className="font-serif text-[14px] text-[#5c6e98] line-clamp-2">{daily.description}</p>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto scrollbar-none pb-1">
        {DIFFICULTIES.map(d => (
          <button
            key={d.value}
            onClick={() => changeDifficulty(d.value)}
            className={`font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 border transition-all shrink-0 min-h-[44px] ${
              difficulty === d.value
                ? 'border-[#4a80f5] text-[#4a80f5] bg-[#4a80f5]/8'
                : 'border-white/[0.06] text-[#5c6e98] hover:border-white/20 hover:text-[#dce8ff]'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Кейсы */}
      {loading ? (
        <div className="py-20 text-center font-mono text-[12px] text-[#3a4a6a]">Загрузка...</div>
      ) : cases.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-[12px] text-[#3a4a6a]">Кейсы ещё добавляются</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
          {cases.map(c => (
            <CaseCard key={c.id} c={c} onOpen={setActiveCase} />
          ))}
        </div>
      )}

      {/* Пагинация */}
      {total > 12 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="font-mono text-[11px] uppercase tracking-wider text-[#5c6e98] hover:text-[#dce8ff] disabled:opacity-30 transition-colors"
          >
            ← Назад
          </button>
          <span className="font-mono text-[11px] text-[#3a4a6a]">
            {page} / {Math.ceil(total / 12)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 12)}
            className="font-mono text-[11px] uppercase tracking-wider text-[#5c6e98] hover:text-[#dce8ff] disabled:opacity-30 transition-colors"
          >
            Вперёд →
          </button>
        </div>
      )}

      {/* Модалка */}
      {activeCase && <CaseModal c={activeCase} onClose={() => setActiveCase(null)} />}
    </div>
  );
}
