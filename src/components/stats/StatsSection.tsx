import { useState } from 'react';
import { format, startOfWeek, endOfWeek, isSameWeek, startOfMonth, endOfMonth, isSameMonth, differenceInDays } from 'date-fns';
import { Profile } from '../../types/profile';
import { Workout } from '../../types/workout';
import UserRank from '../common/UserRank';
import { Calendar, BarChart2, Flame, Award, TrendingUp } from 'lucide-react';

interface StatsSectionProps {
  profile: Profile | null;
  workouts: Workout[];
}

export default function StatsSection({ profile, workouts }: StatsSectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'streak'>('overview');
  
  if (!profile) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-6"></div>
        <div className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded mb-6"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
      </div>
    );
  }
  
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  // Count workouts for current week and month
  const weeklyWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return isSameWeek(workoutDate, today);
  });
  
  const monthlyWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return isSameMonth(workoutDate, today);
  });
  
  // Calculate next rank and progress
  const rankProgression = [
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
  
  const currentRankIndex = rankProgression.findIndex(rank => rank.name === profile.current_rank);
  const nextRank = currentRankIndex < rankProgression.length - 1 
    ? rankProgression[currentRankIndex + 1] 
    : null;
  
  let progress = 0;
  if (nextRank) {
    const currentRankThreshold = rankProgression[currentRankIndex].threshold;
    progress = ((profile.kai_points - currentRankThreshold) / (nextRank.threshold - currentRankThreshold)) * 100;
    progress = Math.min(Math.max(progress, 0), 100);
  }
  
  // Calculate streaks and details
  const getStreakInfo = () => {
    const lastWorkoutDate = profile.last_workout_date 
      ? new Date(profile.last_workout_date) 
      : null;
    
    let streakStatus = 'inactive';
    let daysSinceLastWorkout = 0;
    
    if (lastWorkoutDate) {
      const today = new Date();
      daysSinceLastWorkout = differenceInDays(today, lastWorkoutDate);
      
      if (daysSinceLastWorkout <= 1) {
        streakStatus = 'active';
      } else if (daysSinceLastWorkout <= 2) {
        streakStatus = 'warning';
      } else {
        streakStatus = 'broken';
      }
    }
    
    return {
      current: profile.current_streak,
      max: profile.max_streak,
      status: streakStatus,
      daysSinceLastWorkout,
    };
  };
  
  const streakInfo = getStreakInfo();
  
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold mb-3">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <h3 className="text-lg font-semibold">{profile.username}</h3>
          <div className="mt-3">
            <UserRank rank={profile.current_rank} kaiPoints={profile.kai_points} />
          </div>
        </div>
        
        {nextRank && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to {nextRank.name}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {profile.kai_points} / {nextRank.threshold} Kai Points
            </p>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-zinc-700">
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border-b-2 border-primary-500'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart2 size={16} className="inline-block mr-1" />
            Overview
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'streak'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border-b-2 border-primary-500'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('streak')}
          >
            <Flame size={16} className="inline-block mr-1" />
            Streak
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Workout Count Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1">{weeklyWorkouts.length}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    This Week
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
                  </div>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1">{monthlyWorkouts.length}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    This Month
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {format(monthStart, 'MMM d')} - {format(monthEnd, 'MMM d')}
                  </div>
                </div>
              </div>
              
              {/* Total Workouts */}
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar size={18} className="text-primary-500 mr-2" />
                  <span className="text-sm font-medium">Total Workouts</span>
                </div>
                <span className="text-lg font-bold">{workouts.length}</span>
              </div>
              
              {/* Latest Workout */}
              {workouts.length > 0 && (
                <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Latest Workout</h4>
                  <div className="text-md font-semibold mb-1">
                    {workouts[0].name}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {format(new Date(workouts[0].date), 'PPP')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Streak */}
              <div className={`bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg relative overflow-hidden
                ${streakInfo.status === 'active' ? 'kai-glow' : ''}
              `}>
                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Current Streak</h4>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold mr-2">{streakInfo.current}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {streakInfo.current === 1 ? 'day' : 'days'}
                  </span>
                </div>
                
                {streakInfo.status === 'active' && (
                  <span className="text-xs text-success-600 dark:text-success-400 inline-flex items-center mt-2">
                    <Flame className="w-3 h-3 mr-1" />
                    Active streak!
                  </span>
                )}
                
                {streakInfo.status === 'warning' && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 inline-flex items-center mt-2">
                    <Flame className="w-3 h-3 mr-1" />
                    Train today to keep your streak!
                  </span>
                )}
                
                {streakInfo.status === 'broken' && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 inline-flex items-center mt-2">
                    <Flame className="w-3 h-3 mr-1" />
                    Start a new streak today
                  </span>
                )}
              </div>
              
              {/* Streak Milestones */}
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Streak Rewards</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award size={16} className="text-yellow-500 mr-2" />
                      <span className="text-sm">7 Day Streak</span>
                    </div>
                    <span className="text-sm font-medium text-kai-500">+500 KP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award size={16} className="text-amber-500 mr-2" />
                      <span className="text-sm">30 Day Streak</span>
                    </div>
                    <span className="text-sm font-medium text-kai-500">+1500 KP</span>
                  </div>
                </div>
              </div>
              
              {/* Record Streak */}
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Record Streak</h4>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold mr-2">{streakInfo.max}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {streakInfo.max === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}