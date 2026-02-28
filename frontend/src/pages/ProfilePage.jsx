import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuthStore } from '../hooks/useAuth.js';

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.getProfile(username)
      .then(setProfile)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [username]);

  async function startChat() {
    const { conversation_id } = await api.startConversation(profile.id);
    navigate('/messages');
  }

  if (loading) return <div className="flex justify-center py-24 font-mono text-[12px] text-[#3a4a6a]">Загрузка...</div>;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
      <div className="bg-[#0b1226] border border-white/[0.06] p-5 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#101930] border border-white/[0.06] flex items-center justify-center font-serif text-xl md:text-2xl text-[#5c6e98] shrink-0">
              {profile.display_name?.[0] || profile.username?.[0]}
            </div>
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-bold text-[#dce8ff]">{profile.display_name || profile.username}</h1>
              <div className="font-mono text-[11px] text-[#3a4a6a] mt-1">@{profile.username}</div>
              {profile.specialty && (
                <div className="font-mono text-[11px] text-[#4a80f5] mt-1">{profile.specialty}</div>
              )}
            </div>
          </div>

          {user && user.id !== profile.id && (
            <button
              onClick={startChat}
              className="font-mono text-[11px] uppercase tracking-wider border border-[#2a3a60] px-4 py-3 text-[#5c6e98] hover:border-[#4a80f5] hover:text-[#4a80f5] transition-all self-start sm:self-auto min-h-[44px]"
            >
              Написать
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="font-serif italic text-[14px] md:text-[15px] text-[#5c6e98] leading-relaxed mb-6 md:mb-8 border-l-2 border-[#4a80f5]/30 pl-4">
            {profile.bio}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.04]">
          {[
            { label: 'Очки', value: profile.score },
            { label: 'Случаев решено', value: profile.cases_solved },
            { label: 'Роль', value: profile.role === 'doctor' ? 'Врач' : profile.role === 'admin' ? 'Администратор' : 'Участник' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0b1226] p-5 text-center">
              <div className="font-mono text-xl text-[#dce8ff] mb-1">{value}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#3a4a6a]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
