import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Plus, Calendar, Trash2, CheckCircle2,
  AlertTriangle, Clipboard, Copy, ExternalLink, Settings, BarChart3, Edit3
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { supabase } from '../../supabaseClient';
import useSWR from 'swr';
import { fetchAllForms } from '../../utils/fetchers';
import { useAuth } from '../../context/AuthContext';
import { logAuditAction } from '../../utils/auditLogger';
import ConfirmModal from '../../components/shared/modals/ConfirmModal';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function FormsAdminPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const { data: forms, error: formsError, mutate } = useSWR(
    isAdmin ? 'forms_list' : null,
    fetchAllForms
  );

  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

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

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/forms/${slug}`;
    navigator.clipboard.writeText(url);
    addToast('success', 'Form link copied to clipboard!');
  };

  const handleStatusChange = async (formId: string, newStatus: 'draft' | 'published' | 'closed') => {
    setUpdatingStatusId(formId);
    try {
      const { error } = await supabase
        .from('forms')
        .update({ status: newStatus })
        .eq('id', formId);

      if (error) throw error;

      await logAuditAction(
        'UPDATE_FORM_STATUS',
        'forms',
        formId,
        null,
        { new_status: newStatus }
      );

      addToast('success', `Form status updated to ${newStatus}`);
      mutate();
    } catch (err: any) {
      console.error('Error updating status:', err);
      addToast('error', err.message || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteForm = async () => {
    if (!deletingFormId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', deletingFormId);

      if (error) throw error;

      await logAuditAction(
        'DELETE_FORM',
        'forms',
        deletingFormId,
        { id: deletingFormId },
        null
      );

      addToast('success', 'Form deleted successfully!');
      mutate();
    } catch (err: any) {
      console.error('Error deleting form:', err);
      addToast('error', err.message || 'Failed to delete form');
    } finally {
      setIsDeleting(false);
      setDeletingFormId(null);
    }
  };

  const isLoading = isAuthLoading || (!forms && !formsError);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-24 pb-16 px-4">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        {/* Custom Popups / Toasts */}
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm shadow-xl backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-zinc-950/90 border-emerald-500/30 text-emerald-400'
                  : 'bg-zinc-950/90 border-red-500/30 text-red-400'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-2 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-black font-heading tracking-tight">Form Manager</h1>
              <p className="text-zinc-500 text-sm">Create, publish, and view analytics for custom forms.</p>
            </div>
            <Link
              to="/admin/forms/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-white/5"
            >
              <Plus size={16} />
              Create New Form
            </Link>
          </div>

          {/* Forms List */}
          {forms && forms.length === 0 ? (
            <div className="text-center py-20 bg-zinc-950/30 border border-zinc-900 rounded-2xl">
              <Clipboard className="mx-auto text-zinc-700 mb-4" size={48} />
              <h3 className="text-lg font-bold text-zinc-300">No Forms Found</h3>
              <p className="text-zinc-500 text-sm mb-6">Start by building your very first custom form.</p>
              <Link
                to="/admin/forms/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all text-sm"
              >
                <Plus size={14} /> Get Started
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forms?.map((form: any) => (
                <motion.div
                  key={form.id}
                  layoutId={form.id}
                  className="group relative bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Last updated {new Date(form.updated_at).toLocaleDateString()}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {updatingStatusId === form.id ? (
                          <Loader2 size={12} className="animate-spin text-zinc-500" />
                        ) : (
                          <Select
                            value={form.status}
                            onValueChange={(v) => handleStatusChange(form.id, v as any)}
                          >
                            <SelectTrigger
                              className={`h-6 text-[10px] font-mono font-bold uppercase rounded-full px-2 border cursor-pointer focus:outline-none bg-zinc-950 ${
                                form.status === 'published'
                                  ? 'text-cyan-400 border-cyan-500/20'
                                  : form.status === 'closed'
                                  ? 'text-red-400 border-red-500/20'
                                  : 'text-zinc-400 border-zinc-800'
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors duration-200 line-clamp-1">
                      {form.title}
                    </h3>
                    <p className="text-zinc-500 text-xs line-clamp-2 mt-1 mb-4 h-8 leading-relaxed">
                      {form.description || 'No description provided.'}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 border-y border-zinc-900 py-3 mb-4">
                      <div>
                        <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Responses</div>
                        <div className="text-lg font-black font-heading text-zinc-300">{form.response_count}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">Fields</div>
                        <div className="text-lg font-black font-heading text-zinc-300">
                          {Array.isArray(form.fields) ? form.fields.length : 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/forms/${form.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      <Edit3 size={13} />
                      Edit Builder
                    </Link>
                    
                    {form.response_count > 0 ? (
                      <Link
                        to={`/admin/forms/${form.id}/responses`}
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all"
                        title="Responses & Analytics"
                      >
                        <BarChart3 size={14} />
                      </Link>
                    ) : (
                      <span
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-zinc-900 bg-zinc-950/20 text-zinc-650 cursor-not-allowed"
                        title="Responses & Analytics (No responses)"
                      >
                        <BarChart3 size={14} />
                      </span>
                    )}

                    <button
                      onClick={() => handleCopyLink(form.slug)}
                      className="inline-flex items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-all"
                      title="Copy Public Link"
                    >
                      <Copy size={14} />
                    </button>

                    {form.status === 'published' && (
                      <a
                        href={`/forms/${form.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-all"
                        title="View Live Form"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    <button
                      onClick={() => setDeletingFormId(form.id)}
                      className="inline-flex items-center justify-center p-2 bg-red-950/10 hover:bg-red-950/30 text-red-500 hover:text-red-400 border border-red-900/20 rounded-xl transition-all"
                      title="Delete Form"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* custom-decorated confirmation popup */}
      <ConfirmModal
        isOpen={!!deletingFormId}
        onClose={() => setDeletingFormId(null)}
        onConfirm={handleDeleteForm}
        title="Delete Custom Form"
        message="Are you sure you want to delete this form? This will permanently delete all form details and response data collected. This action is irreversible."
        isLoading={isDeleting}
      />
    </>
  );
}
