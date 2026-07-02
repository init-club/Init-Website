/**
 To people who handle this codebase in the future. This is the admin panel for managing members and their scores.

 1) All-Time Score Calculation: The leaderboard shows TOTAL all-time points, not just the current month.
    This is computed client-side by reducing all 'contribution_stats' rows for a user:
      member.contribution_stats?.reduce((acc, s) => acc + (s.score || 0), 0)
    Each row in 'contribution_stats' represents one month. The sum of all rows = all-time score.
    Do NOT try to store a single "total score" column in the database — it would get out of sync with the monthly rows.

 2) Score Overrides: Admins can add bonus/penalty points to a member's score. This override targets the CURRENT
    month's row in 'contribution_stats' (it adds a 'score_adjustment' field). The override does NOT rewrite
    historical months. If an override is applied today, it appears in this month's row and naturally folds into
    the all-time sum on the next render.

 3) SWR Caching: Member data is fetched using 'useSWR' with the 'fetchAdminMembers' fetcher. SWR caches the
    response and revalidates in the background. After a score override is saved, the cache is manually mutated
    via the 'mutate' function to reflect the change instantly without a full page refresh.

 4) Optimistic UI for Overrides: When an override is saved, the member's 'contribution_stats' array is mutated
    in local state immediately (before the DB write confirms). This makes the UI feel instant. If the DB write
    fails, an error toast is shown but the local state is NOT rolled back — a page refresh will correct it.
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Search, Save, User, Shield,
  CheckCircle, AlertCircle, X, Award, CheckCircle2, ChevronRight, ToggleLeft
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { supabase } from '../../supabaseClient';
import useSWR from 'swr';
import { fetchAdminMembers } from '../../utils/fetchers';
import { useAuth } from '../../context/AuthContext';

interface ContributionStat {
  month: number;
  year: number;
  score: number;
  score_adjustment: number;
  adjustment_reason: string | null;
}

interface Member {
  id: string;
  auth_user_id: string | null;
  username: string;
  name: string;
  role: string;
  avatar_url: string | null;
  custom_title: string | null;
  contribution_stats?: ContributionStat[];
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function MembersAdmin() {
  const { session, isAdmin, isLoading: isAuthLoading } = useAuth();
  const currentUserId = session?.user?.id || null;
  const navigate = useNavigate();

  // Load roster data via SWR cache
  const [members, setMembers] = useState<Member[]>([]);
  const { data: cachedMembers, error: membersError, mutate } = useSWR(isAdmin ? 'admin_members' : null, fetchAdminMembers);

  useEffect(() => {
    if (cachedMembers) {
      setMembers(cachedMembers);
    }
  }, [cachedMembers]);

  const [activeTab, setActiveTab] = useState<'members' | 'whitelisted'>('members');
  const [searchQuery, setSearchQuery] = useState('');

  // Whitelisting State
  const [newWhitelistUsername, setNewWhitelistUsername] = useState('');
  const [isWhitelisting, setIsWhitelisting] = useState(false);

  // Editing States
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [badgeValues, setBadgeValues] = useState<Record<string, string>>({});

  // Leaderboard Override States
  const [openOverrideId, setOpenOverrideId] = useState<string | null>(null);
  const [adjustmentValues, setAdjustmentValues] = useState<Record<string, number>>({});
  const [adjustmentReasons, setAdjustmentReasons] = useState<Record<string, string>>({});

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isAuthLoading, navigate]);

  useEffect(() => {
    if (members && members.length > 0) {
      const initialBadges: Record<string, string> = {};
      members.forEach((m: Member) => {
        initialBadges[m.id] = m.custom_title || '';
      });
      setBadgeValues(initialBadges);
    }
  }, [members]);

  const isLoading = isAuthLoading || (!members.length && !membersError);

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

  const handlePromoteMember = async (member: Member, newRole: string) => {
    setSavingIds(prev => new Set(prev).add(member.id));
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', member.id);

      if (error) throw error;

      setMembers(prev =>
        prev.map(m =>
          m.id === member.id ? { ...m, role: newRole } : m
        )
      );
      addToast('success', `Role updated to ${newRole} for ${member.name || member.username}`);
    } catch (err: any) {
      console.error('Error promoting member:', err);
      addToast('error', err.message || 'Failed to update member role');
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    }
  };

  const handleManualWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = newWhitelistUsername.trim();
    if (!username) return;

    setIsWhitelisting(true);
    try {
      const { error } = await supabase.functions.invoke('github-lookup-user', {
        body: { github_username: username }
      });

      if (error) throw error;

      addToast('success', `Successfully whitelisted @${username}`);
      setNewWhitelistUsername('');
      mutate();
    } catch (err: any) {
      console.error('Error whitelisting user:', err);
      addToast('error', err.message || 'Failed to whitelist user');
    } finally {
      setIsWhitelisting(false);
    }
  };

  const handleSavePointsOverride = async (member: Member) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const adjustment = adjustmentValues[member.id] || 0;
    const reason = adjustmentReasons[member.id]?.trim() || '';

    setSavingIds(prev => new Set(prev).add(member.id));
    try {
      // 1. Fetch current sync statistics for the month
      const { data: statsRow } = await supabase
        .from('contribution_stats')
        .select('commit_count, pr_count')
        .eq('user_id', member.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

      const commitCount = statsRow?.commit_count || 0;
      const prCount = statsRow?.pr_count || 0;
      const baseScore = (commitCount * 1) + (prCount * 10);
      const finalScore = baseScore + adjustment;

      // 2. Upsert the contribution stats
      const { error } = await supabase
        .from('contribution_stats')
        .upsert({
          user_id: member.id,
          month: currentMonth,
          year: currentYear,
          commit_count: commitCount,
          pr_count: prCount,
          score_adjustment: adjustment,
          adjustment_reason: reason || null,
          score: finalScore,
          last_updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,month,year'
        });

      if (error) throw error;

      // 3. Update local state
      setMembers(prev =>
        prev.map(m => {
          if (m.id !== member.id) return m;
          const stats = m.contribution_stats || [];
          const index = stats.findIndex(s => s.month === currentMonth && s.year === currentYear);
          const newStat = {
            month: currentMonth,
            year: currentYear,
            score: finalScore,
            score_adjustment: adjustment,
            adjustment_reason: reason || null
          };
          const newStats = [...stats];
          if (index >= 0) {
            newStats[index] = newStat;
          } else {
            newStats.push(newStat);
          }
          return { ...m, contribution_stats: newStats };
        })
      );

      addToast('success', `Leaderboard override saved for ${member.name || member.username}`);
      setOpenOverrideId(null);
    } catch (err: any) {
      console.error('Error saving score override:', err);
      addToast('error', err.message || 'Failed to override score');
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    }
  };

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearchQuery]);

  const tabFilteredMembers = members.filter(m => {
    if (activeTab === 'members') {
      return m.auth_user_id !== null;
    } else {
      return m.auth_user_id === null;
    }
  });

  const filteredMembers = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return tabFilteredMembers;
    const q = debouncedSearchQuery.toLowerCase();
    return tabFilteredMembers.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q)
    );
  }, [tabFilteredMembers, debouncedSearchQuery]);

  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredMembers.slice(startIndex, startIndex + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));

  const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: 'Admin', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
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
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg text-xs font-medium ${toast.type === 'success'
                ? 'bg-zinc-950/80 border-green-500/20 text-green-400'
                : 'bg-zinc-950/80 border-red-500/20 text-red-400'
                }`}
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
              Member Management
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Verify registrations, appoint admins, assign titles, and apply leaderboard score overrides.
            </p>
          </motion.div>

          {/* Sub Navigation Tabs and whitelist input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-zinc-950 pb-5 mb-8"
          >
            <div className="inline-flex rounded-lg border border-zinc-900 p-0.5 bg-zinc-950 self-start">
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'members'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                Registered Members ({members.filter(m => m.auth_user_id !== null).length})
              </button>
              <button
                onClick={() => setActiveTab('whitelisted')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'whitelisted'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                Whitelist Database ({members.filter(m => m.auth_user_id === null).length})
              </button>
            </div>

            {/* Manual Whitelist Form */}
            <form onSubmit={handleManualWhitelist} className="flex gap-2 items-center">
              <input
                type="text"
                value={newWhitelistUsername}
                onChange={(e) => setNewWhitelistUsername(e.target.value)}
                placeholder="GitHub username"
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-white placeholder-zinc-700 focus:border-zinc-800 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isWhitelisting}
                className="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5"
              >
                {isWhitelisting ? <Loader2 size={12} className="animate-spin" /> : 'Whitelist User'}
              </button>
            </form>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-white placeholder-zinc-700 focus:border-zinc-850 focus:outline-none transition-colors"
              />
            </div>
            <span className="text-zinc-500 text-xs font-semibold">
              {filteredMembers.length} record{filteredMembers.length !== 1 ? 's' : ''}
            </span>
          </motion.div>

          {/* Members grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-zinc-850 animate-spin" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20"
            >
              <User size={36} className="mx-auto text-zinc-850 mb-3" />
              <p className="text-zinc-500 text-xs">
                {searchQuery ? 'No records match your search query.' : 'No members registered under this tab.'}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedMembers.map((member, index) => {
                  const role = roleConfig[member.role] || roleConfig.member;
                  const isSaving = savingIds.has(member.id);
                  const hasChanged = (badgeValues[member.id] ?? '').trim() !== (member.custom_title || '');

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.4) }}
                      className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-850 transition-colors backdrop-blur-md flex flex-col justify-between"
                    >
                      <div>
                        {/* User Header */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {member.avatar_url ? (
                              <img
                                src={member.avatar_url}
                                alt={member.name || member.username}
                                className="w-10 h-10 rounded-full object-cover border border-zinc-850 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">
                                  {member.name?.charAt(0) || member.username?.charAt(0) || 'U'}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-sm truncate">
                                {member.name || 'Unnamed'}
                              </p>
                              <p className="text-zinc-500 text-xs truncate">
                                @{member.username || '—'}
                              </p>
                            </div>
                          </div>

                          {/* Role selection dropdown */}
                          {member.auth_user_id && member.auth_user_id !== currentUserId ? (
                            <Select
                              value={member.role}
                              onValueChange={(v) => handlePromoteMember(member, v)}
                              disabled={isSaving}
                            >
                              <SelectTrigger className="h-6 px-2 text-[10px] font-semibold bg-zinc-950 border-zinc-800 text-zinc-400 rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${role.bg} ${role.color}`}>
                              {role.label}
                            </span>
                          )}
                        </div>

                        {/* Display custom Badge */}
                        {member.custom_title && (
                          <div className="flex items-center gap-1.5 mb-3 bg-purple-500/5 border border-purple-500/10 px-2.5 py-1 rounded-lg self-start inline-flex">
                            <Award size={12} className="text-purple-400 shrink-0" />
                            <span className="text-[10px] text-purple-300 font-medium truncate">
                              {member.custom_title}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Member Controls (Only for whitelisted entries with active logins) */}
                      <div className="space-y-3.5 mt-2">
                        {/* Badge editor input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={badgeValues[member.id] ?? ''}
                            onChange={(e) =>
                              setBadgeValues(prev => ({ ...prev, [member.id]: e.target.value }))
                            }
                            className="flex-1 min-w-0 px-2.5 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-white text-xs placeholder-zinc-700 focus:border-zinc-800 focus:outline-none transition-colors"
                          />
                          <button
                            onClick={() => handleSaveBadge(member)}
                            disabled={isSaving || !hasChanged}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 ${hasChanged && !isSaving
                              ? 'bg-white text-black hover:bg-zinc-200'
                              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                              }`}
                          >
                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
                          </button>
                        </div>

                        {/* Score Override Adjuster collapsing block */}
                        {member.auth_user_id && (
                          <div className="pt-3 border-t border-zinc-900/60">
                            {openOverrideId === member.id ? (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-0.5">Override pts</label>
                                    <input
                                      type="number"
                                      placeholder="e.g. +50, -10"
                                      value={adjustmentValues[member.id] ?? 0}
                                      onChange={(e) => setAdjustmentValues(prev => ({
                                        ...prev,
                                        [member.id]: parseInt(e.target.value) || 0
                                      }))}
                                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-white text-xs focus:outline-none focus:border-zinc-800"
                                    />
                                  </div>
                                  <div className="flex-[1.5]">
                                    <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-0.5">Reason</label>
                                    <input
                                      type="text"
                                      placeholder="Adjustment Reason"
                                      value={adjustmentReasons[member.id] ?? ''}
                                      onChange={(e) => setAdjustmentReasons(prev => ({
                                        ...prev,
                                        [member.id]: e.target.value
                                      }))}
                                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-white text-xs focus:outline-none focus:border-zinc-800"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => setOpenOverrideId(null)}
                                    className="px-2.5 py-1 bg-transparent hover:bg-zinc-900 text-zinc-500 rounded-lg text-[10px] font-bold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSavePointsOverride(member)}
                                    className="px-3 py-1 bg-white text-black hover:bg-zinc-200 rounded-lg text-[10px] font-bold"
                                  >
                                    Save Points
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-500">
                                  All-Time Score: <strong className="text-white">{
                                    member.contribution_stats?.reduce((acc, s) => acc + (s.score || 0), 0) || 0
                                  } pts</strong>
                                  {(() => {
                                    const totalAdjustment = member.contribution_stats?.reduce((acc, s) => acc + (s.score_adjustment || 0), 0) || 0;
                                    if (totalAdjustment !== 0) {
                                      return (
                                        <span className="text-cyan-400 font-semibold ml-1">
                                          ({totalAdjustment > 0 ? '+' : ''}{totalAdjustment} Adj)
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </span>
                                <button
                                  onClick={() => {
                                    const currentStat = member.contribution_stats?.find(s => s.month === new Date().getMonth() + 1 && s.year === new Date().getFullYear());
                                    setAdjustmentValues(prev => ({ ...prev, [member.id]: currentStat?.score_adjustment || 0 }));
                                    setAdjustmentReasons(prev => ({ ...prev, [member.id]: currentStat?.adjustment_reason || '' }));
                                    setOpenOverrideId(member.id);
                                  }}
                                  className="text-zinc-400 hover:text-white font-semibold transition-colors"
                                >
                                  Adjust Score
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-950">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400 hover:bg-zinc-900 transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-mono text-zinc-500">
                    Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400 hover:bg-zinc-900 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
