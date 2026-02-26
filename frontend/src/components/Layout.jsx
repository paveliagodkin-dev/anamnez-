import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth.js';

const navItems = [
  { to: '/diagnoz', label: 'Диагноз' },
  { to: '/feed', label: 'Лента' },
  { to: '/cards', label: 'Карточки' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() { setMenuOpen(false); }

  return (
    <div className="min-h-screen bg-[#050918] text-[#dce8ff]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050918]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-5 md:px-10 h-14">
          {/* Логотип */}
          <NavLink to="/" className="font-serif text-xl font-bold tracking-wide text-[#dce8ff]">
            Анам<span className="text-[#4a80f5]">нез</span>
          </NavLink>

          {/* Десктоп навигация */}
          <ul className="hidden md:flex gap-8">
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

          {/* Десктоп правый блок */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Мобильный hamburger */}
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Меню"
          >
            <span className={`block w-5 h-px bg-[#5c6e98] transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block w-5 h-px bg-[#5c6e98] transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-[#5c6e98] transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </button>
        </div>

        {/* Мобильное меню */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#050918] px-5 py-4 space-y-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block font-mono text-[12px] uppercase tracking-widest py-2.5 transition-colors ${
                    isActive ? 'text-[#4a80f5]' : 'text-[#5c6e98]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            <div className="border-t border-white/[0.04] pt-4 space-y-2">
              {user ? (
                <>
                  <button
                    onClick={() => { navigate('/messages'); closeMenu(); }}
                    className="block w-full text-left font-mono text-[12px] uppercase tracking-wider text-[#5c6e98] py-2"
                  >
                    Сообщения
                  </button>
                  <NavLink
                    to={`/profile/${user.username}`}
                    onClick={closeMenu}
                    className="block font-mono text-[12px] uppercase tracking-wider text-[#4a80f5] py-2"
                  >
                    {user.display_name || user.username}
                  </NavLink>
                  <button
                    onClick={() => { logout(); navigate('/login'); closeMenu(); }}
                    className="block w-full text-left font-mono text-[12px] text-[#3a4a6a] py-2"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <div className="flex gap-3 pt-1">
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="flex-1 text-center font-mono text-[11px] uppercase tracking-wider border border-[#2a3a60] py-2.5 text-[#5c6e98] hover:border-[#4a80f5] hover:text-[#4a80f5] transition-all"
                  >
                    Войти
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={closeMenu}
                    className="flex-1 text-center font-mono text-[11px] uppercase tracking-wider bg-[#4a80f5] text-white py-2.5 hover:bg-[#6a97f7] transition-colors"
                  >
                    Регистрация
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}
