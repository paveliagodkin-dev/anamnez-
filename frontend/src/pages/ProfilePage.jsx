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

  if (loading) return <div className="flex justify-center py-24 font-mono text-[12px] text-[#444450]">Загрузка...</div>;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-[#111118] border border-white/5 p-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#16161f] border border-white/5 flex items-center justify-center font-serif text-2xl text-[#666670]">
              {profile.display_name?.[0] || profile.username?.[0]}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">{profile.display_name || profile.username}</h1>
              <div className="font-mono text-[11px] text-[#444450] mt-1">@{profile.username}</div>
              {profile.specialty && (
                <div className="font-mono text-[11px] text-[#c8f0a0] mt-1">{profile.specialty}</div>
              )}
            </div>
          </div>

          {user && user.id !== profile.id && (
            <button
              onClick={startChat}
              className="font-mono text-[11px] uppercase tracking-wider border border-[#444450] px-4 py-2 text-[#666670] hover:border-[#c8f0a0] hover:text-[#c8f0a0] transition-all"
            >
              Написать
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="font-serif italic text-[15px] text-[#888] leading-relaxed mb-8 border-l-2 border-[#c8f0a0]/30 pl-4">
            {profile.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-px bg-white/5">
          {[
            { label: 'Очки', value: profile.score },
            { label: 'Случаев решено', value: profile.cases_solved },
            { label: 'Роль', value: profile.role === 'doctor' ? 'Врач' : profile.role === 'admin' ? 'Admin' : 'Участник' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#111118] p-5 text-center">
              <div className="font-mono text-xl text-[#e8e8e0] mb-1">{value}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#444450]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
