import { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';

const SECTION_TABS = [
  { to: '/feed', label: 'Лента' },
  { to: '/diagnoz', label: 'Клинические случаи' },
  { to: '/cards', label: 'Карточки' },
];

function SectionTabs() {
  return (
    <div className="flex gap-1 mb-8 border-b border-white/[0.06] pb-0">
      {SECTION_TABS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `font-mono text-[11px] uppercase tracking-widest px-4 py-2.5 border-b-2 -mb-px transition-colors ${
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

const CAT_STYLE = {
  'Анатомия':     { accent: '#4a80f5', bg: 'rgba(74,128,245,0.08)',  border: 'rgba(74,128,245,0.3)'  },
  'Физиология':   { accent: '#4fc97e', bg: 'rgba(79,201,126,0.08)',  border: 'rgba(79,201,126,0.3)'  },
  'Синдромы':     { accent: '#e05567', bg: 'rgba(224,85,103,0.08)',  border: 'rgba(224,85,103,0.3)'  },
  'Фармакология': { accent: '#f5a85a', bg: 'rgba(245,168,90,0.08)',  border: 'rgba(245,168,90,0.3)'  },
  'Диагностика':  { accent: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.3)' },
};

const CARDS = [
  // ── АНАТОМИЯ ────────────────────────────────────────────────────────────────
  {
    id: 1, category: 'Анатомия',
    latin: 'Cor', translation: 'Сердце',
    description: 'Полый мышечный орган, обеспечивающий непрерывный ток крови по сосудам. Расположен в средостении. Масса 250–350 г.',
    example: 'Cor pulmonale — лёгочное сердце (гипертрофия правого желудочка при лёгочной гипертензии)',
  },
  {
    id: 2, category: 'Анатомия',
    latin: 'Pulmo', translation: 'Лёгкое',
    description: 'Парный паренхиматозный орган дыхательной системы. Правое лёгкое делится на три доли, левое — на две.',
    example: 'Pneumonia — воспаление лёгочной паренхимы. Oedema pulmonum — отёк лёгких.',
  },
  {
    id: 3, category: 'Анатомия',
    latin: 'Hepar', translation: 'Печень',
    description: 'Самая крупная железа организма (1200–1500 г). Участвует в пищеварении, обезвреживании, синтезе белков и желчи.',
    example: 'Hepatitis — воспаление печени. Cirrhosis hepatis — цирроз печени.',
  },
  {
    id: 4, category: 'Анатомия',
    latin: 'Ren', translation: 'Почка',
    description: 'Парный орган мочевыделительной системы бобовидной формы. Расположен в забрюшинном пространстве.',
    example: 'Nephritis — воспаление почки. Nephrolithiasis — мочекаменная болезнь.',
  },
  {
    id: 5, category: 'Анатомия',
    latin: 'Cerebrum', translation: 'Головной мозг',
    description: 'Центральный орган нервной системы, расположенный в полости черепа. Масса 1200–1400 г.',
    example: 'Ischaemia cerebri — ишемия мозга. Contusio cerebri — ушиб мозга.',
  },
  {
    id: 6, category: 'Анатомия',
    latin: 'Medulla spinalis', translation: 'Спинной мозг',
    description: 'Часть ЦНС, расположенная в позвоночном канале. Обеспечивает рефлекторную и проводниковую функции.',
    example: 'Transectio medullae spinalis — поперечное пересечение спинного мозга.',
  },
  {
    id: 7, category: 'Анатомия',
    latin: 'Aorta', translation: 'Аорта',
    description: 'Главный артериальный ствол большого круга кровообращения, отходящий от левого желудочка.',
    example: 'Aneurysma aortae — аневризма аорты. Stenosis aortae — стеноз аортального клапана.',
  },
  {
    id: 8, category: 'Анатомия',
    latin: 'Arteria carotis', translation: 'Сонная артерия',
    description: 'Основная артерия, кровоснабжающая голову и шею. Делится на общую, внутреннюю и наружную ветви.',
    example: 'Stenosis arteriae carotidis — сужение сонной артерии; частая причина ишемического инсульта.',
  },
  {
    id: 9, category: 'Анатомия',
    latin: 'Vena cava', translation: 'Полая вена',
    description: 'Крупнейшие вены большого круга кровообращения: верхняя (superior) и нижняя (inferior), впадающие в правое предсердие.',
    example: 'Thrombosis venae cavae inferioris — тромбоз нижней полой вены.',
  },
  {
    id: 10, category: 'Анатомия',
    latin: 'Nervus vagus', translation: 'Блуждающий нерв',
    description: 'X пара черепных нервов. Иннервирует органы шеи, грудной клетки и брюшной полости. Замедляет ЧСС.',
    example: 'Vagotomia — пересечение блуждающего нерва для снижения желудочной секреции.',
  },
  {
    id: 11, category: 'Анатомия',
    latin: 'Diaphragma', translation: 'Диафрагма',
    description: 'Куполообразная мышечно-сухожильная пластина, разделяющая грудную и брюшную полости. Главная дыхательная мышца.',
    example: 'Hernia diaphragmatica — грыжа диафрагмы (выход органов брюшной полости в грудную).',
  },
  {
    id: 12, category: 'Анатомия',
    latin: 'Peritoneum', translation: 'Брюшина',
    description: 'Серозная оболочка, выстилающая стенки брюшной полости и покрывающая большинство органов живота.',
    example: 'Peritonitis — воспаление брюшины; хирургическая экстренность.',
  },

  // ── ФИЗИОЛОГИЯ ──────────────────────────────────────────────────────────────
  {
    id: 13, category: 'Физиология',
    latin: 'Systole', translation: 'Систола',
    description: 'Фаза сокращения миокарда желудочков, во время которой кровь выбрасывается в аорту и лёгочный ствол.',
    example: 'Артериальное давление 120/80: 120 — систолическое (systolica), 80 — диастолическое.',
  },
  {
    id: 14, category: 'Физиология',
    latin: 'Diastole', translation: 'Диастола',
    description: 'Фаза расслабления миокарда, во время которой полости сердца заполняются кровью.',
    example: 'При диастолической дисфункции нарушено наполнение левого желудочка.',
  },
  {
    id: 15, category: 'Физиология',
    latin: 'Homeostasis', translation: 'Гомеостаз',
    description: 'Поддержание постоянства физиологических параметров внутренней среды организма (pH, температура, осмолярность).',
    example: 'Нарушение гомеостаза — основа большинства патологических состояний.',
  },
  {
    id: 16, category: 'Физиология',
    latin: 'Metabolismus', translation: 'Метаболизм',
    description: 'Совокупность биохимических реакций обмена веществ в организме. Делится на катаболизм и анаболизм.',
    example: 'Metabolismus basalis — основной обмен (энергозатраты в состоянии покоя).',
  },
  {
    id: 17, category: 'Физиология',
    latin: 'Reflexus', translation: 'Рефлекс',
    description: 'Закономерная реакция организма на раздражение, осуществляемая при участии нервной системы через рефлекторную дугу.',
    example: 'Reflexus rotularis (коленный рефлекс) — пример безусловного сухожильного рефлекса.',
  },
  {
    id: 18, category: 'Физиология',
    latin: 'Haemostasis', translation: 'Гемостаз',
    description: 'Совокупность механизмов остановки кровотечения: сосудисто-тромбоцитарный и коагуляционный.',
    example: 'Нарушение гемостаза при гемофилии приводит к неконтролируемым кровотечениям.',
  },
  {
    id: 19, category: 'Физиология',
    latin: 'Immunitas', translation: 'Иммунитет',
    description: 'Способность организма распознавать и нейтрализовать чужеродные агенты. Бывает врождённым и приобретённым.',
    example: 'Immunodeficientia — иммунодефицит. Autoimmunitas — аутоиммунная реакция.',
  },
  {
    id: 20, category: 'Физиология',
    latin: 'Respiratio', translation: 'Дыхание',
    description: 'Совокупность процессов, обеспечивающих поступление кислорода и выведение углекислого газа. Частота в норме: 16–18/мин.',
    example: 'Apnoea — остановка дыхания. Dyspnoea — одышка (нарушение частоты или глубины).',
  },

  // ── СИНДРОМЫ ─────────────────────────────────────────────────────────────────
  {
    id: 21, category: 'Синдромы',
    latin: 'Angina pectoris', translation: 'Стенокардия',
    description: 'Приступообразные боли за грудиной из-за временной ишемии миокарда. Возникают при нагрузке или покое.',
    example: 'Angina pectoris stabilis — стабильная стенокардия; unstabilis — нестабильная (признак ОКС).',
  },
  {
    id: 22, category: 'Синдромы',
    latin: 'Infarctus myocardii', translation: 'Инфаркт миокарда',
    description: 'Острый некроз участка сердечной мышцы вследствие прекращения коронарного кровотока. Ведущая причина смертности.',
    example: 'Сопровождается подъёмом ST на ЭКГ, повышением тропонина I/T.',
  },
  {
    id: 23, category: 'Синдромы',
    latin: 'Cor pulmonale', translation: 'Лёгочное сердце',
    description: 'Гипертрофия и дилатация правого желудочка вследствие лёгочной гипертензии, вызванной болезнями лёгких.',
    example: 'Acutum (острое) — при ТЭЛА; chronicum (хроническое) — при ХОБЛ.',
  },
  {
    id: 24, category: 'Синдромы',
    latin: 'Pneumonia', translation: 'Пневмония',
    description: 'Острое инфекционное воспаление лёгочной паренхимы с экссудацией в альвеолы. Возбудители: бактерии, вирусы, грибы.',
    example: 'Pneumonia lobaris — долевая (крупозная) пневмония. Pneumonia focalis — очаговая.',
  },
  {
    id: 25, category: 'Синдромы',
    latin: 'Hepatitis', translation: 'Гепатит',
    description: 'Воспаление печени. По этиологии: вирусный (A, B, C, D, E), токсический, аутоиммунный, алкогольный.',
    example: 'Hepatitis chronica — хронический гепатит (>6 мес.); может переходить в цирроз.',
  },
  {
    id: 26, category: 'Синдромы',
    latin: 'Nephritis', translation: 'Нефрит',
    description: 'Воспаление почечной ткани. Гломерулонефрит — поражение клубочков; пиелонефрит — чашечно-лоханочной системы.',
    example: 'Glomerulonephritis acuta poststreptococcica — острый постстрептококковый гломерулонефрит.',
  },
  {
    id: 27, category: 'Синдромы',
    latin: 'Diabetes mellitus', translation: 'Сахарный диабет',
    description: 'Хроническое нарушение углеводного обмена с гипергликемией. Тип 1 — аутоиммунный; тип 2 — инсулинорезистентность.',
    example: 'Coma diabetica — диабетическая кома. Retinopathia diabetica — поражение сетчатки.',
  },
  {
    id: 28, category: 'Синдромы',
    latin: 'Hypertensio arterialis', translation: 'Артериальная гипертензия',
    description: 'Стойкое повышение АД ≥ 140/90 мм рт. ст. Поражает сосуды, сердце, почки, головной мозг.',
    example: 'Crisis hypertonica — гипертонический криз. Hypertensio essentialis — первичная гипертензия.',
  },
  {
    id: 29, category: 'Синдромы',
    latin: 'Insufficientia cordis', translation: 'Сердечная недостаточность',
    description: 'Неспособность сердца обеспечить адекватный сердечный выброс при нормальном давлении наполнения.',
    example: 'Insufficientia cordis congestiva — застойная сердечная недостаточность с отёками.',
  },
  {
    id: 30, category: 'Синдромы',
    latin: 'Meningitis', translation: 'Менингит',
    description: 'Воспаление мозговых оболочек. Характерна триада: лихорадка, головная боль, менингеальные симптомы.',
    example: 'Meningitis purulenta — гнойный менингит (часто менингококк). Meningitis serosa — серозный.',
  },

  // ── ФАРМАКОЛОГИЯ ────────────────────────────────────────────────────────────
  {
    id: 31, category: 'Фармакология',
    latin: 'Analgesia', translation: 'Обезболивание',
    description: 'Устранение болевого ощущения без утраты сознания. Препараты: опиоиды, НПВС, местные анестетики.',
    example: 'Analgesia epiduralis — эпидуральная анальгезия при родах и оперативных вмешательствах.',
  },
  {
    id: 32, category: 'Фармакология',
    latin: 'Antibioticum', translation: 'Антибиотик',
    description: 'Вещество биологического или синтетического происхождения, подавляющее рост бактерий или убивающее их.',
    example: 'Antibiotica beta-lactamica — пенициллины, цефалоспорины. Macrolida — макролиды.',
  },
  {
    id: 33, category: 'Фармакология',
    latin: 'Diureticum', translation: 'Диуретик (мочегонное)',
    description: 'Препарат, усиливающий выведение мочи за счёт угнетения реабсорбции в почечных канальцах.',
    example: 'Furosemidum — петлевой диуретик. Spironolactonum — калийсберегающий (антагонист альдостерона).',
  },
  {
    id: 34, category: 'Фармакология',
    latin: 'Anticoagulans', translation: 'Антикоагулянт',
    description: 'Препарат, тормозящий свёртывание крови. Применяют при тромбозах, ТЭЛА, фибрилляции предсердий.',
    example: 'Heparina — гепарин (прямой). Warfarinum — варфарин (непрямой, антагонист витамина K).',
  },
  {
    id: 35, category: 'Фармакология',
    latin: 'Vasodilatator', translation: 'Вазодилататор',
    description: 'Средство, расширяющее просвет кровеносных сосудов и снижающее артериальное давление.',
    example: 'Nitroglycerinum — вазодилататор при стенокардии. Amlodipinum — блокатор кальциевых каналов.',
  },
  {
    id: 36, category: 'Фармакология',
    latin: 'Glucocorticoidum', translation: 'Глюкокортикоид',
    description: 'Гормон коры надпочечников или его синтетический аналог. Оказывает противовоспалительное и иммуносупрессивное действие.',
    example: 'Prednisolonum, Dexamethasonum. Применяют при астме, аутоиммунных болезнях, шоке.',
  },

  // ── ДИАГНОСТИКА ──────────────────────────────────────────────────────────────
  {
    id: 37, category: 'Диагностика',
    latin: 'Auscultatio', translation: 'Аускультация',
    description: 'Метод обследования: выслушивание звуков, возникающих в органах при их работе. Проводится стетоскопом или фонендоскопом.',
    example: 'Аускультация сердца — оценка тонов и шумов. Аускультация лёгких — дыхательные шумы.',
  },
  {
    id: 38, category: 'Диагностика',
    latin: 'Percussio', translation: 'Перкуссия',
    description: 'Метод обследования путём постукивания по поверхности тела для определения границ и плотности органов.',
    example: 'Percussio pulmonum — перкуссия лёгких для определения границ и выявления инфильтратов.',
  },
  {
    id: 39, category: 'Диагностика',
    latin: 'Palpatio', translation: 'Пальпация',
    description: 'Метод обследования ощупыванием для определения расположения, формы, размера и консистенции органов.',
    example: 'Palpatio abdominalis — пальпация живота для выявления болезненности и объёмных образований.',
  },
  {
    id: 40, category: 'Диагностика',
    latin: 'Anamnesis', translation: 'Анамнез',
    description: 'Совокупность сведений о пациенте и развитии болезни, собранных путём расспроса для постановки диагноза.',
    example: 'Anamnesis morbi — история болезни. Anamnesis vitae — история жизни (семья, условия труда).',
  },
  {
    id: 41, category: 'Диагностика',
    latin: 'Diagnosis', translation: 'Диагноз',
    description: 'Медицинское заключение о сущности болезни, основанное на данных обследования пациента.',
    example: 'Diagnosis differentialis — дифференциальный диагноз (исключение схожих заболеваний).',
  },
  {
    id: 42, category: 'Диагностика',
    latin: 'Prognosis', translation: 'Прогноз',
    description: 'Научно обоснованное предсказание дальнейшего течения и исхода болезни на основе диагноза.',
    example: 'Prognosis bona — благоприятный прогноз. Prognosis infausta — неблагоприятный прогноз.',
  },
];

const CATEGORIES = ['Все', ...Object.keys(CAT_STYLE)];

export default function CardsPage() {
  const [category, setCategory] = useState('Все');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());

  const filtered = useMemo(
    () => (category === 'Все' ? CARDS : CARDS.filter(c => c.category === category)),
    [category]
  );

  const card = filtered[index];
  const colors = CAT_STYLE[card?.category] || CAT_STYLE['Анатомия'];
  const progress = Math.round(((index + 1) / filtered.length) * 100);

  function selectCategory(cat) {
    setCategory(cat);
    setIndex(0);
    setFlipped(false);
  }

  function goNext() {
    if (index < filtered.length - 1) {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  }

  function goPrev() {
    if (index > 0) {
      setIndex(i => i - 1);
      setFlipped(false);
    }
  }

  function toggleKnown() {
    setKnown(s => {
      const n = new Set(s);
      if (n.has(card.id)) n.delete(card.id); else n.add(card.id);
      return n;
    });
  }

  function shuffle() {
    setIndex(Math.floor(Math.random() * filtered.length));
    setFlipped(false);
  }

  if (!card) return null;

  const knownInCategory = filtered.filter(c => known.has(c.id)).length;

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <SectionTabs />
      </div>
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="mb-7 text-center">
          <h1 className="font-sans text-lg font-semibold text-[#dce8ff] tracking-wide mb-1">
            Карточки
          </h1>
          <p className="font-mono text-[10px] text-[#3a4a6a] uppercase tracking-widest">
            Медицинская латынь · {CARDS.length} терминов
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={`shrink-0 font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-all ${
                category === cat
                  ? 'border-[#4a80f5] text-[#4a80f5] bg-[#4a80f5]/10'
                  : 'border-white/[0.07] text-[#3a4a6a] hover:text-[#5c6e98] hover:border-white/[0.14]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Progress bar + counter */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-[#3a4a6a]">
            {index + 1} / {filtered.length}
          </span>
          {knownInCategory > 0 && (
            <span className="font-mono text-[10px] text-[#4fc97e]">
              {knownInCategory} изучено
            </span>
          )}
        </div>
        <div className="w-full h-px bg-white/[0.06] mb-5">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progress}%`, background: colors.accent }}
          />
        </div>

        {/* Flip card */}
        <div
          className="flip-container w-full cursor-pointer mb-5 select-none"
          style={{ height: '300px' }}
          onClick={() => setFlipped(f => !f)}
        >
          <div className={`flip-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}>

            {/* Front */}
            <div
              className="flip-face absolute inset-0 border flex flex-col"
              style={{ background: '#0b1226', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div
                className="px-5 py-3.5 border-b flex items-center justify-between"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <span
                  className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border"
                  style={{ color: colors.accent, borderColor: colors.border, background: colors.bg }}
                >
                  {card.category}
                </span>
                {known.has(card.id) && (
                  <span className="font-mono text-[10px] text-[#4fc97e]">✓ изучено</span>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#2a3a60] mb-5">
                  Латинский термин
                </p>
                <h2 className="font-sans text-[2.2rem] font-light text-[#dce8ff] tracking-wide leading-none">
                  {card.latin}
                </h2>
              </div>

              <div className="py-3.5 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <span className="font-mono text-[9px] text-[#1e2d4a] uppercase tracking-widest">
                  нажмите чтобы перевернуть
                </span>
              </div>
            </div>

            {/* Back */}
            <div
              className="flip-back absolute inset-0 border flex flex-col overflow-hidden"
              style={{ background: '#0b1226', borderColor: colors.border }}
            >
              <div
                className="px-5 py-3.5 border-b flex items-center gap-3"
                style={{ borderColor: `${colors.accent}20` }}
              >
                <span
                  className="font-mono text-[9px] uppercase tracking-widest"
                  style={{ color: colors.accent }}
                >
                  {card.category}
                </span>
                <span className="font-mono text-[9px] text-[#2a3a60]">{card.latin}</span>
              </div>

              <div className="flex-1 px-6 py-4 overflow-y-auto">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#2a3a60] mb-2.5">
                  Перевод
                </p>
                <h2
                  className="font-sans text-[1.7rem] font-medium leading-tight mb-4"
                  style={{ color: colors.accent }}
                >
                  {card.translation}
                </h2>
                <p className="font-sans text-[12.5px] text-[#6a7d9e] leading-relaxed mb-3">
                  {card.description}
                </p>
                {card.example && (
                  <p
                    className="font-mono text-[11px] text-[#3a4a6a] leading-relaxed border-l-2 pl-3"
                    style={{ borderColor: `${colors.accent}40` }}
                  >
                    {card.example}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* After-flip actions */}
        {flipped && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={e => { e.stopPropagation(); toggleKnown(); goNext(); }}
              className="flex-1 font-mono text-[10px] uppercase tracking-wider py-3 border transition-all"
              style={
                known.has(card.id)
                  ? { borderColor: '#4fc97e', color: '#4fc97e', background: 'rgba(79,201,126,0.08)' }
                  : { borderColor: 'rgba(79,201,126,0.3)', color: '#4fc97e' }
              }
            >
              ✓ Знаю
            </button>
            <button
              onClick={e => { e.stopPropagation(); goNext(); }}
              className="flex-1 font-mono text-[10px] uppercase tracking-wider py-3 border border-white/[0.07] text-[#3a4a6a] hover:text-[#5c6e98] hover:border-white/[0.14] transition-all"
            >
              Ещё раз →
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="flex-1 font-mono text-[10px] uppercase tracking-wider py-3 border border-white/[0.06] text-[#3a4a6a] hover:text-[#5c6e98] hover:border-white/[0.12] disabled:opacity-25 transition-all"
          >
            ← Назад
          </button>
          <button
            onClick={shuffle}
            className="font-mono text-[12px] text-[#2a3a60] hover:text-[#4a80f5] px-4 py-3 transition-colors"
            title="Случайная карточка"
          >
            ⟳
          </button>
          <button
            onClick={goNext}
            disabled={index === filtered.length - 1}
            className="flex-1 font-mono text-[10px] uppercase tracking-wider py-3 border border-white/[0.06] text-[#3a4a6a] hover:text-[#5c6e98] hover:border-white/[0.12] disabled:opacity-25 transition-all"
          >
            Вперёд →
          </button>
        </div>

        {/* Source note */}
        <p className="mt-8 font-mono text-[9px] text-[#1e2d40] text-center leading-relaxed uppercase tracking-wider">
          Источник: учебные программы по латинскому языку<br />
          медицинских вузов РФ (ФГОС ВО, специальность «Лечебное дело»)
        </p>
      </div>
    </div>
  );
}
