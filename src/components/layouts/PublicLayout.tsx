import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 md:py-12">
      <Outlet />
    </div>
  );
}