import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuthStore } from '../hooks/useAuth.js';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import RankBadge from '../components/RankBadge.jsx';

const SECTION_TABS = [
  { to: '/feed', label: 'Лента' },
  { to: '/diagnoz', label: 'Клинические случаи' },
  { to: '/cards', label: 'Карточки' },
];

function SectionTabs() {
  return (
    <div className="flex gap-1 mb-8 border-b border-white/[0.06] pb-0 overflow-x-auto scrollbar-none">
      {SECTION_TABS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `font-mono text-[10px] md:text-[11px] uppercase tracking-widest px-3 md:px-4 py-3 border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
              isActive
                ? 'border-[#4a80f5] text-[#4a80f5]'
                : 'border-transparent text-[#3a4a6a] hover:text-[#dce8ff]'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  );
}

function PostCard({ post }) {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  async function loadComments() {
    if (!showComments) {
      const { comments: c } = await api.getComments(post.id);
      setComments(c);
    }
    setShowComments(v => !v);
  }

  async function handleLike() {
    if (!user) return;
    const { liked: newLiked } = await api.likePost(post.id);
    setLiked(newLiked);
    setLikesCount(c => newLiked ? c + 1 : c - 1);
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const comment = await api.createComment(post.id, { content: commentText });
    setComments(c => [...c, comment]);
    setCommentText('');
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru });

  return (
    <div className="bg-[#0b1226] border border-white/[0.06] p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-[#101930] border border-white/[0.06] flex items-center justify-center font-mono text-xs text-[#5c6e98] flex-shrink-0">
          {post.author?.display_name?.[0] || post.author?.username?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-[15px] text-[#dce8ff]">
              {post.author?.display_name || post.author?.username}
            </span>
            <RankBadge score={post.author?.score || 0} size="sm" />
            <span className="font-mono text-[10px] text-[#3a4a6a]">{timeAgo}</span>
          </div>
          {post.author?.specialty && (
            <div className="font-mono text-[10px] text-[#3a4a6a] mt-0.5">{post.author.specialty}</div>
          )}
        </div>
      </div>

      <p className="font-serif text-[15px] leading-relaxed text-[#a8b8d8] mb-4 whitespace-pre-wrap">{post.content}</p>

      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full max-h-80 object-cover mb-4 border border-white/[0.06]" />
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-white/[0.06]">
        {user ? (
          <button
            onClick={handleLike}
            className={`font-mono text-[12px] flex items-center gap-1.5 py-2 pr-3 transition-colors ${
              liked ? 'text-[#4a80f5]' : 'text-[#3a4a6a] hover:text-[#dce8ff]'
            }`}
          >
            ♥ {likesCount}
          </button>
        ) : (
          <Link
            to="/register"
            className="font-mono text-[12px] text-[#3a4a6a] hover:text-[#5c6e98] transition-colors flex items-center gap-1.5 py-2 pr-3"
            title="Войди чтобы ставить лайки"
          >
            ♥ {likesCount}
          </Link>
        )}
        <button
          onClick={loadComments}
          className="font-mono text-[12px] text-[#3a4a6a] hover:text-[#dce8ff] transition-colors flex items-center gap-1.5 py-2"
        >
          ◻ {post.comments_count} комментариев
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#101930] border border-white/[0.06] flex items-center justify-center font-mono text-[10px] text-[#5c6e98] flex-shrink-0 mt-0.5">
                {c.author?.display_name?.[0] || '?'}
              </div>
              <div>
                <span className="font-serif text-[13px] text-[#5c6e98] mr-2">{c.author?.display_name || c.author?.username}</span>
                <span className="font-serif text-[13px] text-[#a8b8d8]">{c.content}</span>
                {c.replies?.map(r => (
                  <div key={r.id} className="mt-2 ml-4 font-serif text-[12px] text-[#5c6e98]">
                    <span className="text-[#3a4a6a] mr-2">{r.author?.username}</span>{r.content}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {user ? (
            <form onSubmit={submitComment} className="flex gap-2 mt-3">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Комментарий..."
                className="flex-1 bg-[#050918] border border-white/[0.06] px-3 py-2 font-mono text-[12px] text-[#dce8ff] placeholder-[#3a4a6a] focus:outline-none focus:border-[#4a80f5] transition-colors"
              />
              <button type="submit" className="font-mono text-[11px] bg-[#4a80f5] text-white px-4 hover:bg-[#6a97f7] transition-colors">
                →
              </button>
            </form>
          ) : (
            <p className="font-mono text-[11px] text-[#3a4a6a] pt-1">
              <Link to="/register" className="text-[#4a80f5] hover:underline">Зарегистрируйся</Link> или{' '}
              <Link to="/login" className="text-[#4a80f5] hover:underline">войди</Link> чтобы оставить комментарий
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    api.getFeed('feed').then(({ posts }) => {
      setPosts(posts);
      setLoading(false);
    });
  }, []);

  async function submitPost(e) {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const post = await api.createPost({ content: newPost, section: 'feed' });
      setPosts(p => [post, ...p]);
      setNewPost('');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">
      <SectionTabs />
      <h1 className="font-serif text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-[#dce8ff]">Лента</h1>

      {user && (
        <form onSubmit={submitPost} className="mb-8 bg-[#0b1226] border border-white/[0.06] p-5">
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Поделись мыслью, наблюдением или вопросом..."
            rows={3}
            className="w-full bg-transparent font-serif text-[15px] text-[#dce8ff] placeholder-[#3a4a6a] resize-none focus:outline-none"
          />
          <div className="flex justify-end mt-3 pt-3 border-t border-white/[0.06]">
            <button
              type="submit"
              disabled={posting || !newPost.trim()}
              className="font-mono text-[11px] uppercase tracking-wider bg-[#4a80f5] text-white px-6 py-2.5 hover:bg-[#6a97f7] transition-colors disabled:opacity-40"
            >
              {posting ? 'Публикуем...' : 'Опубликовать'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="font-mono text-[12px] text-[#3a4a6a] text-center py-12">Загрузка...</p>
      ) : posts.length === 0 ? (
        <p className="font-mono text-[12px] text-[#3a4a6a] text-center py-12">Пока нет постов. Будь первым!</p>
      ) : (
        <div className="space-y-px bg-white/[0.04]">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
