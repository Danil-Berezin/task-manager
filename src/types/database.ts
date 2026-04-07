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
      users: {
        Row: {
          id: string
          telegram_id: number | null
          role: 'admin' | 'worker'
          full_name: string
          phone: string | null
          specialty: string | null
          is_verified: boolean | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          telegram_id?: number | null
          role: 'admin' | 'worker'
          full_name: string
          phone?: string | null
          specialty?: string | null
          is_verified?: boolean | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          telegram_id?: number | null
          role?: 'admin' | 'worker'
          full_name?: string
          phone?: string | null
          specialty?: string | null
          is_verified?: boolean | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          address: string
          start_time: string
          end_time: string | null
          price: number
          price_overtime: number | null
          workers_needed: number
          pending_count: number
          status: 'open' | 'full' | 'completed' | 'canceled'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          address: string
          start_time: string
          end_time?: string | null
          price: number
          price_overtime?: number | null
          workers_needed?: number
          pending_count?: number
          status?: 'open' | 'full' | 'completed' | 'canceled'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          address?: string
          start_time?: string
          end_time?: string | null
          price?: number
          price_overtime?: number | null
          workers_needed?: number
          pending_count?: number
          status?: 'open' | 'full' | 'completed' | 'canceled'
          created_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          task_id: string
          user_id: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'info' | 'success' | 'warning' | 'error'
          message: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'info' | 'success' | 'warning' | 'error'
          message: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          message?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type User = Database['public']['Tables']['users']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
