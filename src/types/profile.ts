export interface Profile {
  id: string;
  username: string;
  kai_points: number;
  created_at: string;
  updated_at: string | null;
  current_rank: string;
  current_streak: number;
  max_streak: number;
  last_workout_date: string | null;
}