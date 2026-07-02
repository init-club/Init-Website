import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Settings, Shield, Link2, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { supabase } from '../../supabaseClient';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function SettingsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [allowPublicBlogs, setAllowPublicBlogs] = useState(true);
  const [discordLink, setDiscordLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const navigate = useNavigate();

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    const checkAdminAndFetch = async () => {
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
      fetchSettings();
    };

    checkAdminAndFetch();
  }, [navigate]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data) {
        setAllowPublicBlogs(data.allow_public_blogs);
        setDiscordLink(data.discord_link || '');
        setInstagramLink(data.instagram_link || '');
        setLinkedinLink(data.linkedin_link || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      addToast('error', 'Failed to fetch site settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          allow_public_blogs: allowPublicBlogs,
          discord_link: discordLink.trim(),
          instagram_link: instagramLink.trim(),
          linkedin_link: linkedinLink.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;
      addToast('success', 'Site settings saved successfully!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      addToast('error', err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
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

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
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
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Settings size={22} className="text-blue-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-white">
                Global Settings
              </h1>
            </div>
            <p className="text-gray-400">
              Manage onboarding toggles, rules, and global social redirection links.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <motion.form
              onSubmit={handleSave}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Section 1: Onboarding Config */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-4 border-b border-gray-800 pb-3">
                  <Shield size={18} className="text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Onboarding & Submissions</h3>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-white font-semibold text-sm">Allow Public Blog Submissions</h4>
                    <p className="text-gray-500 text-xs mt-1">
                      If disabled, only logged-in whitelisted club members will be allowed to submit articles.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllowPublicBlogs(!allowPublicBlogs)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {allowPublicBlogs ? (
                      <ToggleRight size={44} className="text-cyan-400" />
                    ) : (
                      <ToggleLeft size={44} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Section 2: Metadata / Social Links */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-4 border-b border-gray-800 pb-3">
                  <Link2 size={18} className="text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Global Social Links</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5">
                      Discord Server Invite
                    </label>
                    <input
                      type="url"
                      value={discordLink}
                      onChange={(e) => setDiscordLink(e.target.value)}
                      placeholder="https://discord.gg/..."
                      className="w-full px-4 py-2.5 bg-black/50 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5">
                      Instagram Profile
                    </label>
                    <input
                      type="url"
                      value={instagramLink}
                      onChange={(e) => setInstagramLink(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-2.5 bg-black/50 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase mb-1.5">
                      LinkedIn Page
                    </label>
                    <input
                      type="url"
                      value={linkedinLink}
                      onChange={(e) => setLinkedinLink(e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="w-full px-4 py-2.5 bg-black/50 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-5 py-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Config
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
