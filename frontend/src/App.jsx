import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './hooks/useAuth.js';
import Layout from './components/Layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import DiagnosPage from './pages/DiagnosPage.jsx';
import FeedPage from './pages/FeedPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CardsPage from './pages/CardsPage.jsx';
import SearchPage from './pages/SearchPage.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050918] text-[#4a80f5] font-mono text-xs tracking-widest uppercase">
        Загрузка...
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050918] text-[#4a80f5] font-mono text-xs tracking-widest uppercase">
        Загрузка...
      </div>
    );
  }
  // Гости могут видеть публичные страницы (вход/регистрация)
  return (user && user.role !== 'guest') ? <Navigate to="/diagnoz" /> : children;
}

export default function App() {
  const init = useAuthStore(s => s.init);
  useEffect(() => { init(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing — redirects to /diagnoz if already logged in */}
        <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />

        {/* Auth pages — only for guests */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Protected app — all sections require auth */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="diagnoz" element={<DiagnosPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="cards" element={<CardsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
