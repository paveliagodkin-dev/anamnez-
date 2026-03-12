import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const SECTION_TABS = [
  { to: '/feed', label: 'Лента' },
  { to: '/diagnoz', label: 'Клинические случаи' },
  { to: '/cards', label: 'Карточки' },
  { to: '/slovar', label: 'Словарь' },
  { to: '/specialists', label: 'Специалисты' },
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

const CITIES = [
  {
    city: 'Краснодар',
    specialists: [
      { name: 'Полянская Елена Геннадьевна', spec: 'Кардиолог, терапевт', rating: 4.8, reviews: 112, phone: '+7 (861) 299-35-46', clinic: 'Клиника «Клиницист», ул. Ставропольская, 223' },
      { name: 'Нижельский Сергей Александрович', spec: 'Кардиолог-аритмолог', rating: 4.9, reviews: 183, phone: '+7 (861) 202-02-02', clinic: 'Клиника «Екатерининская», Кубанская набережная, 37/1' },
    ],
  },
  {
    city: 'Армавир',
    specialists: [
      { name: 'Штамонетян Арменак Арутюнович', spec: 'Кардиолог, функциональный диагност', rating: 4.7, reviews: 63, phone: '+7 (86137) 6-37-99', clinic: 'МЦ «Лекарь», ул. Энгельса, 27/1' },
      { name: 'Холоденин Юрий Павлович', spec: 'Невролог', rating: 5.0, reviews: 44, phone: '+7 (86137) 63-8-60', clinic: 'МЦ «Мой доктор», ул. Кирова, 57А' },
    ],
  },
  {
    city: 'Майкоп',
    specialists: [
      { name: 'Колесова Ольга Анатольевна', spec: 'Невролог', rating: 4.8, reviews: 79, phone: '+7 (965) 472-59-74', clinic: 'Клиника «Эксперт», Майкоп' },
      { name: 'Барчо Аза Аскеровна', spec: 'Невролог', rating: 4.9, reviews: 98, phone: '+7 (8772) 57-99-66', clinic: 'МЦ «Гиппократ», ул. Чкалова, 63А' },
    ],
  },
  {
    city: 'Лабинск',
    specialists: [
      { name: 'Державина Ирина Михайловна', spec: 'Невролог', rating: 4.8, reviews: 52, phone: '+7 (918) 158-49-28', clinic: 'МЦ «Эскулап», ул. Константинова, 9' },
      { name: 'Гранкина Рената Валерьевна', spec: 'Терапевт, кардиолог', rating: 4.9, reviews: 44, phone: '+7 (861) 693-15-29', clinic: 'РЦ «Нейрон», Лабинск' },
    ],
  },
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
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= full ? '#facc15' : 'none'}
          stroke={i <= full ? '#facc15' : '#2a3a60'}
          strokeWidth="1.5"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
      <span className="text-xs text-[#7ab4ff] ml-1.5 font-mono">{rating}</span>
    </div>
  );
}

export default function SpecialistsPage() {
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const { specialists } = CITIES[activeCityIdx];

  return (
    <div className="min-h-screen bg-[#050918] text-[#dce8ff] pb-20">
      {/* Header */}
      <div className="border-b border-white/[0.05] px-5 md:px-12 py-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#4a80f5] mb-1">
          Рекомендованные врачи · 14 городов России
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#dce8ff] tracking-tight mb-1">
          Специалисты вашего города
        </h1>
        <p className="text-[#3a4a6a] text-sm">
          {CITIES.length} городов · {CITIES.reduce((acc, c) => acc + c.specialists.length, 0)} специалистов
        </p>
      </div>

      <div className="px-5 md:px-12 mt-6 max-w-5xl mx-auto">
        <SectionTabs />

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
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a80f5] mb-3 block">
                {s.spec}
              </span>
              <h4 className="text-[#dce8ff] font-semibold text-sm mb-1.5 leading-snug">
                {s.name}
              </h4>
              <p className="text-[#3a4a6a] text-xs mb-3">{s.clinic}</p>
              <div className="flex items-center justify-between mb-4">
                <Stars rating={s.rating} />
                <span className="text-[10px] font-mono text-[#2a3a60]">{s.reviews} отзывов</span>
              </div>
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
      </div>
    </div>
  );
}
