import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Github, Linkedin, Instagram, Edit2, GitCommit, GitPullRequest, Code, User as UserIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugError, setDebugError] = useState<string>("");

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setDebugError("");
    try {
    
      let targetUser = username || null;
      let sessionUserId = null;

   
      const { data: { session } } = await supabase.auth.getSession();
      if (session) sessionUserId = session.user.id;

     
      const { data, error } = await supabase.rpc('get_full_profile', { 
        target_username: targetUser 
      });

      if (!error && data && data.length > 0) {
        setProfile(data[0]);
        setIsLoading(false);
        return; 
      }


      console.warn("RPC Failed, trying fallback...", error);
      
      let query = supabase.from('users').select('*');
      
      if (targetUser) {
        query = query.eq('username', targetUser);
      } else if (sessionUserId) {
        query = query.eq('auth_user_id', sessionUserId);
      } else {
        throw new Error("No username provided and not logged in.");
      }

      const { data: userData, error: userError } = await query.single();

      if (userError || !userData) {
        throw userError || new Error("User not found in DB");
      }

      
      const fallbackProfile = {
        ...userData,
        total_commits: 0,
        total_prs: 0,
        participated_repos: [],
        is_own_profile: sessionUserId === userData.auth_user_id,
        can_edit: sessionUserId === userData.auth_user_id 
      };

      setProfile(fallbackProfile);

    } catch (error: any) {
      console.error('Final Profile Error:', error);
      setDebugError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-mono">Loading Profile Data...</div>;

  if (!profile) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 gap-4 p-4">
            <h2 className="text-2xl font-bold">User Not Found</h2>
            <p className="text-gray-400 max-w-md text-center">
                We couldn't find a profile for this user. 
                {debugError && <span className="block mt-2 text-xs font-mono bg-gray-900 p-2 rounded border border-red-900">{debugError}</span>}
            </p>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Go Home</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="relative bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] -z-10" />
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black overflow-hidden shadow-2xl relative z-10 bg-gray-800 flex items-center justify-center">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={64} className="text-gray-500" />
                        )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-cyan-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider z-20 border border-black whitespace-nowrap">
                        {profile.role || "Member"}
                    </div>
                </div>

                <div className="flex-1 space-y-4 pt-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight">{profile.name || "Unnamed Member"}</h1>
                            <p className="text-cyan-400 font-mono">@{profile.username}</p>
                        </div>
                        
                        {profile.can_edit && (
                            <button 
                                onClick={() => navigate(`/profile-setup?edit=${profile.username}`)}
                                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
                            >
                                <Edit2 size={14} /> Edit Profile
                            </button>
                        )}
                    </div>

                    {profile.bio && <p className="text-gray-300 leading-relaxed max-w-2xl">{profile.bio}</p>}

                    <div className="flex gap-4 pt-2">
                        {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors"><Github size={24} /></a>}
                        {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors"><Linkedin size={24} /></a>}
                        {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors"><Instagram size={24} /></a>}
                    </div>
                </div>
            </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2"><GitCommit className="text-cyan-400" /> Contributions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                        <p className="text-3xl font-mono font-bold text-white">{profile.total_commits || 0}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Total Commits</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                        <p className="text-3xl font-mono font-bold text-white">{profile.total_prs || 0}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Pull Requests</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2"><Code className="text-purple-400" /> Active Repositories</h3>
                {profile.participated_repos && profile.participated_repos.length > 0 ? (
                    <div className="space-y-3">
                        {profile.participated_repos.map((repo: any, idx: number) => (
                            <a key={idx} href={repo.url} target="_blank" rel="noreferrer" className="block bg-black/40 p-3 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-colors group">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-sm text-cyan-300 group-hover:text-cyan-200">{repo.name}</span>
                                    <GitPullRequest size={14} className="text-gray-600 group-hover:text-cyan-400" />
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">No active repositories detected yet.</p>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;