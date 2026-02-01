import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, FileText, Linkedin, Instagram, Github, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    linkedin: '',
    instagram: '',
    github: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.rpc('complete_profile', {
        display_name: formData.displayName,
        bio_text: formData.bio,
        li_url: formData.linkedin,
        ig_url: formData.instagram,
        gh_url: formData.github
      });

      if (error) throw error;

      alert('Profile Updated Successfully!');
      navigate('/members'); 
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
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
        className="w-full max-w-2xl bg-gray-900/50 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-sm"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-white">Complete Your </span>
            <span className="text-cyan-400">Profile</span>
          </h1>
          <p className="text-gray-400 text-sm">Tell the club a bit about yourself.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <User size={16} className="text-cyan-400" /> Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="e.g. John Doe"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <FileText size={16} className="text-cyan-400" /> Short Bio
            </label>
            <textarea
              className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors h-24 resize-none"
              placeholder="What are you interested in? (AI, Web, App...)"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>

          {/* Social Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Linkedin size={14} /> LinkedIn URL
              </label>
              <input
                type="url"
                className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-sm focus:border-cyan-500 focus:outline-none"
                value={formData.linkedin}
                onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Instagram size={14} /> Instagram URL
              </label>
              <input
                type="url"
                className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-sm focus:border-cyan-500 focus:outline-none"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Github size={14} /> GitHub URL
              </label>
              <input
                type="url"
                className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-sm focus:border-cyan-500 focus:outline-none"
                value={formData.github}
                onChange={(e) => setFormData({...formData, github: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-gradient-brand-horizontal text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : <><Save size={20} /> Complete Setup</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;