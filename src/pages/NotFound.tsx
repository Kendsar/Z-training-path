import { Link } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import Logo from '../components/common/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Logo size="large" />
      
      <h1 className="mt-8 text-4xl font-extrabold tracking-tight">404</h1>
      <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
        This page has vanished like a Saiyan's appetite.
      </p>
      
      <div className="mt-8">
        <Link to="/" className="btn btn-primary btn-md inline-flex items-center">
          <MoveLeft size={18} className="mr-2" />
          Back to Training
        </Link>
      </div>
    </div>
  );
}