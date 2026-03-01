import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth.js';
import { LogoFull } from './Logo.jsx';
import { getRank, getRankProgress } from '../lib/ranks.js';

const navItems = [
  { to: '/diagnoz', label: 'Диагноз' },
  { to: '/feed', label: 'Лента' },
  { to: '/cards', label: 'Карточки' },
];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const searchRef = useRef(null);

  function closeMenu() { setMenuOpen(false); }

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  }
  function closeSearch() {
    setSearchOpen(false);
    setSearchVal('');
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      closeSearch();
      closeMenu();
    }
  }

  // Close search on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') closeSearch(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#050918] text-[#dce8ff]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050918]/85 backdrop-blur-md border-b border-white/[0.05]">
        <div className="flex items-center justify-between px-5 md:px-10 h-14">

          {/* Logo */}
          <NavLink to="/diagnoz">
            <LogoFull />
          </NavLink>

          {/* Desktop nav */}
          <ul className="hidden md:flex gap-7">
            {navItems.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `font-mono text-[11px] uppercase tracking-widest transition-colors ${
                      isActive ? 'text-[#4a80f5]' : 'text-[#4a5a7a] hover:text-[#dce8ff]'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop right block */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search bar (expands inline) */}
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <input
                  ref={searchRef}
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Поиск случаев..."
                  className="w-52 bg-[#0b1226] border border-[#4a80f5]/50 px-3 py-1.5 font-mono text-xs text-[#dce8ff] placeholder-[#3a4a6a] outline-none transition-all"
                />
                <button type="submit" className="text-[#4a80f5] hover:text-[#6a97f7] transition-colors p-1">
                  <SearchIcon />
                </button>
                <button type="button" onClick={closeSearch} className="text-[#3a4a6a] hover:text-[#dce8ff] transition-colors p-1">
                  <CloseIcon />
                </button>
              </form>
            ) : (
              <button
                onClick={openSearch}
                className="text-[#4a5a7a] hover:text-[#dce8ff] transition-colors p-1.5"
                aria-label="Поиск"
              >
                <SearchIcon />
              </button>
            )}

            {user?.role === 'guest' ? (
              <>
                <span className="font-mono text-[10px] text-[#3a4a6a] uppercase tracking-widest">Гость</span>
                <NavLink
                  to="/login"
                  className="font-mono text-[11px] uppercase tracking-wider text-[#4a80f5] hover:text-[#6a97f7] transition-colors"
                >
                  Войти →
                </NavLink>
              </>
            ) : user ? (
              <>
                <button
                  onClick={() => navigate('/messages')}
                  className="text-[#4a5a7a] hover:text-[#4a80f5] transition-colors p-1.5"
                  aria-label="Сообщения"
                >
                  <MessageIcon />
                </button>
                <NavLink
                  to={`/profile/${user.username}`}
                  className="flex flex-col items-end gap-1 group"
                >
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#4a80f5] group-hover:text-[#6a97f7] transition-colors">
                    {user.display_name || user.username}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-[2px] bg-white/[0.07] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${getRankProgress(user.score || 0)}%`, background: getRank(user.score || 0).color }}
                      />
                    </div>
                    <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: getRank(user.score || 0).color }}>
                      {getRank(user.score || 0).symbol} {getRank(user.score || 0).label}
                    </span>
                  </div>
                </NavLink>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="font-mono text-[10px] text-[#2a3a50] hover:text-[#dce8ff] transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : null}
          </div>

          {/* Mobile right: search + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={searchOpen ? closeSearch : openSearch}
              className="text-[#4a5a7a] hover:text-[#dce8ff] transition-colors p-3"
              aria-label="Поиск"
            >
              {searchOpen ? <CloseIcon /> : <SearchIcon />}
            </button>
            <button
              className="flex flex-col justify-center gap-[5px] w-11 h-11 items-center"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Меню"
            >
              <span className={`block w-5 h-px bg-[#5c6e98] transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
              <span className={`block w-5 h-px bg-[#5c6e98] transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-px bg-[#5c6e98] transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-white/[0.05] bg-[#050918] px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                ref={searchRef}
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Поиск клинических случаев..."
                className="flex-1 bg-[#0b1226] border border-[#4a80f5]/40 px-3 py-2.5 font-mono text-xs text-[#dce8ff] placeholder-[#3a4a6a] outline-none"
              />
              <button
                type="submit"
                className="bg-[#4a80f5] text-white font-mono text-[10px] uppercase tracking-widest px-4 hover:bg-[#6a97f7] transition-colors"
              >
                Найти
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.05] bg-[#050918] px-5 py-2">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block font-mono text-[13px] uppercase tracking-widest py-3.5 border-b border-white/[0.03] transition-colors ${
                    isActive ? 'text-[#4a80f5]' : 'text-[#4a5a7a]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            <div className="pt-2 pb-2">
              {user?.role === 'guest' ? (
                <>
                  <span className="block font-mono text-[12px] uppercase tracking-widest text-[#3a4a6a] py-3.5 border-b border-white/[0.03]">Гость</span>
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="block font-mono text-[13px] uppercase tracking-wider text-[#4a80f5] py-3.5"
                  >
                    Войти →
                  </NavLink>
                </>
              ) : user ? (
                <>
                  <button
                    onClick={() => { navigate('/messages'); closeMenu(); }}
                    className="block w-full text-left font-mono text-[13px] uppercase tracking-wider text-[#4a5a7a] py-3.5 border-b border-white/[0.03]"
                  >
                    Сообщения
                  </button>
                  <NavLink
                    to={`/profile/${user.username}`}
                    onClick={closeMenu}
                    className="block py-3.5 border-b border-white/[0.03]"
                  >
                    <span className="font-mono text-[13px] uppercase tracking-wider text-[#4a80f5]">
                      {user.display_name || user.username}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-[2px] bg-white/[0.07] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${getRankProgress(user.score || 0)}%`, background: getRank(user.score || 0).color }}
                        />
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-widest shrink-0" style={{ color: getRank(user.score || 0).color }}>
                        {getRank(user.score || 0).symbol} {getRank(user.score || 0).label}
                      </span>
                    </div>
                  </NavLink>
                  <button
                    onClick={() => { logout(); navigate('/'); closeMenu(); }}
                    className="block w-full text-left font-mono text-[13px] text-[#2a3a50] py-3.5"
                  >
                    Выйти
                  </button>
                </>
              ) : null}
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
