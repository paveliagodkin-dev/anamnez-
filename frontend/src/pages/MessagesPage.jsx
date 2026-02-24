import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api.js';
import { useAuthStore } from '../hooks/useAuth.js';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const bottomRef = useRef();

  useEffect(() => {
    api.getConversations().then(({ conversations: c }) => {
      setConversations(c);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    api.getMessages(activeConv.id).then(({ messages: m }) => setMessages(m));
    const interval = setInterval(() => {
      api.getMessages(activeConv.id).then(({ messages: m }) => setMessages(m));
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    const msg = await api.sendMessage(activeConv.id, text);
    setMessages(m => [...m, msg]);
    setText('');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold mb-8">Сообщения</h1>

      <div className="flex h-[600px] bg-[#111118] border border-white/5">
        {/* Список переписок */}
        <div className="w-72 border-r border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#444450]">Переписки</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <p className="font-mono text-[11px] text-[#444450] p-4">Загрузка...</p>
            ) : conversations.length === 0 ? (
              <p className="font-mono text-[11px] text-[#444450] p-4 leading-relaxed">
                Нет сообщений.<br />Напиши кому-нибудь с его профиля.
              </p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                    activeConv?.id === conv.id ? 'bg-[#16161f]' : 'hover:bg-[#16161f]/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#16161f] border border-white/5 flex items-center justify-center font-mono text-[10px] text-[#666670]">
                      {conv.other_user?.display_name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-[13px] text-[#e8e8e0] truncate flex items-center gap-1">
                        {conv.other_user?.display_name || conv.other_user?.username}
                        {conv.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#c8f0a0] inline-block ml-1" />}
                      </div>
                      {conv.last_message && (
                        <div className="font-mono text-[10px] text-[#444450] truncate mt-0.5">
                          {conv.last_message.content}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Чат */}
        <div className="flex-1 flex flex-col">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-mono text-[11px] text-[#444450]">Выбери переписку</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#16161f] border border-white/5 flex items-center justify-center font-mono text-[10px] text-[#666670]">
                  {activeConv.other_user?.display_name?.[0] || '?'}
                </div>
                <span className="font-serif text-[14px]">
                  {activeConv.other_user?.display_name || activeConv.other_user?.username}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2.5 font-serif text-[14px] leading-relaxed ${
                        isMine
                          ? 'bg-[#c8f0a0] text-[#0a0a0f]'
                          : 'bg-[#16161f] border border-white/5 text-[#e8e8e0]'
                      }`}>
                        {msg.content}
                        <div className={`font-mono text-[9px] mt-1 ${isMine ? 'text-[#0a0a0f]/50' : 'text-[#444450]'}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ru })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} className="px-4 py-3 border-t border-white/5 flex gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Сообщение..."
                  className="flex-1 bg-[#0a0a0f] border border-white/5 px-4 py-2.5 font-mono text-[12px] text-[#e8e8e0] focus:outline-none focus:border-[#c8f0a0] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="font-mono text-[11px] bg-[#c8f0a0] text-[#0a0a0f] px-5 hover:bg-[#d8ffb0] transition-colors disabled:opacity-40"
                >
                  →
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
