import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Users, Calendar, BarChart3, Settings, Shield, Loader2, FolderGit2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import AdminCard from '../../components/admin/AdminCard';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface AdminModule {
  title: string;
  description: string;
  icon: typeof FileText;
  to: string;
  color: string;
  badge?: string | number;
  available: boolean;
}

export default function AdminDashboard() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingBlogsCount, setPendingBlogsCount] = useState<number>(0);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [totalRepos, setTotalRepos] = useState<number>(0);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [totalForms, setTotalForms] = useState<number>(0);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error'; message: string }[]>([]);
  const navigate = useNavigate();

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('github-sync');
      if (error) throw error;
      addToast('success', 'GitHub stats and repositories synced successfully!');
      
      // Refresh statistics after sync
      await fetchCounts();
    } catch (err: any) {
      console.error('Error triggering sync:', err);
      addToast('error', err.message || 'Failed to sync GitHub data');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const [blogsRes, membersRes, reposRes, sessionsRes, formsRes] = await Promise.all([
        supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('repositories').select('*', { count: 'exact', head: true }).eq('is_visible', true),
        supabase.from('attendance_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('forms').select('*', { count: 'exact', head: true })
      ]);

      if (blogsRes.count !== null) setPendingBlogsCount(blogsRes.count);
      if (membersRes.count !== null) setTotalMembers(membersRes.count);
      if (reposRes.count !== null) setTotalRepos(reposRes.count);
      if (sessionsRes.count !== null) setTotalSessions(sessionsRes.count);
      if (formsRes.count !== null) setTotalForms(formsRes.count);
    } catch (err) {
      console.error("Error fetching overview counts:", err);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAdmin) {
      navigate('/');
      return;
    }

    const initDashboard = async () => {
      await fetchCounts();
      setIsLoading(false);
    };

    initDashboard();
  }, [isAuthLoading, isAdmin, navigate]);

  const adminModules: AdminModule[] = [
    {
      title: 'Blog Reviews',
      description: 'Approve or reject community blog submissions before they go live.',
      icon: FileText,
      to: '/admin/blogs',
      color: 'purple',
      badge: pendingBlogsCount > 0 ? pendingBlogsCount : undefined,
      available: true
    },
    {
      title: 'Project Management',
      description: 'Manage active projects: set difficulty, status, and demo videos.',
      icon: FolderGit2,
      to: '/admin/projects',
      color: 'orange',
      available: true
    },
    {
      title: 'Member Management',
      description: 'View, edit, and manage club member profiles and permissions.',
      icon: Users,
      to: '/admin/members',
      color: 'cyan',
      available: true
    },
    {
      title: 'Attendance & Events',
      description: 'Create syncing sessions and record roll-call attendance.',
      icon: Calendar,
      to: '/admin/events',
      color: 'yellow',
      available: true
    },
    {
      title: 'Analytics',
      description: 'View site statistics, engagement metrics, and growth trends.',
      icon: BarChart3,
      to: '/admin/analytics',
      color: 'green',
      available: true
    },
    {
      title: 'Settings',
      description: 'Configure site settings, onboarding rules, and social links.',
      icon: Settings,
      to: '/admin/settings',
      color: 'blue',
      available: true
    },
    {
      title: 'Form Builder',
      description: 'Build custom forms, collect responses, and view analytics.',
      icon: FileText,
      to: '/admin/forms',
      color: 'teal',
      badge: totalForms > 0 ? totalForms : undefined,
      available: true
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

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

        {/* Dynamic Minimal Toasts */}
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-zinc-900 bg-zinc-950/80 backdrop-blur-md shadow-lg text-xs font-medium text-green-400"
            >
              <CheckCircle2 size={14} />
              {toast.message}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          >
            <div>
              <div className="flex items-center gap-2 mb-2 bg-zinc-900/50 border border-zinc-800/80 px-2.5 py-1 rounded-lg self-start inline-flex">
                <Shield size={12} className="text-zinc-400 shrink-0" />
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Club Management Panel
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight font-heading text-white">
                Admin Console
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Moderate content, manage active club rosters, coordinate syncing pipelines, and modify configurations.
              </p>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync GitHub'}
            </button>
          </motion.div>

          {/* Modules Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {adminModules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.4) }}
              >
                {module.available ? (
                  <AdminCard
                    title={module.title}
                    description={module.description}
                    icon={module.icon}
                    to={module.to}
                    color={module.color}
                    badge={module.badge}
                  />
                ) : (
                  <div className="relative bg-zinc-950/20 p-5 rounded-2xl border border-zinc-900/40 opacity-40 cursor-not-allowed">
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-0.5 bg-zinc-900 text-zinc-500 text-[9px] font-bold uppercase tracking-wider rounded-md border border-zinc-800">
                        Coming Soon
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="p-2 bg-zinc-900/60 border border-zinc-800 rounded-lg text-zinc-600">
                        <module.icon size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-400">{module.title}</h3>
                    </div>
                    <p className="text-zinc-650 text-xs leading-relaxed">{module.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Overview Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-md"
          >
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Overview Indicators
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl">
                <p className="text-2xl font-bold text-purple-400">{pendingBlogsCount}</p>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-1">Pending Blogs</p>
              </div>
              <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl">
                <p className="text-2xl font-bold text-cyan-400">{totalMembers}</p>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-1">Active Members</p>
              </div>
              <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl">
                <p className="text-2xl font-bold text-orange-400">{totalRepos}</p>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-1">Sync Repositories</p>
              </div>
              <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-xl">
                <p className="text-2xl font-bold text-yellow-400">{totalSessions}</p>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-1">Attendance Sessions</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
