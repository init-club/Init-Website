import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import AboutPage from './pages/About';
import BlogsPage from './pages/Blogs';
import ContactPage from './pages/Contact';
import EventsPage from './pages/Events';
import HomePage from './pages/Home';
import ProjectsPage from './pages/Projects';

function App() {

  return (
    <BrowserRouter>


      {/* Main Content */}
      <Routes>
        {/* Home page has its own layout with OctopusNavbar and Footer */}
        <Route index element={<HomePage />} />
        <Route element={<Layout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
