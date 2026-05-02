import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, Search, Save, User, Shield,
  CheckCircle, AlertCircle, X, Award
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { supabase } from '../../supabaseClient';

interface Member {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar_url: string | null;
  custom_title: string | null;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function MembersAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [badgeValues, setBadgeValues] = useState<Record<string, string>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const navigate = useNavigate();

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error || !data || (data.role !== 'admin' && data.role !== 'semi_admin')) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchMembers();
    };

    checkAdminAndFetch();
  }, [navigate]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, role, avatar_url, custom_title')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const fetched = data || [];
      setMembers(fetched);

      const initial: Record<string, string> = {};
      fetched.forEach(m => {
        initial[m.id] = m.custom_title || '';
      });
      setBadgeValues(initial);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBadge = async (member: Member) => {
    const newBadge = badgeValues[member.id]?.trim() || '';

    if (newBadge === (member.custom_title || '')) return;

    setSavingIds(prev => new Set(prev).add(member.id));
    try {
      const { error } = await supabase.rpc('admin_assign_badge', {
        target_user_id: member.id,
        new_badge: newBadge || null,
      });

      if (error) throw error;

      setMembers(prev =>
        prev.map(m =>
          m.id === member.id ? { ...m, custom_title: newBadge || null } : m
        )
      );
      addToast('success', `Badge updated for ${member.name || member.username}`);
    } catch (err: any) {
      console.error('Error saving badge:', err);
      addToast('error', err.message || 'Failed to update badge');
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    }
  };

  const filteredMembers = searchQuery
    ? members.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members;

  const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: 'Admin', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    semi_admin: { label: 'Semi-Admin', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    member: { label: 'Member', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black pt-20">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        {/* Toast notifications */}
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-xl text-sm ${
                toast.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {toast.message}
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-2 opacity-60 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Shield size={22} className="text-cyan-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-white">
                Member Management
              </h1>
            </div>
            <p className="text-gray-400">
              Assign custom badges to members. These appear as titles on their profile pages.
            </p>
          </motion.div>

          {/* Search & stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User size={14} />
              <span>{filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>

          {/* Members grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                <span className="text-gray-400">Loading members...</span>
              </div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <User size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No members match your search.' : 'No members found.'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMembers.map((member, index) => {
                const role = roleConfig[member.role] || roleConfig.member;
                const isSaving = savingIds.has(member.id);
                const hasChanged = (badgeValues[member.id] ?? '').trim() !== (member.custom_title || '');

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.6) }}
                    className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors"
                  >
                    {/* User info row */}
                    <div className="flex items-center gap-3 mb-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name || member.username}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-800"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-gray-700">
                            <User size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Name & username */}
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-semibold text-sm truncate">
                          {member.name || 'Unnamed'}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          @{member.username || '—'}
                        </p>
                      </div>

                      {/* Role badge */}
                      <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border ${role.bg} ${role.color}`}>
                        {role.label}
                      </span>
                    </div>

                    {/* Current badge display */}
                    {member.custom_title && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Award size={12} className="text-purple-400 shrink-0" />
                        <span className="text-xs text-purple-300 font-medium truncate">
                          {member.custom_title}
                        </span>
                      </div>
                    )}

                    {/* Badge input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={badgeValues[member.id] ?? ''}
                        onChange={(e) =>
                          setBadgeValues(prev => ({ ...prev, [member.id]: e.target.value }))
                        }
                        placeholder="e.g. Club Lead, Core Dev"
                        className="flex-1 min-w-0 px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition-colors"
                      />
                      <button
                        onClick={() => handleSaveBadge(member)}
                        disabled={isSaving || !hasChanged}
                        className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          hasChanged && !isSaving
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-cyan-500/20'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isSaving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Save
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{members.length}</p>
              <p className="text-gray-500 text-sm">Total Members</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-400">
                {members.filter(m => m.role === 'admin').length}
              </p>
              <p className="text-gray-500 text-sm">Admins</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-orange-400">
                {members.filter(m => m.role === 'semi_admin').length}
              </p>
              <p className="text-gray-500 text-sm">Semi-Admins</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-purple-400">
                {members.filter(m => m.custom_title).length}
              </p>
              <p className="text-gray-500 text-sm">With Badges</p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
