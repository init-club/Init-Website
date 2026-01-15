import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

export function Layout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)' }}
    >
      <Navbar />
      <main className="flex-1 pt-24">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
