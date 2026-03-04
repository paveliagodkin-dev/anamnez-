import Groq from 'groq-sdk';
import supabase from './supabase.js';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// llama-3.3-70b-versatile — бесплатный, поддерживает tool use
const MODEL = 'llama-3.3-70b-versatile';

// ─── Инструменты агента ────────────────────────────────────────────────────

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_medical_cases',
      description: 'Получить список клинических случаев с платформы Анамнез. Можно фильтровать по сложности.',
      parameters: {
        type: 'object',
        properties: {
          difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard'],
            description: 'Сложность случая (необязательно)',
          },
          limit: {
            type: 'number',
            description: 'Количество случаев для получения (по умолчанию 5)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_case_details',
      description: 'Получить подробную информацию о конкретном клиническом случае по его ID, включая варианты ответов.',
      parameters: {
        type: 'object',
        properties: {
          case_id: {
            type: 'string',
            description: 'UUID клинического случая',
          },
        },
        required: ['case_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_3d_scan',
      description:
        'Анализирует и интерпретирует 3D медицинское изображение (МРТ, КТ, рентген, УЗИ, ПЭТ). ' +
        'Описывает патологические изменения, нормальную анатомию и клиническое значение находок ' +
        'в контексте Aurora 3D визуализации.',
      parameters: {
        type: 'object',
        properties: {
          scan_type: {
            type: 'string',
            enum: ['МРТ', 'КТ', 'рентген', 'УЗИ', 'ПЭТ', 'МСКТ', '3D-реконструкция'],
            description: 'Тип медицинского изображения',
          },
          region: {
            type: 'string',
            description: 'Анатомическая область (например: "головной мозг", "грудная клетка")',
          },
          findings: {
            type: 'string',
            description: 'Описание находок или жалоба пациента для анализа',
          },
          clinical_context: {
            type: 'string',
            description: 'Клинический контекст: симптомы, анамнез пациента (необязательно)',
          },
        },
        required: ['scan_type', 'region', 'findings'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_anatomy_3d_model',
      description:
        'Предоставляет подробное описание 3D-анатомической модели выбранной области тела: ' +
        'слои, структуры, сосуды, нервы — как в Aurora 3D Atlas.',
      parameters: {
        type: 'object',
        properties: {
          region: {
            type: 'string',
            description: 'Анатомическая область (например: "сердце", "коленный сустав")',
          },
          detail_level: {
            type: 'string',
            enum: ['базовый', 'стандартный', 'детальный'],
            description: 'Уровень детализации модели',
          },
          focus: {
            type: 'string',
            description: 'Акцент описания: "сосуды", "нервы", "мышцы", "кости" (необязательно)',
          },
        },
        required: ['region'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'differential_diagnosis',
      description:
        'Составляет дифференциальный диагноз на основе симптомов, данных осмотра и ' +
        'результатов 3D-визуализации. Ранжирует диагнозы по вероятности.',
      parameters: {
        type: 'object',
        properties: {
          symptoms: {
            type: 'array',
            items: { type: 'string' },
            description: 'Список симптомов пациента',
          },
          imaging_findings: {
            type: 'string',
            description: 'Данные визуализации (МРТ/КТ/рентген)',
          },
          patient_data: {
            type: 'object',
            properties: {
              age: { type: 'number' },
              sex: { type: 'string', enum: ['М', 'Ж'] },
              comorbidities: { type: 'array', items: { type: 'string' } },
            },
            description: 'Данные пациента (необязательно)',
          },
        },
        required: ['symptoms'],
      },
    },
  },
];

// ─── Обработчики инструментов ──────────────────────────────────────────────

async function handleToolCall(toolName, toolInput) {
  switch (toolName) {
    case 'get_medical_cases': {
      const limit = toolInput.limit || 5;
      let query = supabase
        .from('cases')
        .select('id, title, difficulty, solve_count, correct_count, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (toolInput.difficulty) query = query.eq('difficulty', toolInput.difficulty);

      const { data, error } = await query;
      if (error) return { error: error.message };

      return {
        cases: data.map(c => ({
          ...c,
          accuracy: c.solve_count
            ? Math.round((c.correct_count / c.solve_count) * 100)
            : null,
        })),
        total: data.length,
      };
    }

    case 'get_case_details': {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id, title, description, difficulty, body, answer_explanation,
          solve_count, correct_count, is_daily,
          author:profiles(username, display_name),
          options:case_options(id, letter, text)
        `)
        .eq('id', toolInput.case_id)
        .eq('is_published', true)
        .single();

      if (error) return { error: 'Случай не найден' };
      return data;
    }

    case 'analyze_3d_scan': {
      const { scan_type, region, findings, clinical_context } = toolInput;
      return {
        scan_type,
        region,
        findings,
        clinical_context: clinical_context || 'не указан',
        aurora3d_layers: getAurora3DLayers(region),
        analysis_requested: true,
      };
    }

    case 'get_anatomy_3d_model': {
      const { region, detail_level = 'стандартный', focus } = toolInput;
      return {
        region,
        detail_level,
        focus: focus || 'все структуры',
        model_data: {
          region,
          detail_level,
          focus,
          layers: getAurora3DLayers(region),
          note: 'Данные 3D-модели Aurora для образовательного использования',
        },
      };
    }

    case 'differential_diagnosis': {
      return {
        symptoms: toolInput.symptoms,
        imaging_findings: toolInput.imaging_findings || 'не указаны',
        patient_data: toolInput.patient_data || {},
        analysis_requested: true,
      };
    }

    default:
      return { error: `Неизвестный инструмент: ${toolName}` };
  }
}

// ─── Вспомогательные данные для 3D ────────────────────────────────────────

function getAurora3DLayers(region) {
  const r = region.toLowerCase();
  if (r.includes('мозг') || r.includes('голов'))
    return ['кора', 'белое вещество', 'базальные ганглии', 'таламус', 'ствол', 'мозжечок', 'желудочки'];
  if (r.includes('сердц') || r.includes('грудн'))
    return ['перикард', 'миокард', 'эндокард', 'клапаны', 'коронарные сосуды', 'лёгочные сосуды'];
  if (r.includes('позвон') || r.includes('позвоноч'))
    return ['тело позвонка', 'дуга', 'межпозвоночный диск', 'спинной мозг', 'корешки', 'связки'];
  if (r.includes('колен') || r.includes('сустав'))
    return ['кость', 'хрящ', 'мениски', 'связки (ПКС, ЗКС)', 'синовиальная оболочка', 'суставная жидкость'];
  return ['поверхностный слой', 'средний слой', 'глубокий слой', 'сосуды', 'нервы'];
}

// ─── Основной агентный цикл ───────────────────────────────────────────────

const SYSTEM_PROMPT = `Ты — Aurora 3D Agent, медицинский AI-ассистент платформы Анамнез.

Твои возможности:
• Анализ 3D медицинских изображений (МРТ, КТ, рентген, УЗИ) — описываешь находки послойно
• Работа с 3D-анатомическими моделями — объясняешь структуры, слои, топографию
• Доступ к клиническим случаям платформы — можешь загрузить и разобрать любой случай
• Дифференциальная диагностика по симптомам и данным визуализации

Отвечай на русском языке. Будь точен, используй медицинскую терминологию, но объясняй понятно.
При анализе 3D-снимков структурируй ответ: Находки → Интерпретация → Рекомендации.
Всегда указывай, что твой анализ носит образовательный характер и не заменяет заключение врача.`;

export async function runAurora3DAgent(userMessage, conversationHistory = []) {
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  let response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    tools,
    tool_choice: 'auto',
  });

  // Агентный цикл: выполняем инструменты пока finish_reason === 'tool_calls'
  while (response.choices[0].finish_reason === 'tool_calls') {
    const assistantMsg = response.choices[0].message;
    messages.push(assistantMsg);

    const toolCalls = assistantMsg.tool_calls || [];
    for (const call of toolCalls) {
      let input;
      try {
        input = JSON.parse(call.function.arguments);
      } catch {
        input = {};
      }
      const result = await handleToolCall(call.function.name, input);
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }

    response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      tools,
      tool_choice: 'auto',
    });
  }

  const replyText = response.choices[0].message.content || 'Нет ответа';
  messages.push({ role: 'assistant', content: replyText });

  return {
    reply: replyText,
    history: messages,
    usage: response.usage,
  };
}
