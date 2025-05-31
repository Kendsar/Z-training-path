import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { useProfileStore } from './profileStore';
import { Workout } from '../types/workout';
import { addDays, format, differenceInDays } from 'date-fns';

interface WorkoutsState {
  workouts: Workout[];
  isLoading: boolean;
  fetchWorkouts: () => Promise<void>;
  addWorkout: (workout: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'kai_points'>) => Promise<void>;
  updateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
}

export const useWorkoutsStore = create<WorkoutsState>((set, get) => ({
  workouts: [],
  isLoading: false,
  
  fetchWorkouts: async () => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      set({ workouts: [] });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      set({ workouts: data || [] });
    } catch (error) {
      console.error('Error fetching workouts:', error);
      set({ workouts: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addWorkout: async (workout) => {
    const { user } = useAuthStore.getState();
    const { fetchProfile } = useProfileStore.getState();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    try {
      // Insert workout
      const { data, error } = await supabase
        .from('workouts')
        .insert([
          {
            ...workout,
            user_id: user.id,
            kai_points: 100, // Default points for workout
          },
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update workouts list
      set((state) => ({
        workouts: [data, ...state.workouts],
      }));
      
      // Update profile and streaks
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('current_streak, max_streak, last_workout_date, kai_points')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      let updatedStreak = profileData.current_streak;
      let updatedKaiPoints = profileData.kai_points || 0;
      const lastWorkoutDate = profileData.last_workout_date
        ? new Date(profileData.last_workout_date)
        : null;
      const workoutDate = new Date(workout.date);
      
      // Add base kai points
      updatedKaiPoints += 100;
      
      // Handle streak logic
      if (!lastWorkoutDate) {
        // First workout ever
        updatedStreak = 1;
      } else {
        const daysSinceLastWorkout = differenceInDays(
          workoutDate,
          lastWorkoutDate
        );
        
        if (daysSinceLastWorkout <= 1) {
          // Consecutive day or same day
          updatedStreak += daysSinceLastWorkout === 1 ? 1 : 0;
          
          // Check for streak milestones
          if (updatedStreak === 7) {
            updatedKaiPoints += 500; // 7-day streak bonus
          } else if (updatedStreak === 30) {
            updatedKaiPoints += 1500; // 30-day streak bonus
          }
        } else {
          // Streak broken
          updatedStreak = 1;
        }
      }
      
      // Update profile with new streak, kai points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_streak: updatedStreak,
          max_streak: Math.max(updatedStreak, profileData.max_streak || 0),
          last_workout_date: format(workoutDate, 'yyyy-MM-dd'),
          kai_points: updatedKaiPoints,
        })
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Check if rank should be updated based on new kai points
      await handleRankUpgrade(updatedKaiPoints, user.id);
      
      // Refresh profile data
      await fetchProfile();
      
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  },
  
  updateWorkout: async (id, updates) => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    try {
      const { data, error } = await supabase
        .from('workouts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      set((state) => ({
        workouts: state.workouts.map((workout) =>
          workout.id === id ? data : workout
        ),
      }));
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  },
  
  deleteWorkout: async (id) => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      set((state) => ({
        workouts: state.workouts.filter((workout) => workout.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },
}));

// Helper function to handle rank upgrades based on kai points
async function handleRankUpgrade(kaiPoints: number, userId: string) {
  const rankProgression = [
    { name: 'Human Form', threshold: 0 },
    { name: 'Initiate Saiyan', threshold: 700 },
    { name: 'Saiyan', threshold: 1400 },
    { name: 'Super Saiyan', threshold: 3000 },
    { name: 'SSJ2', threshold: 6000 },
    { name: 'SSJ3', threshold: 9000 },
    { name: 'Blue Sign', threshold: 14000 },
    { name: 'Final Form', threshold: 20000 },
    { name: 'God Form', threshold: 30000 },
  ];
  
  // Find the highest rank the user qualifies for
  let newRank = rankProgression[0].name;
  
  for (let i = rankProgression.length - 1; i >= 0; i--) {
    if (kaiPoints >= rankProgression[i].threshold) {
      newRank = rankProgression[i].name;
      break;
    }
  }
  
  // Update profile with new rank if needed
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('current_rank')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error('Error checking rank:', profileError);
    return;
  }
  
  if (profileData.current_rank !== newRank) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_rank: newRank })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating rank:', updateError);
    }
  }
}