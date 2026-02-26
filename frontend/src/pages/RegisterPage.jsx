import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-6">✉️</div>
          <h2 className="font-serif text-2xl mb-4">Проверь почту</h2>
          <p className="font-mono text-[12px] text-[#666670] leading-relaxed">
            Отправили письмо на <span className="text-[#c8f0a0]">{form.email}</span>.<br />
            Нажми ссылку в письме чтобы активировать аккаунт.
          </p>
          <Link to="/login" className="mt-8 inline-block font-mono text-[11px] uppercase tracking-wider text-[#444450] hover:text-[#e8e8e0] transition-colors">
            ← Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="block font-serif text-2xl font-bold mb-12 text-center">
          Анам<span className="text-[#c8f0a0]">нез</span>
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'email', label: 'Эл. почта', type: 'email', placeholder: 'doctor@hospital.ru' },
            { key: 'username', label: 'Псевдоним', type: 'text', placeholder: 'dr_ivanov' },
            { key: 'password', label: 'Пароль', type: 'password', placeholder: '8+ символов' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#666670] mb-2">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-[#111118] border border-white/5 px-4 py-3 font-mono text-sm text-[#e8e8e0] focus:outline-none focus:border-[#c8f0a0] transition-colors"
                placeholder={placeholder}
                required
              />
            </div>
          ))}

          {error && (
            <p className="font-mono text-[11px] text-[#e05555] border border-[#e05555]/20 px-3 py-2 bg-[#e05555]/5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c8f0a0] text-[#0a0a0f] font-mono text-[11px] uppercase tracking-widest py-4 hover:bg-[#d8ffb0] transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Создаём аккаунт...' : 'Создать аккаунт →'}
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-[11px] text-[#444450]">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-[#c8f0a0] hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
}
