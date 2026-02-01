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

function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkMembershipStatus();
      } else {
        setIsLoading(false);
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
        alert("ACCESS DENIED: You are not a registered member of The Init Club.");
        await supabase.auth.signOut();
        window.location.href = "/";
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
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-mono animate-pulse">
          Initializing Club Protocol...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;