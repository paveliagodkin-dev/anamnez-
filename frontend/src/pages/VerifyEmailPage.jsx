import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMessage('Токен не найден'); return; }
    api.verifyEmail(token)
      .then(data => { setStatus('success'); setMessage(data.message); })
      .catch(err => { setStatus('error'); setMessage(err.message); });
  }, []);

  return (
    <div className="min-h-screen bg-[#050918] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {status === 'loading' && (
          <p className="font-mono text-sm text-[#5c6e98]">Проверяем токен...</p>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-6">✓</div>
            <h2 className="font-serif text-2xl mb-4 text-[#dce8ff]">Email подтверждён</h2>
            <p className="font-mono text-[12px] text-[#5c6e98] mb-8">{message}</p>
            <Link
              to="/login"
              className="bg-[#4a80f5] text-white font-mono text-[11px] uppercase tracking-wider px-8 py-3 hover:bg-[#6a97f7] transition-colors"
            >
              Войти →
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-6">✗</div>
            <h2 className="font-serif text-2xl mb-4 text-[#e05567]">Ошибка</h2>
            <p className="font-mono text-[12px] text-[#5c6e98] mb-8">{message}</p>
            <Link to="/register" className="font-mono text-[11px] text-[#3a4a6a] hover:text-[#dce8ff] transition-colors">
              ← Зарегистрироваться заново
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
