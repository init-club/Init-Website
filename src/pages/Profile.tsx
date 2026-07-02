/**
 To people who handle this codebase in the future. The profile page has a few non-obvious decisions.

 1) Supabase RPC vs. Direct Table Fallback: Profile data is fetched via the 'get_full_profile' database function.
    This RPC returns abbreviated column aliases: 'gh_url', 'li_url', 'ig_url' instead of the full table names
    'github_url', 'linkedin_url', 'instagram_url'. If you ever fall back to a direct .from('users').select() query,
    you'll get the full names. Code that reads social links must handle BOTH: (profile.gh_url || profile.github_url).
    Don't "fix" this by renaming things in one place — you'll break the other.

 2) Milestones / Journey Timeline: The "journey" items (Joined, First Commit, First PR, Blog Published, Title Awarded)
    are computed dynamically on the client side from the profile data. They are NOT stored as separate DB rows.
    This was a deliberate choice to avoid DB bloat. If you want to add a new milestone, add it to the 'buildTimeline'
    logic inside the component, not to the database schema.

 3) Social Links: Only shown if at least one of gh_url, li_url, or ig_url is non-empty. The check uses an IIFE
    (immediately invoked function expression) inside JSX to keep the multi-variable logic clean without polluting
    the component's state.

 4) Roll Number Privacy: 'roll_no' is deliberately NOT rendered anywhere on this page. It is only visible to
    admins in the /admin/members panel. Don't add it back to the public profile without explicit approval.

 5) 'can_edit' and 'is_own_profile': These fields come from the RPC and are null when the user is not logged in.
    The edit button is conditionally rendered only when can_edit is true. The RPC handles the permission check
    server-side so we never expose edit controls to the wrong user.

 */
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Github,
  Linkedin,
  Instagram,
  Edit2,
  GitCommit,
  GitPullRequest,
  Code,
  User as UserIcon,
  Calendar,
  Award,
  Star,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Navbar } from '../components/layout/Navbar';
import { motion } from 'framer-motion';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugError, setDebugError] = useState<string>("");
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profile?.id) {
      fetchBlogs();
    }
  }, [profile]);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('author_id', profile.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (!error && data) {
        setBlogs(data);
      }
    } catch (e) {
      console.error("Error fetching user blogs:", e);
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    setDebugError("");
    try {

      let targetUser = username || null;
      let sessionUserId = null;


      const { data: { session } } = await supabase.auth.getSession();
      if (session) sessionUserId = session.user.id;

      // If viewing own profile directly, resolve username first to query full details via RPC
      if (!targetUser && sessionUserId) {
        const { data: userRow } = await supabase
          .from('users')
          .select('username')
          .eq('auth_user_id', sessionUserId)
          .single();
        if (userRow) {
          targetUser = userRow.username;
        }
      }

      if (targetUser) {
        const { data, error } = await supabase.rpc('get_full_profile', {
          target_username: targetUser
        });

        if (!error && data && data.length > 0) {
          setProfile(data[0]);
          setIsLoading(false);
          return;
        }
        console.warn("RPC Failed, trying fallback...", error);
      }

      let query = supabase.from('users').select('*');

      if (targetUser) {
        query = query.eq('username', targetUser);
      } else if (sessionUserId) {
        query = query.eq('auth_user_id', sessionUserId);
      } else {
        throw new Error("No username provided and not logged in.");
      }

      const { data: userData, error: userError } = await query.single();

      if (userError || !userData) {
        throw userError || new Error("User not found in DB");
      }

      const fallbackProfile = {
        ...userData,
        total_commits: 0,
        total_prs: 0,
        participated_repos: [],
        is_own_profile: sessionUserId === userData.auth_user_id,
        can_edit: sessionUserId === userData.auth_user_id
      };

      setProfile(fallbackProfile);

    } catch (error: any) {
      console.error('Final Profile Error:', error);
      setDebugError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic milestones calculation based on user status
  const milestones = useMemo(() => {
    if (!profile) return [];
    const items = [];

    if (profile.created_at) {
      items.push({
        date: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        title: 'Joined the Organization',
        desc: 'Successfully onboarded as an official member of the Init Club.',
        icon: UserIcon,
        color: 'text-zinc-400 border-zinc-700 bg-zinc-900',
      });
    }

    if (profile.total_commits > 0) {
      items.push({
        date: 'Code Contribution',
        title: 'First Commits Recorded',
        desc: `Pushed code to organization repositories, logging a total of ${profile.total_commits} commits.`,
        icon: GitCommit,
        color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
      });
    }

    if (profile.total_prs > 0) {
      items.push({
        date: 'Code Review & Collaboration',
        title: 'Pull Requests Merged',
        desc: `Successfully created and merged ${profile.total_prs} pull request(s) into project branches.`,
        icon: GitPullRequest,
        color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
      });
    }

    if (blogs && blogs.length > 0) {
      items.push({
        date: 'Knowledge Sharing',
        title: 'Community Blog Published',
        desc: `Published ${blogs.length} technical blog post(s) for the community.`,
        icon: BookOpen,
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
      });
    }

    if (profile.custom_title || profile.role) {
      items.push({
        date: 'Title Awarded',
        title: profile.custom_title || profile.role,
        desc: `Assigned the official role / custom title of '${profile.custom_title || profile.role}'.`,
        icon: Award,
        color: 'text-[#00ffd5] border-[#00ffd5]/30 bg-[#00ffd5]/10',
      });
    }

    return items;
  }, [profile, blogs]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-mono">Loading Profile Data...</div>;

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 gap-4 p-4">
        <Navbar />
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <p className="text-gray-400 max-w-md text-center">
          We couldn't find a profile for this user.
          {debugError && <span className="block mt-2 text-xs font-mono bg-gray-900 p-2 rounded border border-red-900">{debugError}</span>}
        </p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Go Home</button>
      </div>
    );
  }

  const featuredRepos = profile.participated_repos || [];

  const handleNextCarousel = () => {
    if (featuredRepos.length > 3) {
      setCarouselIndex((prev) => (prev + 1) % (featuredRepos.length - 2));
    }
  };

  const handlePrevCarousel = () => {
    if (featuredRepos.length > 3) {
      setCarouselIndex((prev) => (prev - 1 + (featuredRepos.length - 2)) % (featuredRepos.length - 2));
    }
  };

  const visibleRepos = featuredRepos.length > 3
    ? featuredRepos.slice(carouselIndex, carouselIndex + 3)
    : featuredRepos;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Navbar />

      {/* Background visual elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="pt-24 pb-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* HEADER SECTION - Glassmorphism */}
          <div className="relative bg-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] rounded-3xl p-8 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[100px] -z-10" />

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group self-center md:self-auto">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black overflow-hidden shadow-2xl relative z-10 bg-gray-900 flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={64} className="text-gray-500" />
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#a855f7] to-[#00ffd5] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-20 border border-[#09090b] whitespace-nowrap shadow-[0_0_15px_rgba(0,255,213,0.3)] transition-all duration-300">
                  {profile.custom_title || profile.role || "Member"}
                </div>
              </div>

              <div className="flex-1 space-y-4 pt-2 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight" style={{ textShadow: '0 0 20px rgba(0, 255, 213, 0.2)' }}>
                      {profile.name || "Unnamed Member"}
                    </h1>
                    <p className="text-cyan-400 font-mono text-sm mt-1">@{profile.username}</p>
                  </div>

                  {profile.can_edit && (
                    <button
                      onClick={() => navigate(`/profile-setup?edit=${profile.username}`)}
                      className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-zinc-800 hover:border-zinc-700"
                    >
                      <Edit2 size={14} /> Edit Profile
                    </button>
                  )}
                </div>

                {profile.bio && <p className="text-zinc-300 leading-relaxed max-w-2xl text-sm">{profile.bio}</p>}

                {/* Social Links Row */}
                {(() => {
                  const githubUrl = profile.gh_url || profile.github_url;
                  const linkedinUrl = profile.li_url || profile.linkedin_url;
                  const instagramUrl = profile.ig_url || profile.instagram_url;

                  if (!githubUrl && !linkedinUrl && !instagramUrl) return null;

                  return (
                    <div className="flex flex-wrap gap-2.5 pt-2 justify-center md:justify-start">
                      {githubUrl && (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs font-mono text-zinc-300 hover:text-white transition-all border border-white/[0.05]"
                        >
                          <Github size={12} /> GitHub
                        </a>
                      )}
                      {linkedinUrl && (
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs font-mono text-zinc-300 hover:text-blue-400 transition-all border border-white/[0.05]"
                        >
                          <Linkedin size={12} /> LinkedIn
                        </a>
                      )}
                      {instagramUrl && (
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs font-mono text-zinc-300 hover:text-pink-400 transition-all border border-white/[0.05]"
                        >
                          <Instagram size={12} /> Instagram
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* STATS GRID - Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] rounded-3xl p-6 backdrop-blur-md transition-all duration-300 shadow-xl">
              <h3 className="text-md font-bold text-zinc-200 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs"><GitCommit size={16} className="text-cyan-400" /> Contributions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-xl border border-white/[0.05]">
                  <p className="text-3xl font-mono font-bold text-white">{profile.total_commits || 0}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Total Commits</p>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/[0.05]">
                  <p className="text-3xl font-mono font-bold text-white">{profile.total_prs || 0}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Pull Requests</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.01] border border-white/[0.08] hover:border-white/[0.15] rounded-3xl p-6 backdrop-blur-md transition-all duration-300 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-md font-bold text-zinc-200 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs"><Code size={16} className="text-[#a855f7]" /> Active Repositories</h3>
                {featuredRepos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {featuredRepos.map((repo: any, idx: number) => (
                      <a
                        key={idx}
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/[0.05] hover:border-[#a855f7]/50 text-xs font-mono text-zinc-300 hover:text-white transition-all"
                      >
                        {repo.name}
                        <GitPullRequest size={12} className="text-zinc-600" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-xs italic">No active repositories detected yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* FEATURED / SHOWCASE PROJECTS CAROUSEL */}
          {featuredRepos.length > 0 && (
            <div className="bg-white/[0.01] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Star size={14} className="text-[#00ffd5]" /> Showcase Projects
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Top repositories this user is proud of contributing to.</p>
                </div>
                {featuredRepos.length > 3 && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={handlePrevCarousel}
                      className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNextCarousel}
                      className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {visibleRepos.map((repo: any, idx: number) => (
                  <motion.a
                    key={idx}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col justify-between bg-black/40 border border-white/[0.05] hover:border-[#00ffd5]/40 rounded-2xl p-4 transition-all group h-36"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-mono font-bold text-sm text-zinc-200 group-hover:text-[#00ffd5] transition-colors truncate">{repo.name}</span>
                        <Code size={12} className="text-zinc-600 flex-shrink-0" />
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-2 leading-relaxed">
                        {repo.description || "Active project contribution. Dedicated development and open-source involvement."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 font-mono">
                      <span className="bg-white/5 px-2 py-0.5 rounded text-zinc-300">
                        {repo.language || 'Code'}
                      </span>
                      {repo.stars !== undefined && (
                        <span className="flex items-center gap-1 text-[#00ffd5]">
                          <Star size={10} fill="currentColor" /> {repo.stars}
                        </span>
                      )}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {/* MAIN BODY LAYOUT: TIMELINE & BLOGS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* TIMELINE SECTION (Left/Main, spans 2 cols) */}
            <div className="md:col-span-2 bg-white/[0.01] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-cyan-400" /> Milestones & Journey
              </h3>

              <div className="relative border-l border-white/[0.08] pl-6 ml-3 space-y-6">
                {milestones.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <span className={`absolute -left-[37px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full border ${item.color} shadow-lg z-10`}>
                        <IconComponent size={10} />
                      </span>

                      <div className="space-y-1 bg-black/20 p-4 rounded-2xl border border-white/[0.03] hover:border-white/[0.08] transition-all">
                        <span className="text-[10px] font-mono text-zinc-500">{item.date}</span>
                        <h4 className="text-sm font-bold text-zinc-200">{item.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* AUTHORED BLOGS SECTION (Right, spans 1 col) */}
            <div className="bg-white/[0.01] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-[#a855f7]" /> Authored Blogs
              </h3>

              {blogs.length > 0 ? (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {blogs.map((blog) => (
                    <a
                      key={blog.id}
                      href={`/blogs?id=${blog.id}`}
                      className="block bg-black/40 border border-white/[0.04] hover:border-[#a855f7]/40 rounded-2xl overflow-hidden group transition-all"
                    >
                      {blog.cover_image_url && (
                        <div className="h-20 w-full overflow-hidden relative">
                          <img src={blog.cover_image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                      )}
                      <div className="p-3 space-y-1">
                        <h4 className="text-xs font-bold text-zinc-200 line-clamp-2 group-hover:text-[#a855f7] transition-colors">{blog.title}</h4>
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono pt-1">
                          <span>{new Date(blog.published_at || blog.created_at).toLocaleDateString()}</span>
                          <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Read Article</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/[0.05] rounded-2xl h-48 bg-black/10">
                  <BookOpen size={24} className="text-zinc-700 mb-2" />
                  <p className="text-zinc-500 text-xs">No blogs published yet.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;