import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { supabase } from './supabaseClient';

import AboutPage from './pages/About';
import BlogsPage from './pages/Blogs';
import ContactPage from './pages/Contact';
import EventsPage from './pages/Events';
import HomePage from './pages/Home';
import IdeaWallPage from './pages/IdeaWall';
import GraveyardPage from './pages/Graveyard';
import ActivityPage from './pages/Activity';
import MembersPage from './pages/Members';
import NotFoundPage from './pages/404';
import ProfileSetup from './pages/ProfileSetup';
import ScrollToTop from './components/ScrollToTop';
import AccessDeniedModal from './components/AccessDeniedModal';
import Profile from './pages/Profile';
import BlogsAdminPage from './pages/admin/BlogsAdmin';
import AdminDashboard from './pages/admin/AdminDashboard';


function App() {
  const [session, setSession] = useState<any>(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showSyncMessage, setShowSyncMessage] = useState(false);

  useEffect(() => {
    // Check for JIT Sync Error in URL
    const hash = window.location.hash;
    if (hash && hash.includes('JIT_SYNC_PENDING')) {
      setShowSyncMessage(true);
      // Clear the ugly hash but keep the user on the page
      window.history.replaceState(null, '', window.location.pathname);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkMembershipStatus();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkMembershipStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Current Session:", session);
  }, [session]);

  const checkMembershipStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_status');

      if (error) {
        console.error("Backend Check Error:", error);
        return;
      }

      if (!data || data.length === 0) {
        setShowAccessDenied(true);
      } else {
        const userStatus = data[0];
        console.log(" Verified Member:", userStatus);

        if (!userStatus.profile_completed) {
          console.log("Profile incomplete, redirecting...");
          if (window.location.pathname !== '/profile-setup') {
            window.location.href = "/profile-setup";
          }
        }
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };

  const handleAccessDeniedClose = () => {
    setShowAccessDenied(false);
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <ScrollToTop />

      {/* JIT SYNC BANNER */}
      {showSyncMessage && (
        <div className="fixed top-0 left-0 w-full bg-blue-600 text-white text-center py-4 z-50 font-bold shadow-lg animate-pulse">
          Checking your GitHub Membership... Please wait 5 seconds and Login again! 🚀
          <button onClick={() => setShowSyncMessage(false)} className="ml-4 text-sm underline opacity-80 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* RENDER THE ACCESS DENIED MODAL */}
      <AccessDeniedModal
        isOpen={showAccessDenied}
        onClose={handleAccessDeniedClose}
      />

      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/idea-wall" element={<IdeaWallPage />} />
        <Route path="/graveyard" element={<GraveyardPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/blogs" element={<BlogsAdminPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;