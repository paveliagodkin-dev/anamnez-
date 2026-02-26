import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/diagnoz');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050918] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-4">
          <span className="heart-pulse text-5xl">🩵</span>
        </div>
        <Link to="/" className="block font-serif text-2xl font-bold mb-12 text-center text-[#dce8ff]">
          Анам<span className="text-[#4a80f5]">нез</span>
        </Link>

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
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#0b1226] border border-white/[0.06] px-4 py-3 font-mono text-sm text-[#dce8ff] placeholder-[#3a4a6a] focus:outline-none focus:border-[#4a80f5] transition-colors"
              required
            />
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
