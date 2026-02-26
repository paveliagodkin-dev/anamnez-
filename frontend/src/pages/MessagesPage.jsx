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
      <h1 className="font-serif text-4xl font-bold mb-8 text-[#dce8ff]">Сообщения</h1>

      <div className="flex h-[600px] bg-[#0b1226] border border-white/[0.06]">
        {/* Список переписок */}
        <div className="w-72 border-r border-white/[0.06] flex flex-col">
          <div className="p-4 border-b border-white/[0.06]">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#3a4a6a]">Переписки</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <p className="font-mono text-[11px] text-[#3a4a6a] p-4">Загрузка...</p>
            ) : conversations.length === 0 ? (
              <p className="font-mono text-[11px] text-[#3a4a6a] p-4 leading-relaxed">
                Нет сообщений.<br />Напиши кому-нибудь с его профиля.
              </p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full text-left px-4 py-3 border-b border-white/[0.06] transition-colors ${
                    activeConv?.id === conv.id ? 'bg-[#101930]' : 'hover:bg-[#101930]/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#101930] border border-white/[0.06] flex items-center justify-center font-mono text-[10px] text-[#5c6e98]">
                      {conv.other_user?.display_name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-[13px] text-[#dce8ff] truncate flex items-center gap-1">
                        {conv.other_user?.display_name || conv.other_user?.username}
                        {conv.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#4a80f5] inline-block ml-1" />}
                      </div>
                      {conv.last_message && (
                        <div className="font-mono text-[10px] text-[#3a4a6a] truncate mt-0.5">
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
              <p className="font-mono text-[11px] text-[#3a4a6a]">Выбери переписку</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#101930] border border-white/[0.06] flex items-center justify-center font-mono text-[10px] text-[#5c6e98]">
                  {activeConv.other_user?.display_name?.[0] || '?'}
                </div>
                <span className="font-serif text-[14px] text-[#dce8ff]">
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
                          ? 'bg-[#1a3580] text-[#dce8ff]'
                          : 'bg-[#101930] border border-white/[0.06] text-[#a8b8d8]'
                      }`}>
                        {msg.content}
                        <div className={`font-mono text-[9px] mt-1 ${isMine ? 'text-[#dce8ff]/40' : 'text-[#3a4a6a]'}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ru })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} className="px-4 py-3 border-t border-white/[0.06] flex gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Сообщение..."
                  className="flex-1 bg-[#050918] border border-white/[0.06] px-4 py-2.5 font-mono text-[12px] text-[#dce8ff] placeholder-[#3a4a6a] focus:outline-none focus:border-[#4a80f5] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="font-mono text-[11px] bg-[#4a80f5] text-white px-5 hover:bg-[#6a97f7] transition-colors disabled:opacity-40"
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
