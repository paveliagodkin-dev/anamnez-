import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth.js';

const navItems = [
  { to: '/diagnoz', label: 'Диагноз' },
  { to: '/feed', label: 'Лента' },
  { to: '/history', label: 'История' },
  { to: '/longevity', label: 'Долголетие' },
  { to: '/news', label: 'Новости' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050918] text-[#dce8ff]">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 bg-[#050918]/80 backdrop-blur-md border-b border-white/[0.06]">
        <NavLink to="/" className="font-serif text-xl font-bold tracking-wide text-[#dce8ff]">
          Анам<span className="text-[#4a80f5]">нез</span>
        </NavLink>

        <ul className="flex gap-8">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `font-mono text-[11px] uppercase tracking-widest transition-colors ${
                    isActive ? 'text-[#4a80f5]' : 'text-[#5c6e98] hover:text-[#dce8ff]'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => navigate('/messages')}
                className="font-mono text-[11px] uppercase tracking-wider text-[#5c6e98] hover:text-[#4a80f5] transition-colors"
              >
                Сообщения
              </button>
              <NavLink
                to={`/profile/${user.username}`}
                className="font-mono text-[11px] uppercase tracking-wider text-[#4a80f5] hover:text-[#6a97f7] transition-colors"
              >
                {user.display_name || user.username}
              </NavLink>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="font-mono text-[11px] text-[#3a4a6a] hover:text-[#dce8ff] transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="font-mono text-[11px] uppercase tracking-wider border border-[#2a3a60] px-4 py-2 text-[#5c6e98] hover:border-[#4a80f5] hover:text-[#4a80f5] transition-all"
              >
                Войти
              </NavLink>
              <NavLink
                to="/register"
                className="font-mono text-[11px] uppercase tracking-wider bg-[#4a80f5] text-white px-4 py-2 hover:bg-[#6a97f7] transition-colors"
              >
                Регистрация
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
}
