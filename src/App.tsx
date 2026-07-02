/**
 To people who handle this codebase in the future. This is the root of the application. Read this before touching it.

 1) Lazy Loading: Almost every page is loaded with React.lazy(). This splits the production JS bundle so users only
    download code for the page they visit. Do NOT move pages out of lazy() unless you have a very good reason.
    The only page NOT lazy-loaded is HomePage because it's always the first thing rendered.

 2) JIT (Just-In-Time) Sync: When a user logs in via GitHub OAuth for the first time, they won't have a database
    row yet. The 'tryJitSync' function calls the 'github-lookup-user' Supabase edge function to create their user
    row by looking them up in the 'init-club' GitHub org. If they are not in the org, 'AccessDeniedModal' is shown.
    This happens automatically in the useEffect that watches [session, userProfile, isLoading].

 3) Onboarding Redirect Gate: After JIT sync succeeds, the user has a database row but 'profile_completed' is false.
    The same useEffect catches this and redirects them to '/profile-setup'. They cannot browse the site until they
    complete onboarding. Once they submit the form, 'profile_completed' is set to true and the gate clears.

 4) JIT_SYNC_PENDING Hash: If the edge function returns a 'JIT_SYNC_PENDING' fragment in the redirect URL (this can
    happen on certain OAuth redirect timings), a blue banner is shown telling the user to wait and log in again.
    It's a rare edge case but it happens occasionally with GitHub OAuth.

 5) AdminGuard: Any route under '/admin/*' is wrapped in <AdminGuard>. This component checks the user's 'role'
    from the database and blocks access if they are not an admin. The route still renders in the router but the
    component itself redirects non-admins away.

 */
import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

import HomePage from './pages/Home';
import { Rocket, Loader2 } from 'lucide-react';
import ScrollToTop from './components/layout/ScrollToTop';
import SmoothScroll from './components/layout/SmoothScroll';
import AccessDeniedModal from './components/shared/modals/AccessDeniedModal';

// Lazy load all other pages to split the production bundle chunks
const AboutPage = lazy(() => import('./pages/About'));
const BlogsPage = lazy(() => import('./pages/Blogs'));
const ContactPage = lazy(() => import('./pages/Contact'));
const EventsPage = lazy(() => import('./pages/Events'));
const IdeaWallPage = lazy(() => import('./pages/IdeaWall'));
const GraveyardPage = lazy(() => import('./pages/Graveyard'));
const ActivityPage = lazy(() => import('./pages/Activity'));
const MembersPage = lazy(() => import('./pages/Members'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/404'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const Profile = lazy(() => import('./pages/Profile'));

// Admin Subpages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const BlogsAdminPage = lazy(() => import('./pages/admin/BlogsAdmin'));
const ProjectAdmin = lazy(() => import('./pages/admin/ProjectAdmin'));
const MembersAdmin = lazy(() => import('./pages/admin/MembersAdmin'));
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin'));
const EventsAdmin = lazy(() => import('./pages/admin/EventsAdmin'));
const AnalyticsAdmin = lazy(() => import('./pages/admin/AnalyticsAdmin'));
const FormsAdminPage = lazy(() => import('./pages/admin/FormsAdmin'));
const FormBuilderPage = lazy(() => import('./pages/admin/FormBuilder'));
const FormResponsesPage = lazy(() => import('./pages/admin/FormResponses'));
const PublicFormPage = lazy(() => import('./pages/PublicFormPage'));
const FormSuccessPage = lazy(() => import('./pages/FormSuccess'));

import { AuthProvider, useAuth } from './context/AuthContext';
import AdminGuard from './components/shared/AdminGuard';

function AppContent() {
  const { session, userProfile, isLoading, refreshProfile } = useAuth();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showSyncMessage, setShowSyncMessage] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for JIT Sync Error in URL
    const hash = window.location.hash;
    if (hash && hash.includes('JIT_SYNC_PENDING')) {
      setShowSyncMessage(true);
      // Clear the ugly hash but keep the user on the page
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const tryJitSync = async () => {
      const githubUsername = session?.user?.user_metadata?.preferred_username || session?.user?.user_metadata?.user_name;
      if (!githubUsername) {
        setShowAccessDenied(true);
        return;
      }

      setIsSyncing(true);
      try {
        console.log(`Starting JIT synchronization for user: ${githubUsername}...`);
        const { error } = await supabase.functions.invoke('github-lookup-user', {
          body: { github_username: githubUsername }
        });

        if (error) throw error;

        // Sync succeeded! Refresh profile context
        await refreshProfile();
      } catch (err) {
        console.error('JIT Sync failed:', err);
        setShowAccessDenied(true);
      } finally {
        setIsSyncing(false);
      }
    };

    if (!isLoading && session) {
      if (!userProfile) {
        tryJitSync();
      } else if (!userProfile.profile_completed) {
        console.log("Profile incomplete, redirecting...");
        if (window.location.pathname !== '/profile-setup') {
          navigate('/profile-setup');
        }
      }
    }
  }, [session, userProfile, isLoading, refreshProfile, navigate]);

  const handleAccessDeniedClose = () => {
    setShowAccessDenied(false);
    navigate('/');
  };

  if (isLoading || isSyncing) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase animate-pulse">
          Syncing with GitHub...
        </p>
      </div>
    );
  }

  return (
    <SmoothScroll>
      <ScrollToTop />

      {/* JIT SYNC BANNER */}
      {showSyncMessage && (
        <div className="fixed top-0 left-0 w-full bg-blue-600 text-white text-center py-4 z-50 font-bold shadow-lg animate-pulse flex items-center justify-center">
          Checking your GitHub Membership... Please wait 5 seconds and Login again! <Rocket className="ml-2 inline" size={18} />
          <button onClick={() => setShowSyncMessage(false)} className="ml-4 text-sm underline opacity-80 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* RENDER THE ACCESS DENIED MODAL */}
      <AccessDeniedModal
        isOpen={showAccessDenied}
        onClose={handleAccessDeniedClose}
      />

      <Suspense fallback={
        <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/idea-wall" element={<IdeaWallPage />} />
          <Route path="/graveyard" element={<GraveyardPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/blogs" element={<AdminGuard><BlogsAdminPage /></AdminGuard>} />
          <Route path="/admin/projects" element={<AdminGuard><ProjectAdmin /></AdminGuard>} />
          <Route path="/admin/members" element={<AdminGuard><MembersAdmin /></AdminGuard>} />
          <Route path="/admin/settings" element={<AdminGuard><SettingsAdmin /></AdminGuard>} />
          <Route path="/admin/events" element={<AdminGuard><EventsAdmin /></AdminGuard>} />
          <Route path="/admin/analytics" element={<AdminGuard><AnalyticsAdmin /></AdminGuard>} />
          <Route path="/admin/forms" element={<AdminGuard><FormsAdminPage /></AdminGuard>} />
          <Route path="/admin/forms/new" element={<AdminGuard><FormBuilderPage /></AdminGuard>} />
          <Route path="/admin/forms/:formId/edit" element={<AdminGuard><FormBuilderPage /></AdminGuard>} />
          <Route path="/admin/forms/:formId/responses" element={<AdminGuard><FormResponsesPage /></AdminGuard>} />
          <Route path="/forms/:slug" element={<PublicFormPage />} />
          <Route path="/forms/:slug/success" element={<FormSuccessPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </SmoothScroll>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
