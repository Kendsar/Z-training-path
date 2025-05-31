export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          kai_points: number
          created_at: string
          updated_at: string | null
          current_rank: string
          current_streak: number
          max_streak: number
          last_workout_date: string | null
        }
        Insert: {
          id: string
          username: string
          kai_points?: number
          created_at?: string
          updated_at?: string | null
          current_rank?: string
          current_streak?: number
          max_streak?: number
          last_workout_date?: string | null
        }
        Update: {
          id?: string
          username?: string
          kai_points?: number
          created_at?: string
          updated_at?: string | null
          current_rank?: string
          current_streak?: number
          max_streak?: number
          last_workout_date?: string | null
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          date: string
          sport_type: string
          duration: number | null
          notes: string | null
          created_at: string
          updated_at: string | null
          kai_points: number
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date: string
          sport_type: string
          duration?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
          kai_points?: number
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          date?: string
          sport_type?: string
          duration?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
          kai_points?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}