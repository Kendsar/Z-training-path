import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff, Dumbbell } from 'lucide-react';
import Logo from '../components/common/Logo';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.user) {
        throw new Error('Failed to create user account');
      }
      
      // Create profile with retry logic
      let profileCreated = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!profileCreated && retryCount < maxRetries) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                username,
                kai_points: 0,
                current_rank: 'Human Form',
                current_streak: 0,
                max_streak: 0,
              }
            ])
            .select()
            .single();
            
          if (profileError) {
            throw profileError;
          }
          
          profileCreated = true;
        } catch (profileError: any) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw new Error('Failed to create user profile after multiple attempts');
          }
          // Wait briefly before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      
      // If profile creation failed, attempt to clean up the auth user
      if (error.message.includes('Failed to create user profile')) {
        try {
          await supabase.auth.signOut();
        } catch (cleanupError) {
          console.error('Failed to clean up auth user:', cleanupError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="large" />
          <h1 className="text-3xl font-bold mt-6 mb-2">Join Z-Training</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Create an account to start your transformation
          </p>
        </div>
        
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Choose a username"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Choose a strong password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Password must be at least 6 characters
              </p>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Dumbbell className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}