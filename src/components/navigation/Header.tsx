import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProfileStore } from '../../stores/profileStore';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Menu, X, LogOut, User, Trophy, BarChart2, Medal } from 'lucide-react';
import Logo from '../common/Logo';
import UserRank from '../common/UserRank';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile } = useProfileStore();
  const { user } = useAuthStore();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart2 },
    { name: 'Rewards', href: '/rewards', icon: Trophy },
    { name: 'Rankings', href: '/rankings', icon: Medal },
  ];
  
  return (
    <header className="bg-white dark:bg-zinc-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0">
              <Logo size="small" />
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.href
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {profile && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">
                      {profile.username}
                    </span>
                    <UserRank rank={profile.current_rank} kaiPoints={profile.kai_points} compact />
                  </div>
                </div>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  aria-label="Log out"
                >
                  <LogOut size={18} className="mr-1" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 bg-white dark:bg-zinc-800 shadow-md">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
            
            {profile && (
              <>
                <div className="py-2">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <User size={20} className="text-zinc-500" />
                    <div>
                      <span className="block text-sm font-medium">
                        {profile.username}
                      </span>
                      <UserRank rank={profile.current_rank} kaiPoints={profile.kai_points} compact />
                    </div>
                  </div>
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <LogOut size={20} className="mr-3 text-zinc-500" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}