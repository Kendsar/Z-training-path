import { Outlet } from 'react-router-dom';
import Header from '../navigation/Header';

export default function PrivateLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      <Header />
      <main className="flex-1 pb-12">
        <Outlet />
      </main>
    </div>
  );
}