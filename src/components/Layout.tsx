import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import OctopusNavbar from './OctopusNavbar';
import Navbar from './Navbar';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar/>
      <OctopusNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
