import Anthropic from '@anthropic-ai/sdk';
import supabase from './supabase.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-sonnet-4-6';

// ─── Инструменты агента ────────────────────────────────────────────────────

const tools = [
  {
    name: 'get_medical_cases',
    description:
      'Получить список клинических случаев с платформы Анамнез. Можно фильтровать по сложности.',
    input_schema: {
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
  {
    name: 'get_case_details',
    description:
      'Получить подробную информацию о конкретном клиническом случае по его ID, включая варианты ответов и 3D-визуализацию.',
    input_schema: {
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
  {
    name: 'analyze_3d_scan',
    description:
      'Анализирует и интерпретирует 3D медицинское изображение (МРТ, КТ, рентген, УЗИ, ПЭТ). ' +
      'Описывает патологические изменения, нормальную анатомию и клиническое значение находок ' +
      'в контексте Aurora 3D визуализации.',
    input_schema: {
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
  {
    name: 'get_anatomy_3d_model',
    description:
      'Предоставляет подробное описание 3D-анатомической модели выбранной области тела: ' +
      'слои, структуры, сосуды, нервы — как в Aurora 3D Atlas.',
    input_schema: {
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
          description:
            'Акцент описания: "сосуды", "нервы", "мышцы", "кости" (необязательно)',
        },
      },
      required: ['region'],
    },
  },
  {
    name: 'differential_diagnosis',
    description:
      'Составляет дифференциальный диагноз на основе симптомов, данных осмотра и ' +
      'результатов 3D-визуализации. Ранжирует диагнозы по вероятности.',
    input_schema: {
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
      // Агент сам анализирует — возвращаем структурированный контекст для LLM
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
        model_data: getAnatomyModelData(region, detail_level, focus),
      };
    }

    case 'differential_diagnosis': {
      const { symptoms, imaging_findings, patient_data } = toolInput;
      return {
        symptoms,
        imaging_findings: imaging_findings || 'не указаны',
        patient_data: patient_data || {},
        analysis_requested: true,
      };
    }

    default:
      return { error: `Неизвестный инструмент: ${toolName}` };
  }
}

// ─── Вспомогательные данные для 3D ────────────────────────────────────────

function getAurora3DLayers(region) {
  const regionLower = region.toLowerCase();
  if (regionLower.includes('мозг') || regionLower.includes('голов')) {
    return ['кора', 'белое вещество', 'базальные ганглии', 'таламус', 'ствол', 'мозжечок', 'желудочки'];
  }
  if (regionLower.includes('сердц') || regionLower.includes('грудн')) {
    return ['перикард', 'миокард', 'эндокард', 'клапаны', 'коронарные сосуды', 'лёгочные сосуды'];
  }
  if (regionLower.includes('позвон') || regionLower.includes('позвоноч')) {
    return ['тело позвонка', 'дуга', 'межпозвоночный диск', 'спинной мозг', 'корешки', 'связки'];
  }
  if (regionLower.includes('колен') || regionLower.includes('сустав')) {
    return ['кость', 'хрящ', 'мениски', 'связки (ПКС, ЗКС)', 'синовиальная оболочка', 'суставная жидкость'];
  }
  return ['поверхностный слой', 'средний слой', 'глубокий слой', 'сосуды', 'нервы'];
}

function getAnatomyModelData(region, detailLevel, focus) {
  return {
    region,
    detail_level: detailLevel,
    focus,
    layers: getAurora3DLayers(region),
    note: 'Данные 3D-модели Aurora для образовательного использования',
  };
}

// ─── Основной агентный цикл ───────────────────────────────────────────────

export async function runAurora3DAgent(userMessage, conversationHistory = []) {
  const systemPrompt = `Ты — Aurora 3D Agent, медицинский AI-ассистент платформы Анамнез.

Твои возможности:
• Анализ 3D медицинских изображений (МРТ, КТ, рентген, УЗИ) — описываешь находки послойно
• Работа с 3D-анатомическими моделями — объясняешь структуры, слои, топографию
• Доступ к клиническим случаям платформы — можешь загрузить и разобрать любой случай
• Дифференциальная диагностика по симптомам и данным визуализации

Отвечай на русском языке. Будь точен, используй медицинскую терминологию, но объясняй понятно.
При анализе 3D-снимков структурируй ответ: Находки → Интерпретация → Рекомендации.
Всегда указывай, что твой анализ носит образовательный характер и не заменяет заключение врача.`;

  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  let response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    tools,
    messages,
  });

  // Агентный цикл: выполняем инструменты пока stop_reason === 'tool_use'
  while (response.stop_reason === 'tool_use') {
    const assistantMessage = { role: 'assistant', content: response.content };
    messages.push(assistantMessage);

    const toolResults = [];
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        const result = await handleToolCall(block.name, block.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });

    response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    });
  }

  // Извлекаем текстовый ответ
  const textContent = response.content.find(b => b.type === 'text');
  const replyText = textContent ? textContent.text : 'Нет ответа';

  // Обновляем историю для следующего вызова
  const updatedHistory = [
    ...messages,
    { role: 'assistant', content: response.content },
  ];

  return {
    reply: replyText,
    history: updatedHistory,
    usage: response.usage,
  };
}
