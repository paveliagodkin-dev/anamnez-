import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './hooks/useAuth.js';
import Layout from './components/Layout.jsx';
import DiagnosPage from './pages/DiagnosPage.jsx';
import FeedPage from './pages/FeedPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0a0a0f] text-[#c8f0a0] font-mono text-sm">Загрузка...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const init = useAuthStore(s => s.init);
  useEffect(() => { init(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/diagnoz" />} />
          <Route path="diagnoz" element={<DiagnosPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
          <Route path="profile/:username" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
