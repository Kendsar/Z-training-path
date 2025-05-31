export interface Workout {
  id: string;
  user_id: string;
  name: string;
  date: string;
  sport_type: string;
  duration: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  kai_points: number;
  is_rest_day: boolean;
}