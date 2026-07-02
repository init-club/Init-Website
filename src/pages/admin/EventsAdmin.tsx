import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Plus, Calendar, Trash2, CheckCircle2, AlertTriangle, Clock, X, Search, Check, Save } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { supabase } from '../../supabaseClient';
import useSWR from 'swr';
import { fetchAdminSessions, fetchAdminMembers } from '../../utils/fetchers';
import { useAuth } from '../../context/AuthContext';
import { logAuditAction } from '../../utils/auditLogger';
import ConfirmModal from '../../components/shared/modals/ConfirmModal';

interface Session {
  id: string;
  name: string;
  session_date: string;
  created_by: string | null;
}

interface Member {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
}

interface AttendanceRecord {
  user_id: string;
  status: 'present' | 'late' | 'absent';
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function EventsAdmin() {
  const { session: authSession, isAdmin, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Fetch data using SWR caches
  const { data: cachedSessions, mutate: mutateSessions } = useSWR(isAdmin ? 'admin_sessions' : null, fetchAdminSessions);
  const { data: cachedMembers } = useSWR(isAdmin ? 'admin_members' : null, fetchAdminMembers);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'late' | 'absent'>>({});
  
  // Creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCreating, setIsCreating] = useState(false);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [savingRecordId, setSavingRecordId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
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
    if (cachedSessions) {
      setSessions(cachedSessions);
      if (cachedSessions.length > 0 && !selectedSession) {
        setSelectedSession(cachedSessions[0]);
      }
    }
  }, [cachedSessions, selectedSession]);

  useEffect(() => {
    if (cachedMembers) {
      // Filter only whitelisted/active users for attendance roll-call
      const activeMembers = (cachedMembers as any[]).filter(m => m.auth_user_id !== null);
      setMembers(activeMembers);
    }
  }, [cachedMembers]);

  useEffect(() => {
    if (selectedSession) {
      fetchAttendance(selectedSession.id);
    }
  }, [selectedSession]);

  const isLoading = isAuthLoading || !cachedSessions || !cachedMembers;

  const fetchAttendance = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('user_id, status')
        .eq('session_id', sessionId);

      if (error) throw error;

      const recordMap: Record<string, 'present' | 'late' | 'absent'> = {};
      data?.forEach(r => {
        recordMap[r.user_id] = r.status as 'present' | 'late' | 'absent';
      });
      setAttendance(recordMap);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    fetchAttendance(session.id);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    setIsCreating(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authSession?.user.id)
        .single();

      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
          name: newSessionName.trim(),
          session_date: newSessionDate,
          created_by: user?.id || null
        })
        .select()
        .single();

      if (error) throw error;

      await logAuditAction(
        'CREATE_ATTENDANCE_SESSION',
        'attendance_sessions',
        data.id,
        null,
        { name: data.name, session_date: data.session_date }
      );

      addToast('success', `Created session: ${newSessionName}`);
      setNewSessionName('');
      setShowCreateModal(false);
      
      // Update session list and select the new session
      mutateSessions();
      setSessions(prev => [data, ...prev]);
      setSelectedSession(data);
      setAttendance({});
    } catch (err: any) {
      console.error('Error creating session:', err);
      addToast('error', err.message || 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setDeletingSessionId(sessionId);
  };

  const confirmDeleteSession = async () => {
    if (deletingSessionId === null) return;
    try {
      const { error } = await supabase
        .from('attendance_sessions')
        .delete()
        .eq('id', deletingSessionId);

      if (error) throw error;

      await logAuditAction(
        'DELETE_ATTENDANCE_SESSION',
        'attendance_sessions',
        deletingSessionId,
        { id: deletingSessionId },
        null
      );

      addToast('success', 'Session deleted successfully');
      mutateSessions();
      const updated = sessions.filter(s => s.id !== deletingSessionId);
      setSessions(updated);

      if (selectedSession?.id === deletingSessionId) {
        if (updated.length > 0) {
          setSelectedSession(updated[0]);
          fetchAttendance(updated[0].id);
        } else {
          setSelectedSession(null);
          setAttendance({});
        }
      }
    } catch (err: any) {
      console.error('Error deleting session:', err);
      addToast('error', err.message || 'Failed to delete session');
    }
  };

  const handleToggleAttendance = async (memberId: string, status: 'present' | 'late' | 'absent') => {
    if (!selectedSession) return;

    setSavingRecordId(memberId);
    try {
      const { error } = await supabase
        .from('attendance_records')
        .upsert({
          session_id: selectedSession.id,
          user_id: memberId,
          status: status
        }, {
          onConflict: 'session_id,user_id'
        });

      if (error) throw error;

      await logAuditAction(
        'RECORD_ATTENDANCE',
        'attendance_records',
        `${selectedSession.id}_${memberId}`,
        null,
        { session_id: selectedSession.id, user_id: memberId, status }
      );

      setAttendance(prev => ({
        ...prev,
        [memberId]: status
      }));
    } catch (err: any) {
      console.error('Error saving attendance status:', err);
      addToast('error', 'Failed to save attendance record');
    } finally {
      setSavingRecordId(null);
    }
  };

  const filteredMembers = searchQuery
    ? members.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members;

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

        {/* Dynamic Minimal Toasts */}
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg text-xs font-medium ${
                toast.type === 'success'
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
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          >
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-semibold uppercase tracking-wider mb-3"
              >
                <ArrowLeft size={14} />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold tracking-tight font-heading text-white">
                Attendance & Events
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Manage weekly syncing sessions, host roll-calls, and audit attendance histories.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <Plus size={14} />
              New Session
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8 items-start">
            {/* Left Sidebar: Session Selector */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
                Syncing Sessions ({sessions.length})
              </h3>
              
              <div className="space-y-1">
                {sessions.map(s => {
                  const isSelected = selectedSession?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSession(s)}
                      className={`w-full text-left px-3.5 py-3 rounded-lg border text-sm transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? 'bg-zinc-900 border-zinc-800 text-white font-medium'
                          : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm">{s.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {new Date(s.session_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(s.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded transition-opacity"
                        aria-label="Delete Session"
                      >
                        <Trash2 size={13} />
                      </button>
                    </button>
                  );
                })}
                
                {sessions.length === 0 && (
                  <div className="text-center py-8 border border-zinc-900 rounded-xl bg-zinc-950/20">
                    <Calendar className="mx-auto text-zinc-700 mb-2" size={24} />
                    <p className="text-xs text-zinc-500">No sessions registered.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Pane: Session Attendance Roll Call */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-md"
            >
              {selectedSession ? (
                <>
                  {/* Selected Session Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {selectedSession.name}
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Roll-Call for {new Date(selectedSession.session_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-white placeholder-zinc-600 focus:border-zinc-800 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Attendance Stats Strip */}
                  <div className="grid grid-cols-3 gap-2.5 mb-6 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-400">
                        {Object.values(attendance).filter(status => status === 'present').length}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Present</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-yellow-400">
                        {Object.values(attendance).filter(status => status === 'late').length}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Late</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-400">
                        {Object.values(attendance).filter(status => status === 'absent').length}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Absent</p>
                    </div>
                  </div>

                  {/* Roll Call Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                          <th className="pb-3 pl-1 font-bold">Member</th>
                          <th className="pb-3 text-center font-bold">Roll-Call Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/50">
                        {filteredMembers.map(member => {
                          const currentStatus = attendance[member.id];
                          const isSaving = savingRecordId === member.id;
                          
                          return (
                            <tr key={member.id} className="group hover:bg-zinc-900/10">
                              {/* Member Info */}
                              <td className="py-3.5 pl-1">
                                <div className="flex items-center gap-3">
                                  {member.avatar_url ? (
                                    <img
                                      src={member.avatar_url}
                                      alt={member.name}
                                      className="w-8 h-8 rounded-full border border-zinc-800/80 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
                                      <span className="text-[10px] text-zinc-500 font-bold uppercase">
                                        {member.name?.charAt(0) || 'U'}
                                      </span>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                                    <p className="text-xs text-zinc-500 truncate">@{member.username}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Toggle Options */}
                              <td className="py-3.5 text-center">
                                <div className="inline-flex rounded-lg border border-zinc-900 p-0.5 bg-zinc-950">
                                  {(['present', 'late', 'absent'] as const).map(status => {
                                    const isActive = currentStatus === status;
                                    const activeStyles = {
                                      present: 'bg-green-500/10 text-green-400 font-bold border border-green-500/10',
                                      late: 'bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/10',
                                      absent: 'bg-red-500/10 text-red-400 font-bold border border-red-500/10'
                                    };
                                    const label = status.charAt(0).toUpperCase() + status.slice(1);
                                    
                                    return (
                                      <button
                                        key={status}
                                        onClick={() => handleToggleAttendance(member.id, status)}
                                        disabled={isSaving}
                                        className={`px-3 py-1 text-xs rounded-md transition-all ${
                                          isActive
                                            ? activeStyles[status]
                                            : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                      >
                                        {label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredMembers.length === 0 && (
                          <tr>
                            <td colSpan={2} className="py-12 text-center text-xs text-zinc-500">
                              No members match your search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-zinc-500">
                  <Calendar className="mx-auto text-zinc-800 mb-4 animate-pulse" size={40} />
                  <h3 className="text-lg font-bold text-white">No Session Selected</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Select an existing syncing session from the sidebar or click "New Session" to start recording attendance.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Create Session Dialog */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl relative"
              >
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>

                <h3 className="text-lg font-bold text-white mb-1">Create Syncing Session</h3>
                <p className="text-zinc-500 text-xs mb-5">Initialize a new weekly sync session to audit attendance.</p>

                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                      Session Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Weekly Sync #12"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-zinc-700 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                      Session Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newSessionDate}
                      onChange={(e) => setNewSessionDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-zinc-700 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 bg-transparent border border-zinc-900 hover:bg-zinc-900 text-zinc-400 rounded-lg text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      {isCreating && <Loader2 size={12} className="animate-spin" />}
                      Create
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      <ConfirmModal
        isOpen={deletingSessionId !== null}
        title="Delete Syncing Session"
        message="Are you sure you want to delete this session and all its attendance records? This action is permanent."
        confirmLabel="Delete Session"
        cancelLabel="Keep Session"
        variant="danger"
        onConfirm={confirmDeleteSession}
        onClose={() => setDeletingSessionId(null)}
      />

      <Footer />
    </>
  );
}
