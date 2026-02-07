import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, FileText, Linkedin, Instagram, Github, Save, AlertCircle, X } from 'lucide-react'; // Added 'X' icon
import { supabase } from '../supabaseClient';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editModeUsername = searchParams.get('edit'); 

  const [isLoading, setIsLoading] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    linkedin: '',
    instagram: '',
    github: ''
  });

  useEffect(() => {
    const fetchExistingData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase.from('users').select('*');
      
      if (editModeUsername) {
        query = query.eq('username', editModeUsername);
      } else {
        query = query.eq('auth_user_id', user.id);
      }

      const { data, error } = await query.single();

      if (data && !error) {
        setTargetUserId(data.id);
        setFormData({
          displayName: data.name || '',
          bio: data.bio || '',
          linkedin: data.linkedin_url || '',
          instagram: data.instagram_url || '',
          github: data.github_url || ''
        });
      }
    };

    fetchExistingData();
  }, [editModeUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.rpc('update_profile_general', {
        target_user_id: targetUserId,
        new_name: formData.displayName,
        new_bio: formData.bio,
        new_li: formData.linkedin,
        new_ig: formData.instagram,
        new_gh: formData.github
      });

      if (error) throw error;

      navigate(editModeUsername ? `/profile/${editModeUsername}` : '/members');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-gray-900/50 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-sm relative" 
      >
        {/* --- CLOSE BUTTON (New) --- */}
        <button
            onClick={() => navigate('/profile')}
            className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
            title="Cancel & Go Back"
        >
            <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-white">{editModeUsername ? 'Edit' : 'Complete'} Your </span>
            <span className="text-cyan-400">Profile</span>
          </h1>
        </div>

        {/* TEAM LEAD REQUIREMENT: The Note */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl mb-6 flex gap-3 items-start">
            <AlertCircle className="text-yellow-500 flex-shrink-0 mt-1" size={18} />
            <p className="text-yellow-200/80 text-sm leading-relaxed">
                <strong>Important:</strong> Please use your <span className="text-white font-bold underline">Real Name</span>. 
                This will be displayed on the official club website and used for certification.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name - MANDATORY */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <User size={16} className="text-cyan-400" /> Real Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="e.g. Nitansh Shankar"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <FileText size={16} className="text-cyan-400" /> Bio <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors h-24 resize-none"
              placeholder="Full Stack Developer | AI Enthusiast..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Linkedin size={14} /> LinkedIn URL
              </label>
              <input type="url" className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-sm" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Instagram size={14} /> Instagram URL
              </label>
              <input type="url" className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-sm" value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Github size={14} /> GitHub URL
              </label>
              <input type="url" className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-sm" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-gradient-brand-horizontal text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            {isLoading ? 'Saving...' : <><Save size={20} /> Save Profile</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;