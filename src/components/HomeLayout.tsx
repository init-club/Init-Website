import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import OctopusNavbar from './OctopusNavbar';

export function HomeLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <OctopusNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default HomeLayout;
