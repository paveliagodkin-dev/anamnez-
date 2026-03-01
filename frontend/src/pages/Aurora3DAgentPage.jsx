import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api.js';

const SUGGESTIONS = [
  'Покажи клинические случаи по кардиологии',
  'Опиши 3D-модель коленного сустава',
  'Проанализируй МРТ головного мозга: гиперинтенсивный очаг в белом веществе',
  'Дифференциальный диагноз: боль в груди, одышка, тахикардия',
  'Объясни слои КТ грудной клетки при пневмонии',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-sm bg-[#c8f0a0]/10 border border-[#c8f0a0]/30 flex items-center justify-center mr-3 mt-1 shrink-0">
          <span className="font-mono text-[9px] text-[#c8f0a0]">A3</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-sm text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[#c8f0a0]/10 border border-[#c8f0a0]/20 text-[#e8e8e0] font-mono text-xs'
            : 'bg-[#111118] border border-white/5 text-[#e8e8e0] font-serif'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function Aurora3DAgentPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const data = await api.agentChat(message, sessionId);
      setSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function resetSession() {
    if (sessionId) api.resetAgentSession(sessionId).catch(() => {});
    setMessages([]);
    setSessionId(null);
    setError(null);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5 border-b border-white/5">
        <div>
          <p className="font-mono text-[11px] text-[#c8f0a0] uppercase tracking-widest mb-1">
            Aurora 3D Agent
          </p>
          <h1 className="font-serif text-2xl font-bold">
            Медицинский AI‑ассистент
          </h1>
        </div>
        {!isEmpty && (
          <button
            onClick={resetSession}
            className="font-mono text-[10px] uppercase tracking-widest text-[#444450] hover:text-[#e8e8e0] transition-colors"
          >
            Новый диалог
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-10 py-6">
        {isEmpty ? (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="text-center mb-10">
              {/* Aurora 3D logo icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm border border-[#c8f0a0]/30 bg-[#c8f0a0]/5 mb-4">
                <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                  <polygon points="16,3 29,24 3,24" stroke="#c8f0a0" strokeWidth="1.5" fill="none"/>
                  <polygon points="16,10 24,24 8,24" stroke="#c8f0a0" strokeWidth="0.8" fill="#c8f0a0" fillOpacity="0.08"/>
                  <circle cx="16" cy="3" r="1.5" fill="#c8f0a0"/>
                </svg>
              </div>
              <h2 className="font-serif text-3xl font-bold mb-2">Aurora 3D</h2>
              <p className="font-serif italic text-[#666670] text-sm max-w-md mx-auto">
                Анализ медицинских 3D‑изображений, анатомических моделей и клинических случаев
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="text-left px-4 py-3 border border-white/5 hover:border-[#c8f0a0]/30 hover:bg-[#c8f0a0]/3 transition-all group"
                >
                  <span className="font-mono text-[10px] text-[#c8f0a0] uppercase tracking-widest mr-3 group-hover:text-[#c8f0a0]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-sm text-[#888890] group-hover:text-[#e8e8e0] transition-colors">
                    {s}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="w-7 h-7 rounded-sm bg-[#c8f0a0]/10 border border-[#c8f0a0]/30 flex items-center justify-center mr-3 mt-1 shrink-0">
                  <span className="font-mono text-[9px] text-[#c8f0a0]">A3</span>
                </div>
                <div className="bg-[#111118] border border-white/5 px-4 py-3 rounded-sm">
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#c8f0a0]/50 animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className="text-center py-2">
                <span className="font-mono text-[11px] text-red-400/70">{error}</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-10 py-5 border-t border-white/5">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Опиши снимок, задай вопрос или назови симптомы..."
            rows={1}
            className="flex-1 bg-[#111118] border border-white/10 focus:border-[#c8f0a0]/40 outline-none text-[#e8e8e0] font-serif text-sm px-4 py-3 resize-none rounded-sm transition-colors placeholder-[#444450]"
            style={{ minHeight: '44px', maxHeight: '140px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="shrink-0 bg-[#c8f0a0] text-[#0a0a0f] font-mono text-[11px] uppercase tracking-widest px-5 py-3 hover:bg-[#d8ffb0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Отправить'}
          </button>
        </div>
        <p className="font-mono text-[10px] text-[#333340] text-center mt-2">
          Enter — отправить · Shift+Enter — перенос строки · Только для образовательных целей
        </p>
      </div>
    </div>
  );
}
