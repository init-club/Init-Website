import { BrowserRouter, Route, Routes } from 'react-router-dom';

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
import ScrollToTop from './components/ScrollToTop';

function App() {
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
