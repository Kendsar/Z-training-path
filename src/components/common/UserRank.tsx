import { Flame } from 'lucide-react';

interface UserRankProps {
  rank: string;
  kaiPoints: number;
  compact?: boolean;
}

export default function UserRank({ rank, kaiPoints, compact = false }: UserRankProps) {
  const rankColors: Record<string, string> = {
    'Human Form': 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
    'Initiate Saiyan': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Saiyan': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Super Saiyan': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'SSJ2': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'SSJ3': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Blue Sign': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'Final Form': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'God Form': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const rankColor = rankColors[rank] || 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200';
  
  if (compact) {
    return (
      <div className="flex items-center">
        <span className={`text-xs px-2 py-0.5 rounded-full ${rankColor}`}>
          {rank}
        </span>
        <div className="flex items-center ml-2 text-xs text-kai-500">
          <Flame size={12} className="text-kai-500 mr-1" />
          {kaiPoints} KP
        </div>
      </div>
    );
  }
  
  return (
    <div className="rank-badge flex flex-col items-start space-y-1">
      <div className={`px-3 py-1 rounded-full ${rankColor}`}>
        <span className="text-sm font-medium">{rank}</span>
      </div>
      <div className="flex items-center text-kai-500">
        <Flame size={16} className="mr-1" />
        <span className="font-semibold">{kaiPoints} Kai Points</span>
      </div>
    </div>
  );
}