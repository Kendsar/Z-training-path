import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/profile';
import { useAuthStore } from './authStore';

interface ProfileState {
  profile: Profile | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  
  fetchProfile: async () => {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      set({ profile: null });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      // If no profile exists, try to create one
      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            username: user.user_metadata?.username || 'User',
            kai_points: 0,
            current_rank: 'Human Form',
            current_streak: 0,
            max_streak: 0,
          }])
          .select()
          .single();
          
        if (createError) {
          throw createError;
        }
        
        set({ profile: newProfile });
        return;
      }
      
      set({ profile: data });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ profile: null });
    }
  },
  
  updateProfile: async (updates) => {
    const { user } = useAuthStore.getState();
    const { profile } = useProfileStore.getState();
    
    if (!user || !profile) {
      throw new Error('No authenticated user or profile found');
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      set({ profile: data });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
}));