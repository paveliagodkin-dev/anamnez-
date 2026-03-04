import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth.js';
import { LogoMark } from '../components/Logo.jsx';

const GUEST_LIMITS = [
  'Просмотр всех разделов',
  'Чтение клинических случаев',
  'Чтение историй и новостей',
];

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsGuest } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/feed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGuest() {
    loginAsGuest();
    navigate('/feed');
  }

  return (
    <div className="min-h-screen bg-[#050918] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10 gap-3">
          <LogoMark size={48} />
          <Link to="/" className="font-bold text-xl text-[#dce8ff] tracking-wide">
            Анам<span className="text-[#4a80f5]">нез</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border border-white/[0.06]">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 font-mono text-[10px] uppercase tracking-widest py-2.5 transition-colors ${
              tab === 'login'
                ? 'bg-[#4a80f5] text-white'
                : 'text-[#3a4a6a] hover:text-[#dce8ff]'
            }`}
          >
            Войти
          </button>
          <button
            onClick={() => { setTab('guest'); setError(''); }}
            className={`flex-1 font-mono text-[10px] uppercase tracking-widest py-2.5 transition-colors ${
              tab === 'guest'
                ? 'bg-[#4a80f5] text-white'
                : 'text-[#3a4a6a] hover:text-[#dce8ff]'
            }`}
          >
            Гость
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#5c6e98] mb-2">Эл. почта</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0b1226] border border-white/[0.06] px-4 py-3 font-mono text-sm text-[#dce8ff] placeholder-[#3a4a6a] focus:outline-none focus:border-[#4a80f5] transition-colors"
                placeholder="doctor@hospital.ru"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#5c6e98] mb-2">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0b1226] border border-white/[0.06] px-4 py-3 pr-11 font-mono text-sm text-[#dce8ff] placeholder-[#3a4a6a] focus:outline-none focus:border-[#4a80f5] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a4a6a] hover:text-[#5c6e98] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-mono text-[11px] text-[#e05567] border border-[#e05567]/20 px-3 py-2 bg-[#e05567]/5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4a80f5] text-white font-mono text-[11px] uppercase tracking-widest py-4 hover:bg-[#6a97f7] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Входим...' : 'Войти →'}
            </button>
          </form>
        ) : (
          <div className="bg-[#0b1226] border border-white/[0.06] p-5 space-y-4">
            <p className="font-mono text-[11px] text-[#5c6e98] uppercase tracking-widest">Режим гостя</p>
            <ul className="space-y-1.5">
              {GUEST_LIMITS.map(item => (
                <li key={item} className="font-serif text-[13px] text-[#a8b8d8] flex items-center gap-2">
                  <span className="text-[#4a80f5] text-[10px]">✓</span> {item}
                </li>
              ))}
              <li className="font-serif text-[13px] text-[#3a4a6a] flex items-center gap-2">
                <span className="text-[10px]">✗</span> Лайки и комментарии
              </li>
              <li className="font-serif text-[13px] text-[#3a4a6a] flex items-center gap-2">
                <span className="text-[10px]">✗</span> Личные сообщения
              </li>
              <li className="font-serif text-[13px] text-[#3a4a6a] flex items-center gap-2">
                <span className="text-[10px]">✗</span> Решение клинических случаев
              </li>
            </ul>
            <button
              onClick={handleGuest}
              className="w-full bg-[#4a80f5] text-white font-mono text-[11px] uppercase tracking-widest py-3.5 hover:bg-[#6a97f7] transition-colors"
            >
              Просматривать →
            </button>
          </div>
        )}

        <p className="mt-8 text-center font-mono text-[11px] text-[#3a4a6a]">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-[#4a80f5] hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
