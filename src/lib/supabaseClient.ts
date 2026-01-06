import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fmxdljayzmpbxpymqoba.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZteGRsamF5em1wYnhweW1xb2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTEzNjMsImV4cCI6MjA4MzIyNzM2M30.q_2RlwmY_ICigTYcTp80hXEjJDv0Ss-yt4YMQwuWBDA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      memes: {
        Row: {
          id: string
          title: string
          image_url: string
          created_at: string
          updated_at: string
          user_id: string
          upvotes: number
          downvotes: number
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          created_at?: string
          updated_at?: string
          user_id: string
          upvotes?: number
          downvotes?: number
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          upvotes?: number
          downvotes?: number
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          image_url: string
          created_at: string
          updated_at: string
          user_id: string
          upvotes: number
          downvotes: number
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          created_at?: string
          updated_at?: string
          user_id: string
          upvotes?: number
          downvotes?: number
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          upvotes?: number
          downvotes?: number
        }
      }
      meme_votes: {
        Row: {
          id: string
          meme_id: string
          user_id: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          meme_id: string
          user_id: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          meme_id?: string
          user_id?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}