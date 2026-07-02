import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, BarChart3, GitPullRequest, FolderGit2, Calendar, CheckCircle2, Star, GitFork, Check, Clock, X } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { supabase } from '../../supabaseClient';

type TabType = 'github' | 'projects' | 'attendance';

interface PRActivity {
  title: string;
  state: string;
  merged_at: string | null;
  created_at: string;
  repo_name: string;
  author_name: string;
}

interface TopProject {
  id: number;
  name: string;
  stars: number;
  forks: number;
  difficulty: string;
}

interface SessionAttendance {
  id: string;
  name: string;
  session_date: string;
  present_count: number;
  total_count: number;
}

export default function AnalyticsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('github');
  
  // GitHub Stats
  const [totalPRs, setTotalPRs] = useState(0);
  const [mergedPRs, setMergedPRs] = useState(0);
  const [recentPRs, setRecentPRs] = useState<PRActivity[]>([]);
  
  // Project Stats
  const [totalRepos, setTotalRepos] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [totalForks, setTotalForks] = useState(0);
  const [difficultyCount, setDifficultyCount] = useState({ beginner: 0, intermediate: 0, advanced: 0 });
  const [topProjects, setTopProjects] = useState<TopProject[]>([]);
  
  // Attendance Stats
  const [totalSessions, setTotalSessions] = useState(0);
  const [overallAttendanceRate, setOverallAttendanceRate] = useState(0);
  const [sessionAttendanceList, setSessionAttendanceList] = useState<SessionAttendance[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndInit = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/');
        return;
      }

      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', session.user.id)
        .single();

      if (userErr || !user || user.role !== 'admin') {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await loadAnalyticsData();
      setIsLoading(false);
    };

    checkAdminAndInit();
  }, [navigate]);

  const loadAnalyticsData = async () => {
    try {
      // --- 1. GITHUB DATA ---
      // PR counts
      const { count: prCount } = await supabase
        .from('pull_requests')
        .select('*', { count: 'exact', head: true });
      
      const { count: mergedCount } = await supabase
        .from('pull_requests')
        .select('*', { count: 'exact', head: true })
        .not('merged_at', 'is', null);

      setTotalPRs(prCount || 0);
      setMergedPRs(mergedCount || 0);

      // Recent PR activities
      const { data: prData } = await supabase
        .from('pull_requests')
        .select(`
          title, state, merged_at, created_at,
          repositories (name),
          users (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const formattedPRs: PRActivity[] = (prData || []).map((pr: any) => ({
        title: pr.title || 'Untitled Pull Request',
        state: pr.state || 'open',
        merged_at: pr.merged_at,
        created_at: pr.created_at,
        repo_name: pr.repositories?.name || 'Unknown Repository',
        author_name: pr.users?.name || 'Anonymous Member'
      }));
      setRecentPRs(formattedPRs);

      // --- 2. PROJECT DATA ---
      const { data: repoData } = await supabase
        .from('repositories')
        .select('id, name, stars, forks, difficulty, is_archived, is_visible')
        .eq('is_visible', true);

      if (repoData) {
        const activeRepos = repoData.filter(r => !r.is_archived);
        setTotalRepos(activeRepos.length);
        
        let starsSum = 0;
        let forksSum = 0;
        const diffs = { beginner: 0, intermediate: 0, advanced: 0 };

        activeRepos.forEach(r => {
          starsSum += r.stars || 0;
          forksSum += r.forks || 0;
          const diff = (r.difficulty || 'intermediate') as keyof typeof diffs;
          if (diff in diffs) {
            diffs[diff]++;
          }
        });

        setTotalStars(starsSum);
        setTotalForks(forksSum);
        setDifficultyCount(diffs);

        // Top projects by stars
        const sortedProjects = [...activeRepos]
          .sort((a, b) => (b.stars || 0) - (a.stars || 0))
          .slice(0, 5)
          .map(r => ({
            id: Number(r.id),
            name: r.name,
            stars: r.stars || 0,
            forks: r.forks || 0,
            difficulty: r.difficulty || 'intermediate'
          }));
        setTopProjects(sortedProjects);
      }

      // --- 3. ATTENDANCE DATA ---
      const { data: sessionRows } = await supabase
        .from('attendance_sessions')
        .select(`
          id,
          name,
          session_date,
          attendance_records (
            status
          )
        `)
        .order('session_date', { ascending: false });

      if (sessionRows) {
        setTotalSessions(sessionRows.length);

        const sessionAttendance: SessionAttendance[] = [];
        let totalPresent = 0;
        let totalRecords = 0;

        for (const session of sessionRows) {
          const records = (session as any).attendance_records || [];
          const presentCount = records.filter((r: any) => r.status === 'present' || r.status === 'late').length;
          
          sessionAttendance.push({
            id: session.id,
            name: session.name,
            session_date: session.session_date,
            present_count: presentCount,
            total_count: records.length
          });

          totalPresent += presentCount;
          totalRecords += records.length;
        }

        setSessionAttendanceList(sessionAttendance);
        setOverallAttendanceRate(totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0);
      }

    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#09090b] text-white pt-20 pb-16 font-sans">
        {/* Subtle Background Surface Grid */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-semibold uppercase tracking-wider mb-3"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold tracking-tight font-heading text-white">
              System Analytics
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Audit code repository commits, pull request status parameters, and weekly syncing roll-call analytics.
            </p>
          </motion.div>

          {/* Action Selector Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2.5 mb-8 border-b border-zinc-950 pb-5"
          >
            <button
              onClick={() => setActiveTab('github')}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 ${
                activeTab === 'github'
                  ? 'bg-white border-white text-black font-semibold'
                  : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <GitPullRequest size={13} />
              GitHub Activity Trends
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'bg-white border-white text-black font-semibold'
                  : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FolderGit2 size={13} />
              Project Showcase Distribution
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 ${
                activeTab === 'attendance'
                  ? 'bg-white border-white text-black font-semibold'
                  : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar size={13} />
              Attendance Rates
            </button>
          </motion.div>

          {/* Tab Viewports */}
          <AnimatePresence mode="wait">
            {activeTab === 'github' && (
              <motion.div
                key="github"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Stats Summary strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-md">
                    <p className="text-3xl font-extrabold text-white">{totalPRs}</p>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">Total Pull Requests</p>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-md">
                    <p className="text-3xl font-extrabold text-green-400">{mergedPRs}</p>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">Merged PRs</p>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-md">
                    <p className="text-3xl font-extrabold text-cyan-400">
                      {totalPRs > 0 ? Math.round((mergedPRs / totalPRs) * 100) : 0}%
                    </p>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">PR Merge Rate</p>
                  </div>
                </div>

                {/* Recent PR Activity table */}
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
                    Recent Pull Request Activity
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] uppercase font-bold tracking-widest">
                          <th className="pb-3 pl-1 font-bold">Pull Request</th>
                          <th className="pb-3 font-bold">Repository</th>
                          <th className="pb-3 font-bold">Contributor</th>
                          <th className="pb-3 font-bold">Status</th>
                          <th className="pb-3 text-right font-bold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/50">
                        {recentPRs.map((pr, idx) => (
                          <tr key={idx} className="group hover:bg-zinc-900/10">
                            <td className="py-3 pl-1 font-semibold text-white max-w-xs truncate">{pr.title}</td>
                            <td className="py-3 text-zinc-400">{pr.repo_name}</td>
                            <td className="py-3 text-zinc-400">@{pr.author_name}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                pr.state === 'merged' || pr.merged_at
                                  ? 'bg-green-500/10 text-green-400'
                                  : pr.state === 'closed'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-yellow-500/10 text-yellow-400'
                              }`}>
                                {pr.state}
                              </span>
                            </td>
                            <td className="py-3 text-right text-zinc-500">
                              {new Date(pr.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                        {recentPRs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-zinc-500">
                              No PR data synchronized.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Stats Summary strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-extrabold text-white">{totalRepos}</p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">Total Repositories</p>
                    </div>
                    <FolderGit2 className="text-zinc-800" size={32} />
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-extrabold text-yellow-500">{totalStars}</p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">Cumulative Stars</p>
                    </div>
                    <Star className="text-zinc-800" size={32} />
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-extrabold text-cyan-400">{totalForks}</p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">Cumulative Forks</p>
                    </div>
                    <GitFork className="text-zinc-800" size={32} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Difficulty Breakdown */}
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
                      Showcase Level Distribution
                    </h3>
                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Beginner Projects</span>
                          <span className="font-semibold text-white">{difficultyCount.beginner}</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: `${totalRepos > 0 ? (difficultyCount.beginner / totalRepos) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Intermediate Projects</span>
                          <span className="font-semibold text-white">{difficultyCount.intermediate}</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-full"
                            style={{ width: `${totalRepos > 0 ? (difficultyCount.intermediate / totalRepos) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Advanced Projects</span>
                          <span className="font-semibold text-white">{difficultyCount.advanced}</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-red-500 h-full rounded-full"
                            style={{ width: `${totalRepos > 0 ? (difficultyCount.advanced / totalRepos) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Projects */}
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                      Top Starred Showcases
                    </h3>
                    <div className="divide-y divide-zinc-900/50 text-xs">
                      {topProjects.map((p, idx) => (
                        <div key={p.id} className="py-2.5 flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{p.name}</p>
                            <p className="text-[10px] text-zinc-500 capitalize">{p.difficulty} Difficulty</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="flex items-center gap-1 text-yellow-500 text-[10px] font-bold">
                              <Star size={11} className="fill-yellow-500" />
                              {p.stars}
                            </span>
                            <span className="flex items-center gap-1 text-cyan-400 text-[10px] font-bold">
                              <GitFork size={11} />
                              {p.forks}
                            </span>
                          </div>
                        </div>
                      ))}
                      {topProjects.length === 0 && (
                        <p className="text-center py-6 text-zinc-500">No project stats available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Stats Summary strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-extrabold text-white">{totalSessions}</p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">Total Audit Sessions</p>
                    </div>
                    <Calendar className="text-zinc-800" size={32} />
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-extrabold text-green-400">{overallAttendanceRate}%</p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">Avg Roster Attendance</p>
                    </div>
                    <CheckCircle2 className="text-zinc-800" size={32} />
                  </div>
                </div>

                {/* Session breakdown list */}
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
                    Syncing Session Participation Logs
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] uppercase font-bold tracking-widest">
                          <th className="pb-3 pl-1 font-bold">Session Name</th>
                          <th className="pb-3 font-bold">Session Date</th>
                          <th className="pb-3 font-bold">Audited Members</th>
                          <th className="pb-3 font-bold">Present / Late Count</th>
                          <th className="pb-3 text-right font-bold">Participation Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/50">
                        {sessionAttendanceList.map(s => {
                          const rate = s.total_count > 0 ? Math.round((s.present_count / s.total_count) * 100) : 0;
                          return (
                            <tr key={s.id} className="group hover:bg-zinc-900/10">
                              <td className="py-3 pl-1 font-semibold text-white">{s.name}</td>
                              <td className="py-3 text-zinc-400">
                                {new Date(s.session_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="py-3 text-zinc-400">{s.total_count} members</td>
                              <td className="py-3 text-zinc-400">{s.present_count} present</td>
                              <td className="py-3 text-right">
                                <span className={`font-bold ${
                                  rate >= 75 ? 'text-green-400' : rate >= 50 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {rate}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {sessionAttendanceList.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-zinc-500">
                              No attendance sessions registered.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}
