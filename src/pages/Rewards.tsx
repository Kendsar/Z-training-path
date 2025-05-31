import { useEffect, useState } from 'react';
import { useProfileStore } from '../stores/profileStore';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, Crown, Dumbbell, Award, TrendingUp, Gift } from 'lucide-react';
import WheelOfHonor from '../components/wheel/WheelOfHonor';

const rankIcons = {
  'Human Form': Dumbbell,
  'Initiate Saiyan': Star,
  'Saiyan': Flame,
  'Super Saiyan': Crown,
  'SSJ2': Crown,
  'SSJ3': Crown,
  'Blue Sign': Star,
  'Final Form': Trophy,
  'God Form': Crown,
};

const rankColors = {
  'Human Form': 'bg-zinc-500',
  'Initiate Saiyan': 'bg-blue-500',
  'Saiyan': 'bg-indigo-500',
  'Super Saiyan': 'bg-yellow-500',
  'SSJ2': 'bg-amber-500',
  'SSJ3': 'bg-orange-500',
  'Blue Sign': 'bg-cyan-500',
  'Final Form': 'bg-purple-500',
  'God Form': 'bg-red-500',
};

const rankRequirements = [
  { name: 'Human Form', threshold: 0, requirement: '1 week' },
  { name: 'Initiate Saiyan', threshold: 700, requirement: '10 workouts' },
  { name: 'Saiyan', threshold: 1400, requirement: '2 weeks' },
  { name: 'Super Saiyan', threshold: 3000, requirement: '1 month' },
  { name: 'SSJ2', threshold: 6000, requirement: '2 months' },
  { name: 'SSJ3', threshold: 9000, requirement: '3 months' },
  { name: 'Blue Sign', threshold: 14000, requirement: '4-5 months' },
  { name: 'Final Form', threshold: 20000, requirement: '6-7 months' },
  { name: 'God Form', threshold: 30000, requirement: '8+ months' },
];

export default function Rewards() {
  const { profile, fetchProfile } = useProfileStore();
  const [activeTab, setActiveTab] = useState<'ranks' | 'wheel'>('ranks');
  
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-4"></div>
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  const currentRankIndex = rankRequirements.findIndex(rank => rank.name === profile.current_rank);
  const nextRank = currentRankIndex < rankRequirements.length - 1 
    ? rankRequirements[currentRankIndex + 1] 
    : null;
  
  let progress = 0;
  if (nextRank) {
    const currentRankThreshold = rankRequirements[currentRankIndex].threshold;
    progress = ((profile.kai_points - currentRankThreshold) / (nextRank.threshold - currentRankThreshold)) * 100;
    progress = Math.min(Math.max(progress, 0), 100);
  }
  
  const RankIcon = rankIcons[profile.current_rank as keyof typeof rankIcons] || Dumbbell;
  const rankColor = rankColors[profile.current_rank as keyof typeof rankColors] || 'bg-zinc-500';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Current Rank Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className={`w-24 h-24 rounded-full ${rankColor} flex items-center justify-center text-white`}>
              <RankIcon size={48} />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{profile.current_rank}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="flex items-center">
                  <Flame className="w-5 h-5 text-kai-500 mr-2" />
                  <span className="text-xl font-semibold">{profile.kai_points} KP</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-success-500 mr-2" />
                  <span className="text-xl font-semibold">{profile.current_streak} Day Streak</span>
                </div>
              </div>
              
              {nextRank && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {nextRank.name}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${rankColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {profile.kai_points} / {nextRank.threshold} Kai Points needed
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-6">
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'ranks'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border-b-2 border-primary-500'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('ranks')}
          >
            <Trophy size={16} className="inline-block mr-1" />
            Rank Progression
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'wheel'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border-b-2 border-primary-500'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('wheel')}
          >
            <Gift size={16} className="inline-block mr-1" />
            Wheel of Honor
          </button>
        </div>
        
        {activeTab === 'ranks' ? (
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-6">Power Level Progression</h2>
            <div className="space-y-6">
              {rankRequirements.map((rank, index) => {
                const isCurrentRank = rank.name === profile.current_rank;
                const isPastRank = index < currentRankIndex;
                const isFutureRank = index > currentRankIndex;
                
                const Icon = rankIcons[rank.name as keyof typeof rankIcons];
                
                return (
                  <motion.div
                    key={rank.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex items-center gap-4 p-4 rounded-lg border ${
                      isCurrentRank 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full ${rankColors[rank.name as keyof typeof rankColors]} flex items-center justify-center text-white`}>
                      <Icon size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rank.name}</h3>
                        {isCurrentRank && (
                          <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Required: {rank.requirement}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">{rank.threshold} KP</div>
                      {isPastRank && (
                        <span className="text-success-500 text-sm flex items-center justify-end">
                          <Award size={14} className="mr-1" />
                          Achieved
                        </span>
                      )}
                      {isFutureRank && (
                        <span className="text-zinc-400 text-sm">
                          Locked
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <WheelOfHonor />
        )}
      </div>
    </div>
  );
}