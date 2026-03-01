import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth.js';

const navItems = [
  { to: '/diagnoz', label: 'Диагноз' },
  { to: '/feed', label: 'Лента' },
  { to: '/aurora', label: 'Aurora 3D' },
  { to: '/history', label: 'История' },
  { to: '/longevity', label: 'Долголетие' },
  { to: '/news', label: 'Новости' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e8e8e0]">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/5">
        <NavLink to="/" className="font-serif text-xl font-bold tracking-wide">
          Анам<span className="text-[#c8f0a0]">нез</span>
        </NavLink>

        <ul className="flex gap-8">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `font-mono text-[11px] uppercase tracking-widest transition-colors ${
                    isActive ? 'text-[#c8f0a0]' : 'text-[#666670] hover:text-[#e8e8e0]'
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
                className="font-mono text-[11px] uppercase tracking-wider text-[#666670] hover:text-[#c8f0a0] transition-colors"
              >
                Сообщения
              </button>
              <NavLink
                to={`/profile/${user.username}`}
                className="font-mono text-[11px] uppercase tracking-wider text-[#c8f0a0]"
              >
                {user.display_name || user.username}
              </NavLink>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="font-mono text-[11px] text-[#444450] hover:text-[#e8e8e0] transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="font-mono text-[11px] uppercase tracking-wider border border-[#444450] px-4 py-2 text-[#666670] hover:border-[#c8f0a0] hover:text-[#c8f0a0] transition-all"
              >
                Войти
              </NavLink>
              <NavLink
                to="/register"
                className="font-mono text-[11px] uppercase tracking-wider bg-[#c8f0a0] text-[#0a0a0f] px-4 py-2 hover:bg-[#d8ffb0] transition-colors"
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
