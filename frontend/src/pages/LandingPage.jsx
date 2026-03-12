import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '../components/Logo.jsx';

const CITIES = [
  {
    city: 'Москва',
    specialists: [
      { name: 'Иванова Елена Сергеевна', spec: 'Кардиолог', rating: 4.9, reviews: 128, phone: '+7 (495) 123-45-67', clinic: 'КБ «Кардиоцентр»' },
      { name: 'Петров Андрей Михайлович', spec: 'Невролог', rating: 4.7, reviews: 94, phone: '+7 (495) 987-65-43', clinic: 'МЦ «Нейромед»' },
    ],
  },
  {
    city: 'Санкт-Петербург',
    specialists: [
      { name: 'Смирнова Ольга Николаевна', spec: 'Онколог', rating: 4.8, reviews: 76, phone: '+7 (812) 345-67-89', clinic: 'ГКБ № 31' },
      { name: 'Козлов Дмитрий Алексеевич', spec: 'Хирург', rating: 4.6, reviews: 112, phone: '+7 (812) 456-78-90', clinic: 'КБ «СевМед»' },
    ],
  },
  {
    city: 'Новосибирск',
    specialists: [
      { name: 'Фёдорова Марина Игоревна', spec: 'Педиатр', rating: 5.0, reviews: 203, phone: '+7 (383) 211-30-05', clinic: 'Детская клиника «Здоровье»' },
      { name: 'Ларин Вячеслав Павлович', spec: 'Офтальмолог', rating: 4.7, reviews: 88, phone: '+7 (383) 299-41-17', clinic: 'Глазной центр «Визус»' },
    ],
  },
  {
    city: 'Екатеринбург',
    specialists: [
      { name: 'Морозова Светлана Борисовна', spec: 'Гастроэнтеролог', rating: 4.8, reviews: 61, phone: '+7 (343) 372-11-22', clinic: 'МЦ «Гастро+»' },
      { name: 'Белов Константин Юрьевич', spec: 'Эндокринолог', rating: 4.5, reviews: 79, phone: '+7 (343) 385-90-10', clinic: 'ЭМЦ «ДиаКлиник»' },
    ],
  },
  {
    city: 'Казань',
    specialists: [
      { name: 'Назарова Гузель Рашитовна', spec: 'Терапевт', rating: 4.9, reviews: 145, phone: '+7 (843) 291-03-44', clinic: 'ГКБ № 7' },
      { name: 'Хасанов Ренат Ильгизович', spec: 'Пульмонолог', rating: 4.6, reviews: 53, phone: '+7 (843) 264-58-30', clinic: 'КБ «ПульмоМед»' },
    ],
  },
  {
    city: 'Нижний Новгород',
    specialists: [
      { name: 'Орлова Юлия Валерьевна', spec: 'Ортопед', rating: 4.7, reviews: 99, phone: '+7 (831) 433-22-11', clinic: 'Травмцентр «КостиПлюс»' },
      { name: 'Громов Иван Александрович', spec: 'Дерматолог', rating: 4.8, reviews: 117, phone: '+7 (831) 422-76-55', clinic: 'Клиника кожи «Дерма»' },
    ],
  },
  {
    city: 'Ростов-на-Дону',
    specialists: [
      { name: 'Захарченко Нина Степановна', spec: 'Уролог', rating: 4.5, reviews: 68, phone: '+7 (863) 244-50-90', clinic: 'УроЦентр «Меркурий»' },
      { name: 'Воронов Сергей Геннадьевич', spec: 'Кардиолог', rating: 4.9, reviews: 155, phone: '+7 (863) 255-33-88', clinic: 'ЧЛБ «СердцеДон»' },
    ],
  },
  {
    city: 'Самара',
    specialists: [
      { name: 'Тихонова Анастасия Петровна', spec: 'Невролог', rating: 4.8, reviews: 82, phone: '+7 (846) 333-17-00', clinic: 'НКЦ «НейроВолга»' },
      { name: 'Баранов Михаил Станиславович', spec: 'Психиатр', rating: 4.6, reviews: 44, phone: '+7 (846) 278-90-65', clinic: 'МЦ «ПсиМед»' },
    ],
  },
  {
    city: 'Уфа',
    specialists: [
      { name: 'Гильманова Лилия Рамазановна', spec: 'Ревматолог', rating: 4.7, reviews: 57, phone: '+7 (347) 246-01-33', clinic: 'РККБ им. Куватова' },
      { name: 'Юсупов Айрат Фаридович', spec: 'Нефролог', rating: 4.9, reviews: 72, phone: '+7 (347) 255-44-22', clinic: 'МЦ «НефроУфа»' },
    ],
  },
  {
    city: 'Омск',
    specialists: [
      { name: 'Степанова Валентина Николаевна', spec: 'Гематолог', rating: 4.8, reviews: 38, phone: '+7 (381) 274-11-56', clinic: 'ОГКБ № 1' },
      { name: 'Чернов Алексей Владимирович', spec: 'Инфекционист', rating: 4.7, reviews: 63, phone: '+7 (381) 266-88-09', clinic: 'ГКБ «ИнфоМед»' },
    ],
  },
];

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= full ? '#facc15' : (i === full + 1 && half ? 'url(#half)' : 'none')}
          stroke={i <= full || (i === full + 1 && half) ? '#facc15' : '#2a3a60'}
          strokeWidth="1.5"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span className="text-xs text-[#7ab4ff] ml-1.5 font-mono">{rating}</span>
    </div>
  );
}

const FACTS = [
  { tag: 'Кардиология', text: 'Сердце человека бьётся ~100 000 раз в сутки и перекачивает около 7 500 литров крови' },
  { tag: 'Нейронаука', text: 'Нейроны передают импульсы со скоростью до 120 м/с — быстрее большинства гоночных автомобилей' },
  { tag: 'Анатомия', text: 'Бедренная кость прочнее бетона: она выдерживает нагрузку свыше 1 700 килограммов' },
  { tag: 'Иммунология', text: 'Иммунная система ежедневно обезвреживает тысячи потенциально злокачественных клеток' },
  { tag: 'Генетика', text: 'Геном человека содержит ~3 млрд пар нуклеотидов — объём, равный 200 томам по 1 000 страниц' },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10H12z" />
        <path d="M12 2v10l6.5 3.5" />
      </svg>
    ),
    title: 'Диагнозы',
    desc: 'Клинические случаи трёх уровней сложности. Тренируй диагностическое мышление на реальных историях болезни',
    accent: '#4a80f5',
    bg: 'from-blue-600/10 to-transparent',
    border: 'border-blue-500/20 hover:border-blue-500/40',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Лента',
    desc: 'Сообщество врачей и студентов. Статьи, дискуссии, клинические находки от практикующих специалистов',
    accent: '#7c3aed',
    bg: 'from-purple-600/10 to-transparent',
    border: 'border-purple-500/20 hover:border-purple-500/40',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M16 2v6M8 2v6M2 10h20" />
      </svg>
    ),
    title: 'Карточки',
    desc: 'Флеш-карточки по анатомии, физиологии, фармакологии и синдромам с латинскими терминами',
    accent: '#0d9488',
    bg: 'from-teal-600/10 to-transparent',
    border: 'border-teal-500/20 hover:border-teal-500/40',
  },
];

function SpecialistsSection() {
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const { specialists } = CITIES[activeCityIdx];

  return (
    <section className="relative z-10 px-6 md:px-12 pb-20 max-w-5xl mx-auto">
      {/* Divider */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#2a3a50]">
          Специалисты вашего города
        </span>
        <div className="flex-1 h-px bg-white/[0.04]" />
      </div>

      {/* City chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CITIES.map((c, i) => (
          <button
            key={c.city}
            onClick={() => setActiveCityIdx(i)}
            className={`font-mono text-[11px] uppercase tracking-wider px-3.5 py-1.5 border transition-all duration-200 ${
              i === activeCityIdx
                ? 'border-[#4a80f5] text-[#7ab4ff] bg-[#4a80f5]/10'
                : 'border-white/[0.06] text-[#3a4a6a] hover:border-[#4a80f5]/40 hover:text-[#5c6e98]'
            }`}
          >
            {c.city}
          </button>
        ))}
      </div>

      {/* Specialist cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {specialists.map(s => (
          <div
            key={s.name}
            className="border border-white/[0.06] bg-white/[0.025] p-5 hover:border-[#4a80f5]/30 transition-all duration-300"
          >
            {/* Spec tag */}
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a80f5] mb-3 block">
              {s.spec}
            </span>

            {/* Name */}
            <h4 className="text-[#dce8ff] font-semibold text-sm mb-1.5 leading-snug">
              {s.name}
            </h4>

            {/* Clinic */}
            <p className="text-[#3a4a6a] text-xs mb-3">{s.clinic}</p>

            {/* Stars + reviews */}
            <div className="flex items-center justify-between mb-4">
              <Stars rating={s.rating} />
              <span className="text-[10px] font-mono text-[#2a3a60]">{s.reviews} отзывов</span>
            </div>

            {/* Phone */}
            <a
              href={`tel:${s.phone.replace(/\D/g, '')}`}
              className="flex items-center gap-2 text-xs text-[#5c6e98] hover:text-[#7ab4ff] transition-colors group"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#7ab4ff]">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {s.phone}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [factIdx, setFactIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFactIdx(i => (i + 1) % FACTS.length);
        setVisible(true);
      }, 380);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#050918] text-[#dce8ff] overflow-x-hidden">
      {/* Background glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-8%] w-[700px] h-[700px] rounded-full bg-blue-700/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-700/[0.06] blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-red-700/[0.04] blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="font-bold text-[#dce8ff] text-lg tracking-wide">
            Анам<span className="text-[#4a80f5]">нез</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="font-mono text-[11px] uppercase tracking-widest text-[#5c6e98] hover:text-[#dce8ff] transition-colors px-4 py-2"
          >
            Войти
          </Link>
          <Link
            to="/register"
            className="font-mono text-[11px] uppercase tracking-widest bg-[#4a80f5] text-white px-5 py-2.5 hover:bg-[#6a97f7] transition-colors"
          >
            Начать →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Large logo mark */}
        <div className="mb-8 drop-shadow-[0_0_40px_rgba(74,128,245,0.35)]">
          <LogoMark size={88} />
        </div>

        {/* Title */}
        <h1 className="text-[clamp(2.8rem,9vw,5.5rem)] font-extrabold tracking-tight leading-none mb-4">
          Анам<span className="text-[#4a80f5]">нез</span>
        </h1>

        <p className="text-[#5c6e98] text-base md:text-lg font-light max-w-sm mb-12 leading-relaxed">
          Медицинская образовательная платформа для врачей, студентов и преподавателей
        </p>

        {/* Rotating fact */}
        <div className="max-w-lg w-full mb-10">
          <div
            className={`border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm px-6 py-5 text-left transition-all duration-300 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a80f5] block mb-2.5">
              {FACTS[factIdx].tag}
            </span>
            <p className="text-[#c8d8f8] text-sm leading-relaxed">
              {FACTS[factIdx].text}
            </p>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-1.5 mt-3 justify-center">
            {FACTS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setFactIdx(i); setVisible(true); }, 200); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === factIdx ? 'bg-[#4a80f5] w-5' : 'bg-white/20 w-1.5 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/register"
            className="font-mono text-[12px] uppercase tracking-widest bg-[#4a80f5] text-white px-8 py-4 hover:bg-[#6a97f7] transition-colors"
          >
            Зарегистрироваться бесплатно
          </Link>
          <Link
            to="/login"
            className="font-mono text-[12px] uppercase tracking-widest border border-[#2a3a60] text-[#5c6e98] px-8 py-4 hover:border-[#4a80f5] hover:text-[#4a80f5] transition-all"
          >
            Уже есть аккаунт
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10 flex items-center gap-4 px-6 md:px-12 max-w-5xl mx-auto mb-10">
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#2a3a50]">Что внутри</span>
        <div className="flex-1 h-px bg-white/[0.04]" />
      </div>

      {/* Features grid */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className={`bg-gradient-to-br ${f.bg} border ${f.border} p-4 md:p-7 transition-all duration-300 group`}
            >
              <div className="mb-5" style={{ color: f.accent }}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-base mb-2.5" style={{ color: f.accent }}>
                {f.title}
              </h3>
              <p className="text-[#4a5a7a] text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6">
          {[
            { value: '100+', label: 'клинических случаев' },
            { value: '3', label: 'уровня сложности' },
            { value: '∞', label: 'медицинских карточек' },
          ].map(s => (
            <div key={s.label} className="border border-white/[0.04] bg-white/[0.01] p-4 md:p-5 text-center flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 justify-center sm:justify-start">
              <div className="text-2xl font-bold text-[#4a80f5] mb-1">{s.value}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#3a4a6a]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Specialists */}
      <SpecialistsSection />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 py-5 text-center">
        <p className="font-mono text-[10px] text-[#1e2a3a] uppercase tracking-widest">
          © 2025 Анамнез · Медицинское образование нового поколения
        </p>
      </footer>
    </div>
  );
}
