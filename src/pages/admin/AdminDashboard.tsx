import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Users, Calendar, BarChart3, Settings, Shield, Loader2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import AdminCard from '../../components/AdminCard';
import { supabase } from '../../supabaseClient';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [pendingBlogsCount, setPendingBlogsCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/');
        return;
      }

      // Check role
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error || !data || (data.role !== 'admin' && data.role !== 'semi_admin')) {
        navigate('/');
        return;
      }

      setUserRole(data.role);
      setIsAdmin(true);

      // Fetch pending blogs count
      try {
        const { data: pendingData } = await supabase.rpc('get_pending_blogs');
        if (pendingData) {
          setPendingBlogsCount(pendingData.length);
        }
      } catch {
        // Fallback - try direct query
        const { count } = await supabase
          .from('blogs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        if (count) setPendingBlogsCount(count);
      }

      setIsLoading(false);
    };

    checkAdmin();
  }, [navigate]);

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
      title: 'Member Management',
      description: 'View, edit, and manage club member profiles and permissions.',
      icon: Users,
      to: '/admin/members',
      color: 'cyan',
      available: false
    },
    {
      title: 'Event Management',
      description: 'Create, edit, and manage upcoming club events.',
      icon: Calendar,
      to: '/admin/events',
      color: 'yellow',
      available: false
    },
    {
      title: 'Analytics',
      description: 'View site statistics, engagement metrics, and growth trends.',
      icon: BarChart3,
      to: '/admin/analytics',
      color: 'green',
      available: false
    },
    {
      title: 'Settings',
      description: 'Configure site settings, notifications, and preferences.',
      icon: Settings,
      to: '/admin/settings',
      color: 'blue',
      available: false
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <span className="text-gray-400">Verifying access...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black pt-20">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Shield size={24} className="text-cyan-400" />
              </div>
              <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">
                {userRole === 'admin' ? 'Administrator' : 'Semi-Admin'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-3">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Manage content, review submissions, and oversee community activities from one central location.
            </p>
          </motion.div>

          {/* Modules Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {adminModules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
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
                  <div className="relative glass p-6 rounded-2xl border border-white/5 opacity-50 cursor-not-allowed">
                    {/* Coming Soon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10">
                      <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-medium rounded-full border border-gray-700">
                        Coming Soon
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gray-800/50 rounded-xl text-gray-600">
                        <module.icon size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-600">{module.title}</h3>
                    </div>
                    <p className="text-gray-600">{module.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats (optional future enhancement) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 glass rounded-2xl border border-white/10"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Quick Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-black/30 rounded-xl">
                <p className="text-2xl font-bold text-purple-400">{pendingBlogsCount}</p>
                <p className="text-gray-500 text-sm">Pending Blogs</p>
              </div>
              <div className="p-4 bg-black/30 rounded-xl">
                <p className="text-2xl font-bold text-gray-600">--</p>
                <p className="text-gray-500 text-sm">Total Members</p>
              </div>
              <div className="p-4 bg-black/30 rounded-xl">
                <p className="text-2xl font-bold text-gray-600">--</p>
                <p className="text-gray-500 text-sm">Active Events</p>
              </div>
              <div className="p-4 bg-black/30 rounded-xl">
                <p className="text-2xl font-bold text-gray-600">--</p>
                <p className="text-gray-500 text-sm">This Week Views</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
