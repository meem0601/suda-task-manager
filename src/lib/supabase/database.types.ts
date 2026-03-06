/**
 * Supabase Database型定義
 * 作成日: 2026-03-06
 * 目的: SupabaseのDB構造を型安全に扱うための型定義
 * 
 * 注意: 通常はSupabase CLIで自動生成されますが、
 * ここでは手動で定義しています。
 */

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
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          icon: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          category: '個人' | '事業'
          business_type: '不動産' | '人材' | '経済圏' | '結婚相談所' | 'コーポレート' | 'その他' | null
          category_id: string | null
          priority: '緊急' | '高' | '中' | '低' | null
          ai_priority_score: number | null
          ai_suggestion: string | null
          status: '未着手' | '進行中' | 'レビュー中' | '完了'
          start_date: string | null
          due_date: string | null
          parent_task_id: string | null
          sort_order: number
          is_archived: boolean
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: '個人' | '事業'
          business_type?: '不動産' | '人材' | '経済圏' | '結婚相談所' | 'コーポレート' | 'その他' | null
          category_id?: string | null
          priority?: '緊急' | '高' | '中' | '低' | null
          ai_priority_score?: number | null
          ai_suggestion?: string | null
          status?: '未着手' | '進行中' | 'レビュー中' | '完了'
          start_date?: string | null
          due_date?: string | null
          parent_task_id?: string | null
          sort_order?: number
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: '個人' | '事業'
          business_type?: '不動産' | '人材' | '経済圏' | '結婚相談所' | 'コーポレート' | 'その他' | null
          category_id?: string | null
          priority?: '緊急' | '高' | '中' | '低' | null
          ai_priority_score?: number | null
          ai_suggestion?: string | null
          status?: '未着手' | '進行中' | 'レビュー中' | '完了'
          start_date?: string | null
          due_date?: string | null
          parent_task_id?: string | null
          sort_order?: number
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          completed: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          completed?: boolean
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          completed?: boolean
          created_at?: string
          completed_at?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      task_tags: {
        Row: {
          task_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          task_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          task_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          task_id: string | null
          user_id: string | null
          action: 'created' | 'updated' | 'completed' | 'deleted' | 'status_changed' | 'priority_changed'
          field_name: string | null
          old_value: string | null
          new_value: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id?: string | null
          user_id?: string | null
          action: 'created' | 'updated' | 'completed' | 'deleted' | 'status_changed' | 'priority_changed'
          field_name?: string | null
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string | null
          user_id?: string | null
          action?: 'created' | 'updated' | 'completed' | 'deleted' | 'status_changed' | 'priority_changed'
          field_name?: string | null
          old_value?: string | null
          new_value?: string | null
          created_at?: string
        }
      }
      saved_filters: {
        Row: {
          id: string
          user_id: string
          name: string
          filter_config: Json
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          filter_config: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          filter_config?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recurring_tasks: {
        Row: {
          id: string
          task_id: string
          recurrence_rule: string
          next_occurrence: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          recurrence_rule: string
          next_occurrence?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          recurrence_rule?: string
          next_occurrence?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          task_id: string
          type: 'reminder_1day' | 'reminder_1hour' | 'task_completed' | 'task_overdue'
          title: string
          body: string
          sent_at: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          type: 'reminder_1day' | 'reminder_1hour' | 'task_completed' | 'task_overdue'
          title: string
          body: string
          sent_at?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          type?: 'reminder_1day' | 'reminder_1hour' | 'task_completed' | 'task_overdue'
          title?: string
          body?: string
          sent_at?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          endpoint: string
          p256dh: string
          auth: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          created_at?: string
          updated_at?: string
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
