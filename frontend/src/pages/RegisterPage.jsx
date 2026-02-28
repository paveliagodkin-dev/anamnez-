import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

const USER_TYPES = [
  { value: 'Врач', label: 'Врач' },
  { value: 'Студент', label: 'Студент' },
  { value: 'Преподаватель', label: 'Преподаватель' },
  { value: 'Мед. персонал', label: 'Мед. персонал' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', user_type: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.register(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#050918] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-6">✓</div>
          <h2 className="font-serif text-2xl mb-4 text-[#dce8ff]">Аккаунт создан</h2>
          <p className="font-mono text-[12px] text-[#5c6e98] leading-relaxed">
            Можешь войти с почтой <span className="text-[#4a80f5]">{form.email}</span>.
          </p>
          <Link to="/login" className="mt-8 inline-block font-mono text-[11px] uppercase tracking-wider text-[#4a80f5] hover:underline transition-colors">
            Войти →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050918] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="block font-serif text-2xl font-bold mb-12 text-center text-[#dce8ff]">
          Анам<span className="text-[#4a80f5]">нез</span>
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#5c6e98] mb-2">Кто ты</label>
            <div className="grid grid-cols-2 gap-1.5">
              {USER_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, user_type: value }))}
                  className={`px-3 py-2.5 font-mono text-[11px] border transition-all text-left ${
                    form.user_type === value
                      ? 'border-[#4a80f5] text-[#4a80f5] bg-[#4a80f5]/8'
                      : 'border-white/[0.06] text-[#5c6e98] bg-[#0b1226] hover:border-white/[0.15] hover:text-[#dce8ff]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'email', label: 'Эл. почта', type: 'email', placeholder: 'doctor@hospital.ru' },
            { key: 'username', label: 'Псевдоним', type: 'text', placeholder: 'dr_ivanov' },
            { key: 'password', label: 'Пароль', type: 'password', placeholder: '8+ символов' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#5c6e98] mb-2">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-[#0b1226] border border-white/[0.06] px-4 py-3 font-mono text-sm text-[#dce8ff] placeholder-[#3a4a6a] focus:outline-none focus:border-[#4a80f5] transition-colors"
                placeholder={placeholder}
                required
              />
            </div>
          ))}

          {error && (
            <p className="font-mono text-[11px] text-[#e05567] border border-[#e05567]/20 px-3 py-2 bg-[#e05567]/5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !form.user_type}
            className="w-full bg-[#4a80f5] text-white font-mono text-[11px] uppercase tracking-widest py-4 hover:bg-[#6a97f7] transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Создаём аккаунт...' : 'Создать аккаунт →'}
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-[11px] text-[#3a4a6a]">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-[#4a80f5] hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
}
