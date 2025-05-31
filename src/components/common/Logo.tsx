import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ size = 'medium' }: LogoProps) {
  const sizes = {
    small: {
      container: 'h-8',
      icon: 18,
      text: 'text-xl',
    },
    medium: {
      container: 'h-12',
      icon: 24,
      text: 'text-2xl',
    },
    large: {
      container: 'h-16',
      icon: 32,
      text: 'text-3xl',
    },
  };
  
  const currentSize = sizes[size];
  
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${currentSize.container}`}
    >
      <div className="flex items-center justify-center w-10 h-10 bg-primary-500 text-white rounded-lg hover-float">
        <Dumbbell size={currentSize.icon} />
      </div>
      <span className={`ml-2 font-bold ${currentSize.text} text-zinc-900 dark:text-white`}>
        Z-Training
      </span>
    </Link>
  );
}