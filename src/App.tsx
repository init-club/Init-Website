import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'; 
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

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false); 


  useEffect(() => {
    console.log("Auth Session Updated:", session); 
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkMembershipStatus();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      if (session) {
        checkMembershipStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
        if (!userStatus.profile_completed) {
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
      <AccessDeniedModal isOpen={showAccessDenied} onClose={handleAccessDeniedClose} />
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/idea-wall" element={<IdeaWallPage />} />
        <Route path="/graveyard" element={<GraveyardPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
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