export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          id: string
          setting_type: string
          settings: Json
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          setting_type: string
          settings?: Json
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          setting_type?: string
          settings?: Json
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          clicked_at: string
          id: string
          ip_address: string | null
          landing_page: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          clicked_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_materials: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_proposals: {
        Row: {
          accepted_at: string | null
          affiliate_id: string
          ai_analysis: Json | null
          cancelled_at: string | null
          commission_amount: number | null
          commission_paid: boolean | null
          commission_paid_at: string | null
          commission_rate: number | null
          company_cnpj: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          contact_name: string | null
          created_at: string
          generated_proposal: Json | null
          id: string
          niche_id: string | null
          notes: string | null
          proposal_generated_at: string | null
          proposal_value: number | null
          questionnaire_answers: Json | null
          questionnaire_completed: boolean | null
          sent_at: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          affiliate_id: string
          ai_analysis?: Json | null
          cancelled_at?: string | null
          commission_amount?: number | null
          commission_paid?: boolean | null
          commission_paid_at?: string | null
          commission_rate?: number | null
          company_cnpj?: string | null
          company_email?: string | null
          company_name: string
          company_phone?: string | null
          contact_name?: string | null
          created_at?: string
          generated_proposal?: Json | null
          id?: string
          niche_id?: string | null
          notes?: string | null
          proposal_generated_at?: string | null
          proposal_value?: number | null
          questionnaire_answers?: Json | null
          questionnaire_completed?: boolean | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          affiliate_id?: string
          ai_analysis?: Json | null
          cancelled_at?: string | null
          commission_amount?: number | null
          commission_paid?: boolean | null
          commission_paid_at?: string | null
          commission_rate?: number | null
          company_cnpj?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          contact_name?: string | null
          created_at?: string
          generated_proposal?: Json | null
          id?: string
          niche_id?: string | null
          notes?: string | null
          proposal_generated_at?: string | null
          proposal_value?: number | null
          questionnaire_answers?: Json | null
          questionnaire_completed?: boolean | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_proposals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_proposals_niche_id_fkey"
            columns: ["niche_id"]
            isOneToOne: false
            referencedRelation: "business_niches"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_prospect_sends: {
        Row: {
          affiliate_id: string
          channel: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string | null
          proposal_snapshot: Json | null
          prospect_id: string
          queued_at: string | null
          read_at: string | null
          replied_at: string | null
          reply_content: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          channel: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          proposal_snapshot?: Json | null
          prospect_id: string
          queued_at?: string | null
          read_at?: string | null
          replied_at?: string | null
          reply_content?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          channel?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          proposal_snapshot?: Json | null
          prospect_id?: string
          queued_at?: string | null
          read_at?: string | null
          replied_at?: string | null
          reply_content?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_prospect_sends_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_prospect_sends_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "affiliate_prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_prospect_settings: {
        Row: {
          affiliate_id: string
          auto_send_enabled: boolean | null
          created_at: string
          daily_limit: number | null
          genesis_instance_id: string | null
          id: string
          include_analysis: boolean | null
          include_proposal_link: boolean | null
          last_sent_at: string | null
          max_delay_seconds: number | null
          message_template: string | null
          messages_per_hour: number | null
          min_delay_seconds: number | null
          send_days: number[] | null
          send_end_hour: number | null
          send_start_hour: number | null
          total_sent_month: number | null
          total_sent_today: number | null
          total_sent_week: number | null
          updated_at: string
          warmup_day: number | null
          warmup_enabled: boolean | null
          warmup_increment_percent: number | null
        }
        Insert: {
          affiliate_id: string
          auto_send_enabled?: boolean | null
          created_at?: string
          daily_limit?: number | null
          genesis_instance_id?: string | null
          id?: string
          include_analysis?: boolean | null
          include_proposal_link?: boolean | null
          last_sent_at?: string | null
          max_delay_seconds?: number | null
          message_template?: string | null
          messages_per_hour?: number | null
          min_delay_seconds?: number | null
          send_days?: number[] | null
          send_end_hour?: number | null
          send_start_hour?: number | null
          total_sent_month?: number | null
          total_sent_today?: number | null
          total_sent_week?: number | null
          updated_at?: string
          warmup_day?: number | null
          warmup_enabled?: boolean | null
          warmup_increment_percent?: number | null
        }
        Update: {
          affiliate_id?: string
          auto_send_enabled?: boolean | null
          created_at?: string
          daily_limit?: number | null
          genesis_instance_id?: string | null
          id?: string
          include_analysis?: boolean | null
          include_proposal_link?: boolean | null
          last_sent_at?: string | null
          max_delay_seconds?: number | null
          message_template?: string | null
          messages_per_hour?: number | null
          min_delay_seconds?: number | null
          send_days?: number[] | null
          send_end_hour?: number | null
          send_start_hour?: number | null
          total_sent_month?: number | null
          total_sent_today?: number | null
          total_sent_week?: number | null
          updated_at?: string
          warmup_day?: number | null
          warmup_enabled?: boolean | null
          warmup_increment_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_prospect_settings_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: true
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_prospects: {
        Row: {
          affiliate_id: string
          analysis_data: Json | null
          analysis_score: number | null
          auto_send_enabled: boolean | null
          company_address: string | null
          company_city: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          company_state: string | null
          company_website: string | null
          created_at: string
          generated_proposal: Json | null
          id: string
          message_sent: string | null
          missing_features: string[] | null
          niche: string | null
          notes: string | null
          pain_points: string[] | null
          proposal_generated_at: string | null
          reply_received: string | null
          reply_received_at: string | null
          scheduled_send_at: string | null
          sent_at: string | null
          sent_via: string | null
          source: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          analysis_data?: Json | null
          analysis_score?: number | null
          auto_send_enabled?: boolean | null
          company_address?: string | null
          company_city?: string | null
          company_email?: string | null
          company_name: string
          company_phone?: string | null
          company_state?: string | null
          company_website?: string | null
          created_at?: string
          generated_proposal?: Json | null
          id?: string
          message_sent?: string | null
          missing_features?: string[] | null
          niche?: string | null
          notes?: string | null
          pain_points?: string[] | null
          proposal_generated_at?: string | null
          reply_received?: string | null
          reply_received_at?: string | null
          scheduled_send_at?: string | null
          sent_at?: string | null
          sent_via?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          analysis_data?: Json | null
          analysis_score?: number | null
          auto_send_enabled?: boolean | null
          company_address?: string | null
          company_city?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          company_state?: string | null
          company_website?: string | null
          created_at?: string
          generated_proposal?: Json | null
          id?: string
          message_sent?: string | null
          missing_features?: string[] | null
          niche?: string | null
          notes?: string | null
          pain_points?: string[] | null
          proposal_generated_at?: string | null
          reply_received?: string | null
          reply_received_at?: string | null
          scheduled_send_at?: string | null
          sent_at?: string | null
          sent_via?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_prospects_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          commission_amount: number | null
          commission_rate: number | null
          confirmed_at: string | null
          converted_at: string | null
          created_at: string
          id: string
          paid_at: string | null
          plan_name: string | null
          plan_price: number | null
          referred_user_id: string
          status: Database["public"]["Enums"]["referral_status"]
          trial_expires_at: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number | null
          commission_rate?: number | null
          confirmed_at?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          plan_name?: string | null
          plan_price?: number | null
          referred_user_id: string
          status?: Database["public"]["Enums"]["referral_status"]
          trial_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number | null
          commission_rate?: number | null
          confirmed_at?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          plan_name?: string | null
          plan_price?: number | null
          referred_user_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
          trial_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_verification_codes: {
        Row: {
          attempts: number
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          name: string
          password_hash: string
          phone: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          name: string
          password_hash: string
          phone: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          name?: string
          password_hash?: string
          phone?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      affiliate_withdrawals: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          pix_key: string
          pix_type: Database["public"]["Enums"]["pix_type"]
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"]
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          pix_key: string
          pix_type: Database["public"]["Enums"]["pix_type"]
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          pix_key?: string
          pix_type?: Database["public"]["Enums"]["pix_type"]
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_withdrawals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          available_balance: number
          commission_rate_lifetime: number
          commission_rate_monthly: number
          created_at: string
          created_by: string | null
          email: string
          id: string
          name: string
          password_hash: string
          pending_balance: number
          pix_key: string | null
          pix_type: Database["public"]["Enums"]["pix_type"] | null
          status: Database["public"]["Enums"]["affiliate_status"]
          total_earnings: number
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          affiliate_code: string
          available_balance?: number
          commission_rate_lifetime?: number
          commission_rate_monthly?: number
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
          pending_balance?: number
          pix_key?: string | null
          pix_type?: Database["public"]["Enums"]["pix_type"] | null
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_earnings?: number
          updated_at?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          affiliate_code?: string
          available_balance?: number
          commission_rate_lifetime?: number
          commission_rate_monthly?: number
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
          pending_balance?: number
          pix_key?: string | null
          pix_type?: Database["public"]["Enums"]["pix_type"] | null
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_earnings?: number
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          barber_id: string
          client_name: string
          client_phone: string
          created_at: string
          date: string
          id: string
          protocol: string
          service_id: string
          status: string
          tenant_id: string | null
          time: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          barber_id: string
          client_name: string
          client_phone: string
          created_at?: string
          date: string
          id?: string
          protocol: string
          service_id: string
          status?: string
          tenant_id?: string | null
          time: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          barber_id?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          date?: string
          id?: string
          protocol?: string
          service_id?: string
          status?: string
          tenant_id?: string | null
          time?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      barber_availability: {
        Row: {
          available_slots: string[]
          barber_id: string
          created_at: string
          date: string
          id: string
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          available_slots?: string[]
          barber_id: string
          created_at?: string
          date: string
          id?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          available_slots?: string[]
          barber_id?: string
          created_at?: string
          date?: string
          id?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barber_availability_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_leaves: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          barber_id: string
          created_at: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          barber_id: string
          created_at?: string
          end_date: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          barber_id?: string
          created_at?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barber_leaves_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_performance: {
        Row: {
          avg_rating: number | null
          avg_service_time: number | null
          barber_id: string
          cancelled_appointments: number
          completed_appointments: number
          created_at: string
          id: string
          most_popular_service_id: string | null
          new_clients: number
          no_show_appointments: number
          period_end: string
          period_start: string
          period_type: string
          returning_clients: number
          tenant_id: string | null
          total_appointments: number
          total_revenue: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avg_rating?: number | null
          avg_service_time?: number | null
          barber_id: string
          cancelled_appointments?: number
          completed_appointments?: number
          created_at?: string
          id?: string
          most_popular_service_id?: string | null
          new_clients?: number
          no_show_appointments?: number
          period_end: string
          period_start: string
          period_type?: string
          returning_clients?: number
          tenant_id?: string | null
          total_appointments?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avg_rating?: number | null
          avg_service_time?: number | null
          barber_id?: string
          cancelled_appointments?: number
          completed_appointments?: number
          created_at?: string
          id?: string
          most_popular_service_id?: string | null
          new_clients?: number
          no_show_appointments?: number
          period_end?: string
          period_start?: string
          period_type?: string
          returning_clients?: number
          tenant_id?: string | null
          total_appointments?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barber_performance_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barber_performance_most_popular_service_id_fkey"
            columns: ["most_popular_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_schedules: {
        Row: {
          barber_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_enabled: boolean
          start_time: string
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          barber_id: string
          created_at?: string
          day_of_week: number
          end_time?: string
          id?: string
          is_enabled?: boolean
          start_time?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          barber_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_enabled?: boolean
          start_time?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barber_schedules_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barbers: {
        Row: {
          available: boolean | null
          created_at: string
          experience: string | null
          id: string
          name: string
          photo: string | null
          rating: number | null
          specialties: string[] | null
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          available?: boolean | null
          created_at?: string
          experience?: string | null
          id?: string
          name: string
          photo?: string | null
          rating?: number | null
          specialties?: string[] | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          available?: boolean | null
          created_at?: string
          experience?: string | null
          id?: string
          name?: string
          photo?: string | null
          rating?: number | null
          specialties?: string[] | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blocked_slots: {
        Row: {
          barber_id: string
          created_at: string
          date: string
          end_time: string
          id: string
          reason: string | null
          start_time: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          barber_id: string
          created_at?: string
          date: string
          end_time: string
          id?: string
          reason?: string | null
          start_time: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          barber_id?: string
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          reason?: string | null
          start_time?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_slots_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      business_niches: {
        Row: {
          base_questions: Json
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          base_questions?: Json
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          base_questions?: Json
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      captcha_verifications: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          token_hash: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          token_hash: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          token_hash?: string
        }
        Relationships: []
      }
      chatbot_ab_test_results: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          contact_phone: string | null
          conversion_value: number | null
          converted: boolean | null
          created_at: string | null
          id: string
          session_id: string | null
          started_at: string | null
          test_id: string
          variant: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          contact_phone?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          started_at?: string | null
          test_id: string
          variant: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          contact_phone?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          started_at?: string | null
          test_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_ab_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "chatbot_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_ab_tests: {
        Row: {
          chatbot_id: string
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          name: string
          started_at: string | null
          traffic_split: number | null
          updated_at: string | null
          variant_a_flow: Json
          variant_a_name: string | null
          variant_b_flow: Json
          variant_b_name: string | null
          winner_variant: string | null
        }
        Insert: {
          chatbot_id: string
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          started_at?: string | null
          traffic_split?: number | null
          updated_at?: string | null
          variant_a_flow: Json
          variant_a_name?: string | null
          variant_b_flow: Json
          variant_b_name?: string | null
          winner_variant?: string | null
        }
        Update: {
          chatbot_id?: string
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          started_at?: string | null
          traffic_split?: number | null
          updated_at?: string | null
          variant_a_flow?: Json
          variant_a_name?: string | null
          variant_b_flow?: Json
          variant_b_name?: string | null
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_ab_tests_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_analytics: {
        Row: {
          abandoned_sessions: number | null
          avg_duration_seconds: number | null
          chatbot_id: string
          completed_sessions: number | null
          created_at: string | null
          date: string
          human_transfers: number | null
          id: string
          total_messages: number | null
          total_sessions: number | null
          unique_contacts: number | null
          updated_at: string | null
        }
        Insert: {
          abandoned_sessions?: number | null
          avg_duration_seconds?: number | null
          chatbot_id: string
          completed_sessions?: number | null
          created_at?: string | null
          date?: string
          human_transfers?: number | null
          id?: string
          total_messages?: number | null
          total_sessions?: number | null
          unique_contacts?: number | null
          updated_at?: string | null
        }
        Update: {
          abandoned_sessions?: number | null
          avg_duration_seconds?: number | null
          chatbot_id?: string
          completed_sessions?: number | null
          created_at?: string | null
          date?: string
          human_transfers?: number | null
          id?: string
          total_messages?: number | null
          total_sessions?: number | null
          unique_contacts?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_analytics_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_inbound_dedup: {
        Row: {
          chatbot_id: string | null
          created_at: string
          from_jid: string | null
          id: string
          instance_id: string
          message_id: string
          session_id: string | null
        }
        Insert: {
          chatbot_id?: string | null
          created_at?: string
          from_jid?: string | null
          id?: string
          instance_id: string
          message_id: string
          session_id?: string | null
        }
        Update: {
          chatbot_id?: string | null
          created_at?: string
          from_jid?: string | null
          id?: string
          instance_id?: string
          message_id?: string
          session_id?: string | null
        }
        Relationships: []
      }
      chatbot_operating_hours: {
        Row: {
          chatbot_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_enabled: boolean | null
          start_time: string
          timezone: string | null
        }
        Insert: {
          chatbot_id: string
          created_at?: string | null
          day_of_week: number
          end_time?: string
          id?: string
          is_enabled?: boolean | null
          start_time?: string
          timezone?: string | null
        }
        Update: {
          chatbot_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_enabled?: boolean | null
          start_time?: string
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_operating_hours_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_session_logs: {
        Row: {
          chatbot_id: string | null
          created_at: string | null
          error_message: string | null
          event_data: Json | null
          event_type: string
          id: string
          luna_reasoning: string | null
          message_in: string | null
          message_out: string | null
          session_id: string | null
          step_from: string | null
          step_to: string | null
        }
        Insert: {
          chatbot_id?: string | null
          created_at?: string | null
          error_message?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          luna_reasoning?: string | null
          message_in?: string | null
          message_out?: string | null
          session_id?: string | null
          step_from?: string | null
          step_to?: string | null
        }
        Update: {
          chatbot_id?: string | null
          created_at?: string | null
          error_message?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          luna_reasoning?: string | null
          message_in?: string | null
          message_out?: string | null
          session_id?: string | null
          step_from?: string | null
          step_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_session_logs_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_session_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chatbot_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_sessions: {
        Row: {
          attempt_count: number | null
          awaiting_response: boolean | null
          awaiting_type: string | null
          chatbot_id: string
          contact_id: string
          context: Json | null
          created_at: string | null
          current_step: string | null
          current_step_id: string | null
          ended_at: string | null
          expected_options: Json | null
          history: Json | null
          id: string
          instance_id: string | null
          last_interaction_at: string | null
          last_message_at: string | null
          started_at: string | null
          status: string | null
          step_data: Json | null
          updated_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          awaiting_response?: boolean | null
          awaiting_type?: string | null
          chatbot_id: string
          contact_id: string
          context?: Json | null
          created_at?: string | null
          current_step?: string | null
          current_step_id?: string | null
          ended_at?: string | null
          expected_options?: Json | null
          history?: Json | null
          id?: string
          instance_id?: string | null
          last_interaction_at?: string | null
          last_message_at?: string | null
          started_at?: string | null
          status?: string | null
          step_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          awaiting_response?: boolean | null
          awaiting_type?: string | null
          chatbot_id?: string
          contact_id?: string
          context?: Json | null
          created_at?: string | null
          current_step?: string | null
          current_step_id?: string | null
          ended_at?: string | null
          expected_options?: Json | null
          history?: Json | null
          id?: string
          instance_id?: string | null
          last_interaction_at?: string | null
          last_message_at?: string | null
          started_at?: string | null
          status?: string | null
          step_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_sessions_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_sessions_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_templates: {
        Row: {
          ai_enabled: boolean | null
          ai_model: string | null
          ai_system_prompt: string
          ai_temperature: number | null
          category: string
          created_at: string | null
          description: string | null
          editable_fields: Json | null
          flow_structure: Json | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          menu_options: Json | null
          name: string
          preview_image: string | null
          response_content: string | null
          response_type: string | null
          slug: string
          sort_order: number | null
          trigger_keywords: string[] | null
          trigger_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          ai_enabled?: boolean | null
          ai_model?: string | null
          ai_system_prompt: string
          ai_temperature?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          editable_fields?: Json | null
          flow_structure?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          menu_options?: Json | null
          name: string
          preview_image?: string | null
          response_content?: string | null
          response_type?: string | null
          slug: string
          sort_order?: number | null
          trigger_keywords?: string[] | null
          trigger_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          ai_enabled?: boolean | null
          ai_model?: string | null
          ai_system_prompt?: string
          ai_temperature?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          editable_fields?: Json | null
          flow_structure?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          menu_options?: Json | null
          name?: string
          preview_image?: string | null
          response_content?: string | null
          response_type?: string | null
          slug?: string
          sort_order?: number | null
          trigger_keywords?: string[] | null
          trigger_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      chatpro_config: {
        Row: {
          api_token: string | null
          base_endpoint: string | null
          created_at: string
          id: string
          instance_id: string | null
          is_enabled: boolean | null
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          api_token?: string | null
          base_endpoint?: string | null
          created_at?: string
          id?: string
          instance_id?: string | null
          is_enabled?: boolean | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          api_token?: string | null
          base_endpoint?: string | null
          created_at?: string
          id?: string
          instance_id?: string | null
          is_enabled?: boolean | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contact_leads: {
        Row: {
          contacted_at: string | null
          converted_at: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string | null
          notes: string | null
          plan_interest: string
          status: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          notes?: string | null
          plan_interest?: string
          status?: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          notes?: string | null
          plan_interest?: string
          status?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      crm_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          crm_tenant_id: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          crm_tenant_id: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          crm_tenant_id?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_audit_logs_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_collaborator_tokens: {
        Row: {
          access_level: string
          created_at: string | null
          created_by: string | null
          crm_tenant_id: string
          expires_at: string | null
          id: string
          is_used: boolean | null
          name: string
          token: string
          used_at: string | null
          whatsapp: string
        }
        Insert: {
          access_level?: string
          created_at?: string | null
          created_by?: string | null
          crm_tenant_id: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          name: string
          token: string
          used_at?: string | null
          whatsapp: string
        }
        Update: {
          access_level?: string
          created_at?: string | null
          created_by?: string | null
          crm_tenant_id?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          name?: string
          token?: string
          used_at?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_collaborator_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_collaborator_tokens_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_custom_fields: {
        Row: {
          created_at: string | null
          crm_tenant_id: string
          field_type: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          options: Json | null
          position: number | null
        }
        Insert: {
          created_at?: string | null
          crm_tenant_id: string
          field_type?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          options?: Json | null
          position?: number | null
        }
        Update: {
          created_at?: string | null
          crm_tenant_id?: string
          field_type?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          options?: Json | null
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_custom_fields_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_funnel_stages: {
        Row: {
          color: string | null
          created_at: string | null
          crm_tenant_id: string
          funnel_id: string
          id: string
          is_final: boolean | null
          is_won: boolean | null
          name: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          crm_tenant_id: string
          funnel_id: string
          id?: string
          is_final?: boolean | null
          is_won?: boolean | null
          name: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          crm_tenant_id?: string
          funnel_id?: string
          id?: string
          is_final?: boolean | null
          is_won?: boolean | null
          name?: string
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_funnel_stages_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_funnel_stages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "crm_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_funnels: {
        Row: {
          color: string | null
          created_at: string | null
          crm_tenant_id: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          pipeline_id: string | null
          position: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          crm_tenant_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pipeline_id?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          crm_tenant_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pipeline_id?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_funnels_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_funnels_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_lead_history: {
        Row: {
          action: string
          created_at: string | null
          crm_tenant_id: string
          id: string
          lead_id: string
          new_value: Json | null
          notes: string | null
          old_value: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          crm_tenant_id: string
          id?: string
          lead_id: string
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          crm_tenant_id?: string
          id?: string
          lead_id?: string
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_history_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_lead_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_lead_tags: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_lead_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "crm_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          company: string | null
          created_at: string | null
          created_by: string | null
          crm_tenant_id: string
          custom_fields: Json | null
          email: string | null
          funnel_id: string | null
          id: string
          loss_reason_id: string | null
          lost_at: string | null
          name: string
          notes: string | null
          origin: string | null
          phone: string | null
          pipeline_id: string | null
          responsible_id: string | null
          stage_entered_at: string | null
          stage_id: string | null
          status: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at: string | null
          value: number | null
          won_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          crm_tenant_id: string
          custom_fields?: Json | null
          email?: string | null
          funnel_id?: string | null
          id?: string
          loss_reason_id?: string | null
          lost_at?: string | null
          name: string
          notes?: string | null
          origin?: string | null
          phone?: string | null
          pipeline_id?: string | null
          responsible_id?: string | null
          stage_entered_at?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at?: string | null
          value?: number | null
          won_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          crm_tenant_id?: string
          custom_fields?: Json | null
          email?: string | null
          funnel_id?: string | null
          id?: string
          loss_reason_id?: string | null
          lost_at?: string | null
          name?: string
          notes?: string | null
          origin?: string | null
          phone?: string | null
          pipeline_id?: string | null
          responsible_id?: string | null
          stage_entered_at?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at?: string | null
          value?: number | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "crm_funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_loss_reason_id_fkey"
            columns: ["loss_reason_id"]
            isOneToOne: false
            referencedRelation: "crm_loss_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_funnel_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_loss_reasons: {
        Row: {
          created_at: string | null
          crm_tenant_id: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          crm_tenant_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          crm_tenant_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_loss_reasons_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notifications: {
        Row: {
          created_at: string | null
          crm_tenant_id: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          crm_tenant_id: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          crm_tenant_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_notifications_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipelines: {
        Row: {
          created_at: string | null
          created_by: string | null
          crm_tenant_id: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          crm_tenant_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          crm_tenant_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipelines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_pipelines_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tags: {
        Row: {
          color: string | null
          created_at: string | null
          crm_tenant_id: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          crm_tenant_id: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          crm_tenant_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tags_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          crm_tenant_id: string
          description: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          priority: number | null
          reminder_at: string | null
          status: Database["public"]["Enums"]["crm_task_status"] | null
          task_type: Database["public"]["Enums"]["crm_task_type"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          crm_tenant_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: number | null
          reminder_at?: string | null
          status?: Database["public"]["Enums"]["crm_task_status"] | null
          task_type?: Database["public"]["Enums"]["crm_task_type"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          crm_tenant_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: number | null
          reminder_at?: string | null
          status?: Database["public"]["Enums"]["crm_task_status"] | null
          task_type?: Database["public"]["Enums"]["crm_task_type"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tenants: {
        Row: {
          company_data: Json | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          owner_user_id: string
          segment: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          company_data?: Json | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          owner_user_id: string
          segment?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          company_data?: Json | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          owner_user_id?: string
          segment?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crm_users: {
        Row: {
          auth_user_id: string
          created_at: string | null
          crm_tenant_id: string
          email: string
          id: string
          is_active: boolean | null
          name: string
          permissions: Json | null
          role: Database["public"]["Enums"]["crm_role"]
          updated_at: string | null
        }
        Insert: {
          auth_user_id: string
          created_at?: string | null
          crm_tenant_id: string
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["crm_role"]
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string
          created_at?: string | null
          crm_tenant_id?: string
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["crm_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_users_crm_tenant_id_fkey"
            columns: ["crm_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_confirmation_tokens: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          phone: string | null
          token: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          phone?: string | null
          token: string
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          phone?: string | null
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string
          status: string
          subject: string
          template_type: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string
          status?: string
          subject: string
          template_type: string
        }
        Update: {
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string
          status?: string
          subject?: string
          template_type?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      email_webhook_events: {
        Row: {
          created_at: string | null
          email_id: string | null
          event_type: string
          id: string
          payload: Json
          recipient_email: string | null
        }
        Insert: {
          created_at?: string | null
          email_id?: string | null
          event_type: string
          id?: string
          payload?: Json
          recipient_email?: string | null
        }
        Update: {
          created_at?: string | null
          email_id?: string | null
          event_type?: string
          id?: string
          payload?: Json
          recipient_email?: string | null
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          avatar_type: string
          avatar_url: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          name: string
          rating: number
          status: string
          tenant_id: string | null
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_type?: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          name: string
          rating: number
          status?: string
          tenant_id?: string | null
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_type?: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          name?: string
          rating?: number
          status?: string
          tenant_id?: string | null
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flow_ai_settings: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          fallback_model: string | null
          fallback_provider: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model: string | null
          provider: string
          rate_limit_per_minute: number | null
          scope_id: string
          scope_type: string
          temperature: number | null
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          fallback_model?: string | null
          fallback_provider?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          provider?: string
          rate_limit_per_minute?: number | null
          scope_id: string
          scope_type?: string
          temperature?: number | null
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          fallback_model?: string | null
          fallback_provider?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          provider?: string
          rate_limit_per_minute?: number | null
          scope_id?: string
          scope_type?: string
          temperature?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      flow_execution_context: {
        Row: {
          context_key: string
          context_value: Json | null
          created_at: string
          execution_id: string
          expires_at: string | null
          flow_id: string
          id: string
          scope: string | null
          updated_at: string
        }
        Insert: {
          context_key: string
          context_value?: Json | null
          created_at?: string
          execution_id: string
          expires_at?: string | null
          flow_id: string
          id?: string
          scope?: string | null
          updated_at?: string
        }
        Update: {
          context_key?: string
          context_value?: Json | null
          created_at?: string
          execution_id?: string
          expires_at?: string | null
          flow_id?: string
          id?: string
          scope?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_execution_context_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_execution_history: {
        Row: {
          completed_at: string | null
          context_snapshot: Json | null
          created_at: string
          duration_ms: number | null
          error_details: Json | null
          execution_id: string
          flow_id: string
          id: string
          node_timeline: Json | null
          parent_execution_id: string | null
          retry_count: number | null
          started_at: string
          status: string
          trigger_data: Json | null
          trigger_type: string | null
        }
        Insert: {
          completed_at?: string | null
          context_snapshot?: Json | null
          created_at?: string
          duration_ms?: number | null
          error_details?: Json | null
          execution_id?: string
          flow_id: string
          id?: string
          node_timeline?: Json | null
          parent_execution_id?: string | null
          retry_count?: number | null
          started_at?: string
          status?: string
          trigger_data?: Json | null
          trigger_type?: string | null
        }
        Update: {
          completed_at?: string | null
          context_snapshot?: Json | null
          created_at?: string
          duration_ms?: number | null
          error_details?: Json | null
          execution_id?: string
          flow_id?: string
          id?: string
          node_timeline?: Json | null
          parent_execution_id?: string | null
          retry_count?: number | null
          started_at?: string
          status?: string
          trigger_data?: Json | null
          trigger_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_execution_history_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_node_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          execution_id: string
          flow_id: string
          id: string
          input_data: Json | null
          node_id: string
          node_label: string | null
          node_type: string
          output_data: Json | null
          retry_attempt: number | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          execution_id: string
          flow_id: string
          id?: string
          input_data?: Json | null
          node_id: string
          node_label?: string | null
          node_type: string
          output_data?: Json | null
          retry_attempt?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          execution_id?: string
          flow_id?: string
          id?: string
          input_data?: Json | null
          node_id?: string
          node_label?: string | null
          node_type?: string
          output_data?: Json | null
          retry_attempt?: number | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_node_executions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_protection: {
        Row: {
          attempt_type: string
          created_at: string
          email: string
          fingerprint: string | null
          id: string
          ip_address: string
          is_blocked: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempt_type?: string
          created_at?: string
          email: string
          fingerprint?: string | null
          id?: string
          ip_address: string
          is_blocked?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string
          email?: string
          fingerprint?: string | null
          id?: string
          ip_address?: string
          is_blocked?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          tenant_id: string
          title: string | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          tenant_id: string
          title?: string | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          tenant_id?: string
          title?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_agent_metrics_daily: {
        Row: {
          agent_id: string
          avg_handling_time_seconds: number | null
          avg_response_time_seconds: number | null
          away_minutes: number | null
          conversations_handled: number | null
          created_at: string | null
          date: string
          first_response_within_sla: number | null
          id: string
          instance_id: string
          messages_sent: number | null
          nps_responses: number | null
          nps_score_avg: number | null
          online_minutes: number | null
          resolution_within_sla: number | null
          transfers_in: number | null
          transfers_out: number | null
        }
        Insert: {
          agent_id: string
          avg_handling_time_seconds?: number | null
          avg_response_time_seconds?: number | null
          away_minutes?: number | null
          conversations_handled?: number | null
          created_at?: string | null
          date: string
          first_response_within_sla?: number | null
          id?: string
          instance_id: string
          messages_sent?: number | null
          nps_responses?: number | null
          nps_score_avg?: number | null
          online_minutes?: number | null
          resolution_within_sla?: number | null
          transfers_in?: number | null
          transfers_out?: number | null
        }
        Update: {
          agent_id?: string
          avg_handling_time_seconds?: number | null
          avg_response_time_seconds?: number | null
          away_minutes?: number | null
          conversations_handled?: number | null
          created_at?: string | null
          date?: string
          first_response_within_sla?: number | null
          id?: string
          instance_id?: string
          messages_sent?: number | null
          nps_responses?: number | null
          nps_score_avg?: number | null
          online_minutes?: number | null
          resolution_within_sla?: number | null
          transfers_in?: number | null
          transfers_out?: number | null
        }
        Relationships: []
      }
      genesis_agent_schedules: {
        Row: {
          agent_id: string
          auto_message: string | null
          auto_message_sent: boolean | null
          client_name: string | null
          client_phone: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          instance_id: string
          notes: string | null
          reminder_minutes: number[] | null
          reminder_sent: boolean[] | null
          scheduled_at: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          auto_message?: string | null
          auto_message_sent?: boolean | null
          client_name?: string | null
          client_phone: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instance_id: string
          notes?: string | null
          reminder_minutes?: number[] | null
          reminder_sent?: boolean[] | null
          scheduled_at: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          auto_message?: string | null
          auto_message_sent?: boolean | null
          client_name?: string | null
          client_phone?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instance_id?: string
          notes?: string | null
          reminder_minutes?: number[] | null
          reminder_sent?: boolean[] | null
          scheduled_at?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      genesis_ai_assistant_logs: {
        Row: {
          action_type: string
          created_at: string | null
          error_message: string | null
          id: string
          input_text: string | null
          instance_id: string | null
          latency_ms: number | null
          metadata: Json | null
          output_text: string | null
          rewrite_style: string | null
          session_id: string | null
          success: boolean | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_text?: string | null
          instance_id?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          output_text?: string | null
          rewrite_style?: string | null
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_text?: string | null
          instance_id?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          output_text?: string | null
          rewrite_style?: string | null
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      genesis_alert_rules: {
        Row: {
          alert_severity: string
          condition_operator: string
          cooldown_minutes: number | null
          created_at: string | null
          description: string | null
          evaluation_window_minutes: number | null
          id: string
          instance_id: string | null
          is_enabled: boolean | null
          last_triggered_at: string | null
          metric_type: string
          name: string
          notify_email: boolean | null
          notify_webhook: boolean | null
          threshold_value: number
          trigger_count: number | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          alert_severity?: string
          condition_operator: string
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          evaluation_window_minutes?: number | null
          id?: string
          instance_id?: string | null
          is_enabled?: boolean | null
          last_triggered_at?: string | null
          metric_type: string
          name: string
          notify_email?: boolean | null
          notify_webhook?: boolean | null
          threshold_value: number
          trigger_count?: number | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          alert_severity?: string
          condition_operator?: string
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          evaluation_window_minutes?: number | null
          id?: string
          instance_id?: string | null
          is_enabled?: boolean | null
          last_triggered_at?: string | null
          metric_type?: string
          name?: string
          notify_email?: boolean | null
          notify_webhook?: boolean | null
          threshold_value?: number
          trigger_count?: number | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_alert_rules_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          auto_resolve_after: unknown
          auto_resolved: boolean | null
          created_at: string | null
          id: string
          instance_id: string | null
          message: string
          metadata: Json | null
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
          vps_node_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          auto_resolve_after?: unknown
          auto_resolved?: boolean | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          message: string
          metadata?: Json | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
          vps_node_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          auto_resolve_after?: unknown
          auto_resolved?: boolean | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          message?: string
          metadata?: Json | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          vps_node_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_alerts_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_alerts_vps_node_id_fkey"
            columns: ["vps_node_id"]
            isOneToOne: false
            referencedRelation: "genesis_vps_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_api_status: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          last_check_at: string | null
          response_time_ms: number | null
          service_name: string
          service_type: string
          status: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          last_check_at?: string | null
          response_time_ms?: number | null
          service_name: string
          service_type: string
          status: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          last_check_at?: string | null
          response_time_ms?: number | null
          service_name?: string
          service_type?: string
          status?: string
        }
        Relationships: []
      }
      genesis_automation_logs: {
        Row: {
          action_result: string
          action_type: string
          created_at: string
          credits_consumed: number
          duration_ms: number
          error_message: string | null
          event_id: string | null
          event_type: string | null
          id: string
          instance_id: string
          rule_id: string | null
        }
        Insert: {
          action_result: string
          action_type: string
          created_at?: string
          credits_consumed?: number
          duration_ms?: number
          error_message?: string | null
          event_id?: string | null
          event_type?: string | null
          id?: string
          instance_id: string
          rule_id?: string | null
        }
        Update: {
          action_result?: string
          action_type?: string
          created_at?: string
          credits_consumed?: number
          duration_ms?: number
          error_message?: string | null
          event_id?: string | null
          event_type?: string | null
          id?: string
          instance_id?: string
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_automation_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "genesis_integration_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_automation_logs_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "genesis_automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          cooldown_minutes: number
          created_at: string
          description: string | null
          event_type: string
          filters: Json
          id: string
          instance_id: string
          is_active: boolean
          last_executed_at: string | null
          max_executions_per_hour: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          cooldown_minutes?: number
          created_at?: string
          description?: string | null
          event_type: string
          filters?: Json
          id?: string
          instance_id: string
          is_active?: boolean
          last_executed_at?: string | null
          max_executions_per_hour?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          cooldown_minutes?: number
          created_at?: string
          description?: string | null
          event_type?: string
          filters?: Json
          id?: string
          instance_id?: string
          is_active?: boolean
          last_executed_at?: string | null
          max_executions_per_hour?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_automation_rules_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_automation_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_branding: {
        Row: {
          company_name: string | null
          created_at: string | null
          custom_css: string | null
          custom_domain: string | null
          favicon_url: string | null
          id: string
          logo_dark_url: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      genesis_broadcast_campaigns: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string
          delay_between_ms: number | null
          delivered_count: number | null
          description: string | null
          failed_count: number | null
          id: string
          instance_id: string
          media_url: string | null
          message_template: string
          message_type: string | null
          name: string
          rate_limit_per_minute: number | null
          read_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: string | null
          target_segment_id: string | null
          target_tags: string[] | null
          target_type: string | null
          template_id: string | null
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          delay_between_ms?: number | null
          delivered_count?: number | null
          description?: string | null
          failed_count?: number | null
          id?: string
          instance_id: string
          media_url?: string | null
          message_template: string
          message_type?: string | null
          name: string
          rate_limit_per_minute?: number | null
          read_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          target_segment_id?: string | null
          target_tags?: string[] | null
          target_type?: string | null
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          delay_between_ms?: number | null
          delivered_count?: number | null
          description?: string | null
          failed_count?: number | null
          id?: string
          instance_id?: string
          media_url?: string | null
          message_template?: string
          message_type?: string | null
          name?: string
          rate_limit_per_minute?: number | null
          read_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          target_segment_id?: string | null
          target_tags?: string[] | null
          target_type?: string | null
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      genesis_broadcast_recipients: {
        Row: {
          campaign_id: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message_id: string | null
          name: string | null
          phone: string
          read_at: string | null
          sent_at: string | null
          status: string | null
          variables: Json | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_id?: string | null
          name?: string | null
          phone: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          variables?: Json | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_id?: string | null
          name?: string | null
          phone?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_broadcast_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "genesis_broadcast_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_cakto_analytics: {
        Row: {
          cart_abandonments: number | null
          checkouts_started: number | null
          created_at: string | null
          date: string
          id: string
          instance_id: string
          integration_id: string
          purchases_approved: number | null
          purchases_refunded: number | null
          purchases_refused: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          cart_abandonments?: number | null
          checkouts_started?: number | null
          created_at?: string | null
          date: string
          id?: string
          instance_id: string
          integration_id: string
          purchases_approved?: number | null
          purchases_refunded?: number | null
          purchases_refused?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          cart_abandonments?: number | null
          checkouts_started?: number | null
          created_at?: string | null
          date?: string
          id?: string
          instance_id?: string
          integration_id?: string
          purchases_approved?: number | null
          purchases_refunded?: number | null
          purchases_refused?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_cakto_analytics_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_cakto_analytics_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "genesis_instance_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_cakto_dedup: {
        Row: {
          customer_phone: string | null
          event_type: string
          external_id: string
          id: string
          instance_id: string
          processed_at: string
        }
        Insert: {
          customer_phone?: string | null
          event_type: string
          external_id: string
          id?: string
          instance_id: string
          processed_at?: string
        }
        Update: {
          customer_phone?: string | null
          event_type?: string
          external_id?: string
          id?: string
          instance_id?: string
          processed_at?: string
        }
        Relationships: []
      }
      genesis_cakto_event_rules: {
        Row: {
          anti_ban_enabled: boolean | null
          campaign_id: string | null
          cooldown_minutes: number | null
          created_at: string | null
          delay_max_seconds: number | null
          delay_seconds: number | null
          event_type: string
          id: string
          instance_id: string
          integration_id: string
          is_active: boolean | null
          max_per_hour: number | null
          updated_at: string | null
        }
        Insert: {
          anti_ban_enabled?: boolean | null
          campaign_id?: string | null
          cooldown_minutes?: number | null
          created_at?: string | null
          delay_max_seconds?: number | null
          delay_seconds?: number | null
          event_type: string
          id?: string
          instance_id: string
          integration_id: string
          is_active?: boolean | null
          max_per_hour?: number | null
          updated_at?: string | null
        }
        Update: {
          anti_ban_enabled?: boolean | null
          campaign_id?: string | null
          cooldown_minutes?: number | null
          created_at?: string | null
          delay_max_seconds?: number | null
          delay_seconds?: number | null
          event_type?: string
          id?: string
          instance_id?: string
          integration_id?: string
          is_active?: boolean | null
          max_per_hour?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_cakto_event_rules_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "genesis_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_cakto_event_rules_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_cakto_event_rules_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "genesis_instance_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_cakto_events: {
        Row: {
          campaign_triggered_id: string | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          error_message: string | null
          event_type: string
          external_id: string
          id: string
          instance_id: string
          integration_id: string | null
          normalized_event: Json | null
          offer_id: string | null
          offer_name: string | null
          order_value: number | null
          processed: boolean | null
          processed_at: string | null
          product_id: string | null
          product_name: string | null
          raw_payload: Json
        }
        Insert: {
          campaign_triggered_id?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          error_message?: string | null
          event_type: string
          external_id: string
          id?: string
          instance_id: string
          integration_id?: string | null
          normalized_event?: Json | null
          offer_id?: string | null
          offer_name?: string | null
          order_value?: number | null
          processed?: boolean | null
          processed_at?: string | null
          product_id?: string | null
          product_name?: string | null
          raw_payload: Json
        }
        Update: {
          campaign_triggered_id?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          error_message?: string | null
          event_type?: string
          external_id?: string
          id?: string
          instance_id?: string
          integration_id?: string | null
          normalized_event?: Json | null
          offer_id?: string | null
          offer_name?: string | null
          order_value?: number | null
          processed?: boolean | null
          processed_at?: string | null
          product_id?: string | null
          product_name?: string | null
          raw_payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "genesis_cakto_events_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_cakto_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "genesis_instance_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_cakto_offers: {
        Row: {
          checkout_url: string | null
          created_at: string | null
          currency: string | null
          external_id: string
          id: string
          instance_id: string
          integration_id: string
          metadata: Json | null
          name: string
          original_price: number | null
          price: number | null
          product_external_id: string | null
          status: string | null
          synced_at: string | null
        }
        Insert: {
          checkout_url?: string | null
          created_at?: string | null
          currency?: string | null
          external_id: string
          id?: string
          instance_id: string
          integration_id: string
          metadata?: Json | null
          name: string
          original_price?: number | null
          price?: number | null
          product_external_id?: string | null
          status?: string | null
          synced_at?: string | null
        }
        Update: {
          checkout_url?: string | null
          created_at?: string | null
          currency?: string | null
          external_id?: string
          id?: string
          instance_id?: string
          integration_id?: string
          metadata?: Json | null
          name?: string
          original_price?: number | null
          price?: number | null
          product_external_id?: string | null
          status?: string | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_cakto_offers_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_cakto_offers_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "genesis_instance_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_cakto_products: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          external_id: string
          id: string
          image_url: string | null
          instance_id: string
          integration_id: string
          metadata: Json | null
          name: string
          price: number | null
          status: string | null
          synced_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id: string
          id?: string
          image_url?: string | null
          instance_id: string
          integration_id: string
          metadata?: Json | null
          name: string
          price?: number | null
          status?: string | null
          synced_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string
          id?: string
          image_url?: string | null
          instance_id?: string
          integration_id?: string
          metadata?: Json | null
          name?: string
          price?: number | null
          status?: string | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_cakto_products_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_cakto_products_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "genesis_instance_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_calendar_configs: {
        Row: {
          calendar_id: string
          created_at: string
          flow_id: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          oauth_id: string
          sync_token: string | null
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          calendar_id?: string
          created_at?: string
          flow_id: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          oauth_id: string
          sync_token?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          calendar_id?: string
          created_at?: string
          flow_id?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          oauth_id?: string
          sync_token?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_calendar_configs_oauth_id_fkey"
            columns: ["oauth_id"]
            isOneToOne: false
            referencedRelation: "genesis_google_oauth"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_calendar_events: {
        Row: {
          config_id: string
          created_at: string
          event_data: Json
          event_id: string
          execution_id: string | null
          id: string
          status: string
          trigger_at: string | null
          triggered_at: string | null
          updated_at: string
        }
        Insert: {
          config_id: string
          created_at?: string
          event_data: Json
          event_id: string
          execution_id?: string | null
          id?: string
          status?: string
          trigger_at?: string | null
          triggered_at?: string | null
          updated_at?: string
        }
        Update: {
          config_id?: string
          created_at?: string
          event_data?: Json
          event_id?: string
          execution_id?: string | null
          id?: string
          status?: string
          trigger_at?: string | null
          triggered_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_calendar_events_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "genesis_calendar_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_calendar_logs: {
        Row: {
          action: string
          config_id: string | null
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          status: string
        }
        Insert: {
          action: string
          config_id?: string | null
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Update: {
          action?: string
          config_id?: string | null
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_calendar_logs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "genesis_calendar_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_campaign_audiences: {
        Row: {
          contact_count: number | null
          created_at: string | null
          description: string | null
          filters: Json
          id: string
          is_active: boolean | null
          last_calculated_at: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          filters?: Json
          id?: string
          is_active?: boolean | null
          last_calculated_at?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          filters?: Json
          id?: string
          is_active?: boolean | null
          last_calculated_at?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_campaign_audiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_campaign_contacts: {
        Row: {
          attempt_count: number | null
          campaign_id: string
          contact_data: Json | null
          contact_name: string | null
          contact_phone: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          instance_used_id: string | null
          is_warm_lead: boolean | null
          last_attempt_at: string | null
          locked_at: string | null
          max_attempts: number | null
          message_sent: string | null
          previous_interaction_count: number | null
          read_at: string | null
          replied_at: string | null
          sent_at: string | null
          spam_score: number | null
          status: string | null
          updated_at: string | null
          variation_index: number | null
        }
        Insert: {
          attempt_count?: number | null
          campaign_id: string
          contact_data?: Json | null
          contact_name?: string | null
          contact_phone: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          instance_used_id?: string | null
          is_warm_lead?: boolean | null
          last_attempt_at?: string | null
          locked_at?: string | null
          max_attempts?: number | null
          message_sent?: string | null
          previous_interaction_count?: number | null
          read_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          spam_score?: number | null
          status?: string | null
          updated_at?: string | null
          variation_index?: number | null
        }
        Update: {
          attempt_count?: number | null
          campaign_id?: string
          contact_data?: Json | null
          contact_name?: string | null
          contact_phone?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          instance_used_id?: string | null
          is_warm_lead?: boolean | null
          last_attempt_at?: string | null
          locked_at?: string | null
          max_attempts?: number | null
          message_sent?: string | null
          previous_interaction_count?: number | null
          read_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          spam_score?: number | null
          status?: string | null
          updated_at?: string | null
          variation_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "genesis_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_campaign_contacts_instance_used_id_fkey"
            columns: ["instance_used_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_campaign_dedup: {
        Row: {
          campaign_id: string
          expires_at: string
          id: string
          message_hash: string
          phone_hash: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          expires_at: string
          id?: string
          message_hash: string
          phone_hash: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          expires_at?: string
          id?: string
          message_hash?: string
          phone_hash?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_campaign_dedup_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "genesis_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_campaign_dedup_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_campaign_instance_pool: {
        Row: {
          blocks_count: number | null
          campaign_id: string
          cooldown_until: string | null
          created_at: string | null
          health_score: number | null
          id: string
          instance_id: string
          is_active: boolean | null
          last_used_at: string | null
          messages_failed: number | null
          messages_sent: number | null
          priority: number | null
          weight: number | null
        }
        Insert: {
          blocks_count?: number | null
          campaign_id: string
          cooldown_until?: string | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          instance_id: string
          is_active?: boolean | null
          last_used_at?: string | null
          messages_failed?: number | null
          messages_sent?: number | null
          priority?: number | null
          weight?: number | null
        }
        Update: {
          blocks_count?: number | null
          campaign_id?: string
          cooldown_until?: string | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          instance_id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          messages_failed?: number | null
          messages_sent?: number | null
          priority?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_campaign_instance_pool_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "genesis_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_campaign_instance_pool_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_campaign_logs: {
        Row: {
          campaign_id: string
          contact_id: string | null
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          message: string
          severity: string | null
        }
        Insert: {
          campaign_id: string
          contact_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          message: string
          severity?: string | null
        }
        Update: {
          campaign_id?: string
          contact_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          message?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_campaign_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "genesis_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_campaign_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "genesis_campaign_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_campaign_settings: {
        Row: {
          auto_pause_on_block: boolean | null
          block_threshold: number | null
          cooldown_after_block_hours: number | null
          created_at: string | null
          default_quarantine_days: number | null
          emergency_stop_enabled: boolean | null
          global_blacklist_enabled: boolean | null
          id: string
          max_daily_per_instance: number | null
          max_messages_per_day: number | null
          max_messages_per_hour: number | null
          max_messages_per_minute: number | null
          peak_hours_afternoon_end: string | null
          peak_hours_afternoon_start: string | null
          peak_hours_end: string | null
          peak_hours_start: string | null
          read_receipt_delay: boolean | null
          spam_word_block_level: string | null
          typing_simulation: boolean | null
          updated_at: string | null
          user_id: string
          warmup_required_for_new: boolean | null
        }
        Insert: {
          auto_pause_on_block?: boolean | null
          block_threshold?: number | null
          cooldown_after_block_hours?: number | null
          created_at?: string | null
          default_quarantine_days?: number | null
          emergency_stop_enabled?: boolean | null
          global_blacklist_enabled?: boolean | null
          id?: string
          max_daily_per_instance?: number | null
          max_messages_per_day?: number | null
          max_messages_per_hour?: number | null
          max_messages_per_minute?: number | null
          peak_hours_afternoon_end?: string | null
          peak_hours_afternoon_start?: string | null
          peak_hours_end?: string | null
          peak_hours_start?: string | null
          read_receipt_delay?: boolean | null
          spam_word_block_level?: string | null
          typing_simulation?: boolean | null
          updated_at?: string | null
          user_id: string
          warmup_required_for_new?: boolean | null
        }
        Update: {
          auto_pause_on_block?: boolean | null
          block_threshold?: number | null
          cooldown_after_block_hours?: number | null
          created_at?: string | null
          default_quarantine_days?: number | null
          emergency_stop_enabled?: boolean | null
          global_blacklist_enabled?: boolean | null
          id?: string
          max_daily_per_instance?: number | null
          max_messages_per_day?: number | null
          max_messages_per_hour?: number | null
          max_messages_per_minute?: number | null
          peak_hours_afternoon_end?: string | null
          peak_hours_afternoon_start?: string | null
          peak_hours_end?: string | null
          peak_hours_start?: string | null
          read_receipt_delay?: boolean | null
          spam_word_block_level?: string | null
          typing_simulation?: boolean | null
          updated_at?: string | null
          user_id?: string
          warmup_required_for_new?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_campaign_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_campaigns: {
        Row: {
          adaptive_delay: boolean | null
          batch_size: number | null
          blocked_count: number | null
          campaign_type: string
          check_blacklist: boolean | null
          completed_at: string | null
          cooldown_after_block_minutes: number | null
          created_at: string | null
          credits_consumed: number | null
          credits_estimated: number | null
          delay_max_seconds: number | null
          delay_min_seconds: number | null
          delivered_count: number | null
          description: string | null
          error_message: string | null
          failed_count: number | null
          id: string
          instance_id: string
          luna_enabled: boolean | null
          luna_generated_variations: Json | null
          luna_similarity_level: string | null
          luna_variations_count: number | null
          max_blocks_before_pause: number | null
          media_type: string | null
          media_url: string | null
          message_template: string
          message_variables: Json | null
          metadata: Json | null
          name: string
          pause_after_batch: number | null
          pause_duration_seconds: number | null
          paused_at: string | null
          peak_hours_boost: boolean | null
          prioritize_warm_leads: boolean | null
          quarantine_days: number | null
          read_count: number | null
          replied_count: number | null
          respect_warmup: boolean | null
          scheduled_at: string | null
          send_on_weekends: boolean | null
          send_window_end: string | null
          send_window_start: string | null
          sent_count: number | null
          spam_word_check: boolean | null
          started_at: string | null
          status: string
          total_contacts: number | null
          typing_duration_max: number | null
          typing_duration_min: number | null
          typing_simulation: boolean | null
          updated_at: string | null
          use_instance_pool: boolean | null
          user_id: string
        }
        Insert: {
          adaptive_delay?: boolean | null
          batch_size?: number | null
          blocked_count?: number | null
          campaign_type?: string
          check_blacklist?: boolean | null
          completed_at?: string | null
          cooldown_after_block_minutes?: number | null
          created_at?: string | null
          credits_consumed?: number | null
          credits_estimated?: number | null
          delay_max_seconds?: number | null
          delay_min_seconds?: number | null
          delivered_count?: number | null
          description?: string | null
          error_message?: string | null
          failed_count?: number | null
          id?: string
          instance_id: string
          luna_enabled?: boolean | null
          luna_generated_variations?: Json | null
          luna_similarity_level?: string | null
          luna_variations_count?: number | null
          max_blocks_before_pause?: number | null
          media_type?: string | null
          media_url?: string | null
          message_template: string
          message_variables?: Json | null
          metadata?: Json | null
          name: string
          pause_after_batch?: number | null
          pause_duration_seconds?: number | null
          paused_at?: string | null
          peak_hours_boost?: boolean | null
          prioritize_warm_leads?: boolean | null
          quarantine_days?: number | null
          read_count?: number | null
          replied_count?: number | null
          respect_warmup?: boolean | null
          scheduled_at?: string | null
          send_on_weekends?: boolean | null
          send_window_end?: string | null
          send_window_start?: string | null
          sent_count?: number | null
          spam_word_check?: boolean | null
          started_at?: string | null
          status?: string
          total_contacts?: number | null
          typing_duration_max?: number | null
          typing_duration_min?: number | null
          typing_simulation?: boolean | null
          updated_at?: string | null
          use_instance_pool?: boolean | null
          user_id: string
        }
        Update: {
          adaptive_delay?: boolean | null
          batch_size?: number | null
          blocked_count?: number | null
          campaign_type?: string
          check_blacklist?: boolean | null
          completed_at?: string | null
          cooldown_after_block_minutes?: number | null
          created_at?: string | null
          credits_consumed?: number | null
          credits_estimated?: number | null
          delay_max_seconds?: number | null
          delay_min_seconds?: number | null
          delivered_count?: number | null
          description?: string | null
          error_message?: string | null
          failed_count?: number | null
          id?: string
          instance_id?: string
          luna_enabled?: boolean | null
          luna_generated_variations?: Json | null
          luna_similarity_level?: string | null
          luna_variations_count?: number | null
          max_blocks_before_pause?: number | null
          media_type?: string | null
          media_url?: string | null
          message_template?: string
          message_variables?: Json | null
          metadata?: Json | null
          name?: string
          pause_after_batch?: number | null
          pause_duration_seconds?: number | null
          paused_at?: string | null
          peak_hours_boost?: boolean | null
          prioritize_warm_leads?: boolean | null
          quarantine_days?: number | null
          read_count?: number | null
          replied_count?: number | null
          respect_warmup?: boolean | null
          scheduled_at?: string | null
          send_on_weekends?: boolean | null
          send_window_end?: string | null
          send_window_start?: string | null
          sent_count?: number | null
          spam_word_check?: boolean | null
          started_at?: string | null
          status?: string
          total_contacts?: number | null
          typing_duration_max?: number | null
          typing_duration_min?: number | null
          typing_simulation?: boolean | null
          updated_at?: string | null
          use_instance_pool?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_campaigns_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_closure_reasons: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          instance_id: string
          is_active: boolean | null
          name: string
          requires_note: boolean | null
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instance_id: string
          is_active?: boolean | null
          name: string
          requires_note?: boolean | null
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instance_id?: string
          is_active?: boolean | null
          name?: string
          requires_note?: boolean | null
          sort_order?: number | null
        }
        Relationships: []
      }
      genesis_contact_assignments: {
        Row: {
          assigned_agent_id: string
          contact_name: string | null
          contact_phone: string
          created_at: string | null
          id: string
          instance_id: string
          last_contact_at: string | null
          notes: string | null
          priority: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          assigned_agent_id: string
          contact_name?: string | null
          contact_phone: string
          created_at?: string | null
          id?: string
          instance_id: string
          last_contact_at?: string | null
          notes?: string | null
          priority?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          assigned_agent_id?: string
          contact_name?: string | null
          contact_phone?: string
          created_at?: string | null
          id?: string
          instance_id?: string
          last_contact_at?: string | null
          notes?: string | null
          priority?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      genesis_contact_blacklist: {
        Row: {
          created_at: string | null
          id: string
          phone_hash: string
          phone_last4: string | null
          quarantine_until: string | null
          reason: string
          source_campaign_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone_hash: string
          phone_last4?: string | null
          quarantine_until?: string | null
          reason: string
          source_campaign_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          phone_hash?: string
          phone_last4?: string | null
          quarantine_until?: string | null
          reason?: string
          source_campaign_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_contact_blacklist_source_campaign_id_fkey"
            columns: ["source_campaign_id"]
            isOneToOne: false
            referencedRelation: "genesis_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_contact_blacklist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_contact_list_items: {
        Row: {
          created_at: string | null
          custom_data: Json | null
          email: string | null
          id: string
          is_active: boolean | null
          list_id: string
          name: string | null
          phone: string
        }
        Insert: {
          created_at?: string | null
          custom_data?: Json | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          list_id: string
          name?: string | null
          phone: string
        }
        Update: {
          created_at?: string | null
          custom_data?: Json | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          list_id?: string
          name?: string | null
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_contact_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "genesis_contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_contact_lists: {
        Row: {
          contact_count: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_contact_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_credit_usage: {
        Row: {
          created_at: string | null
          credits_used: number
          description: string | null
          id: string
          instance_id: string | null
          usage_date: string | null
          usage_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_used?: number
          description?: string | null
          id?: string
          instance_id?: string | null
          usage_date?: string | null
          usage_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          description?: string | null
          id?: string
          instance_id?: string | null
          usage_date?: string | null
          usage_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_credit_usage_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_credit_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_credits: {
        Row: {
          available_credits: number
          created_at: string
          id: string
          last_purchase_at: string | null
          total_purchased: number
          updated_at: string
          used_credits: number
          user_id: string
        }
        Insert: {
          available_credits?: number
          created_at?: string
          id?: string
          last_purchase_at?: string | null
          total_purchased?: number
          updated_at?: string
          used_credits?: number
          user_id: string
        }
        Update: {
          available_credits?: number
          created_at?: string
          id?: string
          last_purchase_at?: string | null
          total_purchased?: number
          updated_at?: string
          used_credits?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_department_agents: {
        Row: {
          can_transfer_out: boolean | null
          can_view_others_chats: boolean | null
          created_at: string | null
          department_id: string
          id: string
          max_concurrent: number | null
          role: string | null
          user_id: string
        }
        Insert: {
          can_transfer_out?: boolean | null
          can_view_others_chats?: boolean | null
          created_at?: string | null
          department_id: string
          id?: string
          max_concurrent?: number | null
          role?: string | null
          user_id: string
        }
        Update: {
          can_transfer_out?: boolean | null
          can_view_others_chats?: boolean | null
          created_at?: string | null
          department_id?: string
          id?: string
          max_concurrent?: number | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_department_agents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "genesis_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_departments: {
        Row: {
          auto_assign: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          instance_id: string
          is_active: boolean | null
          max_queue_size: number | null
          name: string
          operating_hours: Json | null
          updated_at: string | null
        }
        Insert: {
          auto_assign?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          instance_id: string
          is_active?: boolean | null
          max_queue_size?: number | null
          name: string
          operating_hours?: Json | null
          updated_at?: string | null
        }
        Update: {
          auto_assign?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          instance_id?: string
          is_active?: boolean | null
          max_queue_size?: number | null
          name?: string
          operating_hours?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      genesis_economy_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
        }
        Relationships: []
      }
      genesis_economy_consumption_log: {
        Row: {
          action_type: string
          chatbot_id: string | null
          created_at: string
          credits_consumed: number
          flow_id: string | null
          id: string
          instance_id: string | null
          metadata: Json | null
          source_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          action_type: string
          chatbot_id?: string | null
          created_at?: string
          credits_consumed: number
          flow_id?: string | null
          id?: string
          instance_id?: string | null
          metadata?: Json | null
          source_id?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          action_type?: string
          chatbot_id?: string | null
          created_at?: string
          credits_consumed?: number
          flow_id?: string | null
          id?: string
          instance_id?: string | null
          metadata?: Json | null
          source_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_economy_consumption_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_economy_consumption_rules: {
        Row: {
          action_label: string
          action_type: string
          created_at: string
          credits_cost: number
          description: string | null
          id: string
          is_active: boolean
          priority_source: string
          updated_at: string
        }
        Insert: {
          action_label: string
          action_type: string
          created_at?: string
          credits_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean
          priority_source?: string
          updated_at?: string
        }
        Update: {
          action_label?: string
          action_type?: string
          created_at?: string
          credits_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean
          priority_source?: string
          updated_at?: string
        }
        Relationships: []
      }
      genesis_economy_credit_packages: {
        Row: {
          bonus_credits: number | null
          created_at: string
          credits_amount: number
          display_order: number | null
          expiration_days: number | null
          id: string
          is_active: boolean
          is_not_recommended: boolean | null
          is_recommended: boolean | null
          name: string
          price: number
          price_per_credit: number | null
          updated_at: string
        }
        Insert: {
          bonus_credits?: number | null
          created_at?: string
          credits_amount: number
          display_order?: number | null
          expiration_days?: number | null
          id?: string
          is_active?: boolean
          is_not_recommended?: boolean | null
          is_recommended?: boolean | null
          name: string
          price: number
          price_per_credit?: number | null
          updated_at?: string
        }
        Update: {
          bonus_credits?: number | null
          created_at?: string
          credits_amount?: number
          display_order?: number | null
          expiration_days?: number | null
          id?: string
          is_active?: boolean
          is_not_recommended?: boolean | null
          is_recommended?: boolean | null
          name?: string
          price?: number
          price_per_credit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      genesis_economy_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          credits_included: number
          description: string | null
          display_order: number | null
          features_enabled: Json
          id: string
          is_active: boolean
          is_recommended: boolean | null
          max_ai_calls_month: number
          max_flows: number
          max_instances: number
          max_messages_month: number
          max_webhooks: number
          name: string
          overusage_behavior: string
          price_monthly: number
          price_yearly: number | null
          processing_priority: number
          slug: string
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          credits_included?: number
          description?: string | null
          display_order?: number | null
          features_enabled?: Json
          id?: string
          is_active?: boolean
          is_recommended?: boolean | null
          max_ai_calls_month?: number
          max_flows?: number
          max_instances?: number
          max_messages_month?: number
          max_webhooks?: number
          name: string
          overusage_behavior?: string
          price_monthly?: number
          price_yearly?: number | null
          processing_priority?: number
          slug: string
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          credits_included?: number
          description?: string | null
          display_order?: number | null
          features_enabled?: Json
          id?: string
          is_active?: boolean
          is_recommended?: boolean | null
          max_ai_calls_month?: number
          max_flows?: number
          max_instances?: number
          max_messages_month?: number
          max_webhooks?: number
          name?: string
          overusage_behavior?: string
          price_monthly?: number
          price_yearly?: number | null
          processing_priority?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      genesis_economy_user_credits: {
        Row: {
          created_at: string
          credits_available: number | null
          credits_bonus: number
          credits_purchased: number
          credits_used: number
          expires_at: string | null
          external_payment_id: string | null
          id: string
          package_id: string | null
          purchased_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_available?: number | null
          credits_bonus?: number
          credits_purchased?: number
          credits_used?: number
          expires_at?: string | null
          external_payment_id?: string | null
          id?: string
          package_id?: string | null
          purchased_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_available?: number | null
          credits_bonus?: number
          credits_purchased?: number
          credits_used?: number
          expires_at?: string | null
          external_payment_id?: string | null
          id?: string
          package_id?: string | null
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_economy_user_credits_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "genesis_economy_credit_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_economy_user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_economy_user_subscriptions: {
        Row: {
          ai_calls_used: number
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          external_customer_id: string | null
          external_subscription_id: string | null
          flow_executions_used: number
          id: string
          messages_used: number
          plan_id: string
          started_at: string
          status: string
          updated_at: string
          usage_reset_at: string
          user_id: string
          webhooks_used: number
        }
        Insert: {
          ai_calls_used?: number
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          flow_executions_used?: number
          id?: string
          messages_used?: number
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
          usage_reset_at?: string
          user_id: string
          webhooks_used?: number
        }
        Update: {
          ai_calls_used?: number
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          flow_executions_used?: number
          id?: string
          messages_used?: number
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          usage_reset_at?: string
          user_id?: string
          webhooks_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "genesis_economy_user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "genesis_economy_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_economy_user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_event_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          instance_id: string | null
          message: string
          severity: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          instance_id?: string | null
          message: string
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          instance_id?: string | null
          message?: string
          severity?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_event_logs_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_event_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_google_oauth: {
        Row: {
          access_token: string
          created_at: string
          email: string | null
          expires_at: string
          id: string
          project_id: string
          refresh_token: string
          scope: string
          token_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          project_id: string
          refresh_token: string
          scope?: string
          token_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          project_id?: string
          refresh_token?: string
          scope?: string
          token_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      genesis_instance_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          instance_id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          instance_id: string
          payload?: Json
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          instance_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "genesis_instance_events_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_instance_failovers: {
        Row: {
          backup_id: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          instance_id: string
          reason: string
          source_node_id: string | null
          started_at: string | null
          status: string
          target_node_id: string
        }
        Insert: {
          backup_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          instance_id: string
          reason: string
          source_node_id?: string | null
          started_at?: string | null
          status?: string
          target_node_id: string
        }
        Update: {
          backup_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          instance_id?: string
          reason?: string
          source_node_id?: string | null
          started_at?: string | null
          status?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_instance_failovers_backup_id_fkey"
            columns: ["backup_id"]
            isOneToOne: false
            referencedRelation: "genesis_session_backups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_instance_failovers_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_instance_failovers_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "genesis_vps_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_instance_failovers_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "genesis_vps_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_instance_health_metrics: {
        Row: {
          created_at: string | null
          degradation_level: number | null
          health_score: number | null
          id: string
          instance_id: string
          messages_blocked: number | null
          messages_delivered: number | null
          messages_failed: number | null
          messages_read: number | null
          messages_replied: number | null
          messages_sent: number | null
          period_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          degradation_level?: number | null
          health_score?: number | null
          id?: string
          instance_id: string
          messages_blocked?: number | null
          messages_delivered?: number | null
          messages_failed?: number | null
          messages_read?: number | null
          messages_replied?: number | null
          messages_sent?: number | null
          period_date?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          degradation_level?: number | null
          health_score?: number | null
          id?: string
          instance_id?: string
          messages_blocked?: number | null
          messages_delivered?: number | null
          messages_failed?: number | null
          messages_read?: number | null
          messages_replied?: number | null
          messages_sent?: number | null
          period_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_instance_health_metrics_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_instance_integrations: {
        Row: {
          created_at: string
          credentials_encrypted: string | null
          error_message: string | null
          id: string
          instance_id: string
          last_sync_at: string | null
          metadata: Json
          provider: string
          status: string
          store_name: string | null
          store_url: string | null
          updated_at: string
          user_id: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          credentials_encrypted?: string | null
          error_message?: string | null
          id?: string
          instance_id: string
          last_sync_at?: string | null
          metadata?: Json
          provider: string
          status?: string
          store_name?: string | null
          store_url?: string | null
          updated_at?: string
          user_id: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          credentials_encrypted?: string | null
          error_message?: string | null
          id?: string
          instance_id?: string
          last_sync_at?: string | null
          metadata?: Json
          provider?: string
          status?: string
          store_name?: string | null
          store_url?: string | null
          updated_at?: string
          user_id?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_instance_integrations_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_instance_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_instance_metrics: {
        Row: {
          api_calls: number | null
          avg_cpu_usage: number | null
          avg_memory_usage: number | null
          avg_reconnection_time_ms: number | null
          avg_response_time_ms: number | null
          connection_uptime_seconds: number | null
          created_at: string | null
          disconnection_count: number | null
          id: string
          instance_id: string
          max_response_time_ms: number | null
          messages_failed: number | null
          messages_received: number | null
          messages_sent: number | null
          min_response_time_ms: number | null
          peak_cpu_usage: number | null
          peak_memory_usage: number | null
          period_end: string
          period_start: string
          period_type: string
          reconnection_count: number | null
          user_id: string
          webhook_deliveries: number | null
          webhook_failures: number | null
        }
        Insert: {
          api_calls?: number | null
          avg_cpu_usage?: number | null
          avg_memory_usage?: number | null
          avg_reconnection_time_ms?: number | null
          avg_response_time_ms?: number | null
          connection_uptime_seconds?: number | null
          created_at?: string | null
          disconnection_count?: number | null
          id?: string
          instance_id: string
          max_response_time_ms?: number | null
          messages_failed?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          min_response_time_ms?: number | null
          peak_cpu_usage?: number | null
          peak_memory_usage?: number | null
          period_end: string
          period_start: string
          period_type?: string
          reconnection_count?: number | null
          user_id: string
          webhook_deliveries?: number | null
          webhook_failures?: number | null
        }
        Update: {
          api_calls?: number | null
          avg_cpu_usage?: number | null
          avg_memory_usage?: number | null
          avg_reconnection_time_ms?: number | null
          avg_response_time_ms?: number | null
          connection_uptime_seconds?: number | null
          created_at?: string | null
          disconnection_count?: number | null
          id?: string
          instance_id?: string
          max_response_time_ms?: number | null
          messages_failed?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          min_response_time_ms?: number | null
          peak_cpu_usage?: number | null
          peak_memory_usage?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          reconnection_count?: number | null
          user_id?: string
          webhook_deliveries?: number | null
          webhook_failures?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_instance_metrics_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_instance_state_transitions: {
        Row: {
          from_state: string
          to_state: string
        }
        Insert: {
          from_state: string
          to_state: string
        }
        Update: {
          from_state?: string
          to_state?: string
        }
        Relationships: []
      }
      genesis_instance_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          instance_id: string
          jwt_id: string
          revoked: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          instance_id: string
          jwt_id: string
          revoked?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          instance_id?: string
          jwt_id?: string
          revoked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "genesis_instance_tokens_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_instance_warmup: {
        Row: {
          created_at: string | null
          day1_limit: number | null
          day10_limit: number | null
          day2_limit: number | null
          day3_limit: number | null
          day4_limit: number | null
          day5_limit: number | null
          day6_limit: number | null
          day7_limit: number | null
          day8_limit: number | null
          day9_limit: number | null
          id: string
          instance_id: string
          last_message_date: string | null
          messages_sent_today: number | null
          updated_at: string | null
          warmup_completed: boolean | null
          warmup_completed_at: string | null
          warmup_day: number | null
          warmup_started_at: string | null
        }
        Insert: {
          created_at?: string | null
          day1_limit?: number | null
          day10_limit?: number | null
          day2_limit?: number | null
          day3_limit?: number | null
          day4_limit?: number | null
          day5_limit?: number | null
          day6_limit?: number | null
          day7_limit?: number | null
          day8_limit?: number | null
          day9_limit?: number | null
          id?: string
          instance_id: string
          last_message_date?: string | null
          messages_sent_today?: number | null
          updated_at?: string | null
          warmup_completed?: boolean | null
          warmup_completed_at?: string | null
          warmup_day?: number | null
          warmup_started_at?: string | null
        }
        Update: {
          created_at?: string | null
          day1_limit?: number | null
          day10_limit?: number | null
          day2_limit?: number | null
          day3_limit?: number | null
          day4_limit?: number | null
          day5_limit?: number | null
          day6_limit?: number | null
          day7_limit?: number | null
          day8_limit?: number | null
          day9_limit?: number | null
          id?: string
          instance_id?: string
          last_message_date?: string | null
          messages_sent_today?: number | null
          updated_at?: string | null
          warmup_completed?: boolean | null
          warmup_completed_at?: string | null
          warmup_day?: number | null
          warmup_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_instance_warmup_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: true
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_instances: {
        Row: {
          backend_token: string | null
          backend_url: string | null
          backup_enabled: boolean | null
          created_at: string
          effective_status: string | null
          failover_enabled: boolean | null
          health_status: string
          heartbeat_age_seconds: number | null
          id: string
          is_paused: boolean
          last_activity_at: string | null
          last_backup_at: string | null
          last_backup_id: string | null
          last_failover_at: string | null
          last_health_ping: string | null
          last_heartbeat: string | null
          name: string
          orchestrated_status: string
          phone_number: string | null
          preferred_region: string | null
          qr_code: string | null
          session_data: Json | null
          status: string
          status_source: string
          updated_at: string
          user_id: string
          vps_node_id: string | null
        }
        Insert: {
          backend_token?: string | null
          backend_url?: string | null
          backup_enabled?: boolean | null
          created_at?: string
          effective_status?: string | null
          failover_enabled?: boolean | null
          health_status?: string
          heartbeat_age_seconds?: number | null
          id?: string
          is_paused?: boolean
          last_activity_at?: string | null
          last_backup_at?: string | null
          last_backup_id?: string | null
          last_failover_at?: string | null
          last_health_ping?: string | null
          last_heartbeat?: string | null
          name: string
          orchestrated_status?: string
          phone_number?: string | null
          preferred_region?: string | null
          qr_code?: string | null
          session_data?: Json | null
          status?: string
          status_source?: string
          updated_at?: string
          user_id: string
          vps_node_id?: string | null
        }
        Update: {
          backend_token?: string | null
          backend_url?: string | null
          backup_enabled?: boolean | null
          created_at?: string
          effective_status?: string | null
          failover_enabled?: boolean | null
          health_status?: string
          heartbeat_age_seconds?: number | null
          id?: string
          is_paused?: boolean
          last_activity_at?: string | null
          last_backup_at?: string | null
          last_backup_id?: string | null
          last_failover_at?: string | null
          last_health_ping?: string | null
          last_heartbeat?: string | null
          name?: string
          orchestrated_status?: string
          phone_number?: string | null
          preferred_region?: string | null
          qr_code?: string | null
          session_data?: Json | null
          status?: string
          status_source?: string
          updated_at?: string
          user_id?: string
          vps_node_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_instances_last_backup_id_fkey"
            columns: ["last_backup_id"]
            isOneToOne: false
            referencedRelation: "genesis_session_backups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_instances_vps_node_id_fkey"
            columns: ["vps_node_id"]
            isOneToOne: false
            referencedRelation: "genesis_vps_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_integration_events: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          dedup_hash: string
          event_data: Json
          event_type: string
          external_id: string
          id: string
          instance_id: string
          integration_id: string | null
          processed: boolean
          provider: string
          raw_event: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          dedup_hash: string
          event_data?: Json
          event_type: string
          external_id: string
          id?: string
          instance_id: string
          integration_id?: string | null
          processed?: boolean
          provider: string
          raw_event: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          dedup_hash?: string
          event_data?: Json
          event_type?: string
          external_id?: string
          id?: string
          instance_id?: string
          integration_id?: string | null
          processed?: boolean
          provider?: string
          raw_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_integration_events_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_integration_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "genesis_instance_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_internal_chat_members: {
        Row: {
          chat_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_internal_chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "genesis_internal_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_internal_chats: {
        Row: {
          created_at: string | null
          created_by: string
          department_id: string | null
          id: string
          name: string | null
          tenant_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          department_id?: string | null
          id?: string
          name?: string | null
          tenant_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          department_id?: string | null
          id?: string
          name?: string | null
          tenant_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      genesis_internal_messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          media_mimetype: string | null
          media_url: string | null
          message_type: string | null
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          media_mimetype?: string | null
          media_url?: string | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          media_mimetype?: string | null
          media_url?: string | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_internal_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "genesis_internal_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_internal_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "genesis_internal_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_metrics_daily: {
        Row: {
          avg_conversation_duration_seconds: number | null
          avg_first_response_seconds: number | null
          avg_response_time_seconds: number | null
          closed_conversations: number | null
          created_at: string | null
          date: string
          escalations: number | null
          id: string
          instance_id: string
          metadata: Json | null
          new_contacts: number | null
          new_conversations: number | null
          nps_responses: number | null
          nps_score_avg: number | null
          returning_contacts: number | null
          total_conversations: number | null
          total_messages_in: number | null
          total_messages_out: number | null
          transfers: number | null
          unique_contacts: number | null
        }
        Insert: {
          avg_conversation_duration_seconds?: number | null
          avg_first_response_seconds?: number | null
          avg_response_time_seconds?: number | null
          closed_conversations?: number | null
          created_at?: string | null
          date: string
          escalations?: number | null
          id?: string
          instance_id: string
          metadata?: Json | null
          new_contacts?: number | null
          new_conversations?: number | null
          nps_responses?: number | null
          nps_score_avg?: number | null
          returning_contacts?: number | null
          total_conversations?: number | null
          total_messages_in?: number | null
          total_messages_out?: number | null
          transfers?: number | null
          unique_contacts?: number | null
        }
        Update: {
          avg_conversation_duration_seconds?: number | null
          avg_first_response_seconds?: number | null
          avg_response_time_seconds?: number | null
          closed_conversations?: number | null
          created_at?: string | null
          date?: string
          escalations?: number | null
          id?: string
          instance_id?: string
          metadata?: Json | null
          new_contacts?: number | null
          new_conversations?: number | null
          nps_responses?: number | null
          nps_score_avg?: number | null
          returning_contacts?: number | null
          total_conversations?: number | null
          total_messages_in?: number | null
          total_messages_out?: number | null
          transfers?: number | null
          unique_contacts?: number | null
        }
        Relationships: []
      }
      genesis_nps_surveys: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          answered_at: string | null
          contact_name: string | null
          contact_phone: string
          created_at: string | null
          department: string | null
          feedback: string | null
          id: string
          instance_id: string
          score: number | null
          sent_at: string | null
          session_id: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          answered_at?: string | null
          contact_name?: string | null
          contact_phone: string
          created_at?: string | null
          department?: string | null
          feedback?: string | null
          id?: string
          instance_id: string
          score?: number | null
          sent_at?: string | null
          session_id?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          answered_at?: string | null
          contact_name?: string | null
          contact_phone?: string
          created_at?: string | null
          department?: string | null
          feedback?: string | null
          id?: string
          instance_id?: string
          score?: number | null
          sent_at?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      genesis_quick_replies: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          instance_id: string
          is_global: boolean | null
          messages: Json
          shortcut: string
          tags: string[] | null
          title: string
          updated_at: string | null
          use_count: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          instance_id: string
          is_global?: boolean | null
          messages?: Json
          shortcut: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string
          is_global?: boolean | null
          messages?: Json
          shortcut?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      genesis_realtime_metrics: {
        Row: {
          current_status: string
          health_factors: Json | null
          health_score: number | null
          id: string
          instance_id: string
          last_message_at: string | null
          messages_today: number | null
          session_messages_received: number | null
          session_messages_sent: number | null
          session_start: string | null
          updated_at: string | null
          uptime_today_seconds: number | null
        }
        Insert: {
          current_status: string
          health_factors?: Json | null
          health_score?: number | null
          id?: string
          instance_id: string
          last_message_at?: string | null
          messages_today?: number | null
          session_messages_received?: number | null
          session_messages_sent?: number | null
          session_start?: string | null
          updated_at?: string | null
          uptime_today_seconds?: number | null
        }
        Update: {
          current_status?: string
          health_factors?: Json | null
          health_score?: number | null
          id?: string
          instance_id?: string
          last_message_at?: string | null
          messages_today?: number | null
          session_messages_received?: number | null
          session_messages_sent?: number | null
          session_start?: string | null
          updated_at?: string | null
          uptime_today_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_realtime_metrics_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: true
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_reports: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          file_format: string | null
          file_url: string | null
          filters: Json | null
          generated_at: string | null
          id: string
          instance_id: string | null
          name: string
          period_end: string
          period_start: string
          report_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          file_format?: string | null
          file_url?: string | null
          filters?: Json | null
          generated_at?: string | null
          id?: string
          instance_id?: string | null
          name: string
          period_end: string
          period_start: string
          report_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          file_format?: string | null
          file_url?: string | null
          filters?: Json | null
          generated_at?: string | null
          id?: string
          instance_id?: string | null
          name?: string
          period_end?: string
          period_start?: string
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      genesis_routing_rules: {
        Row: {
          conditions: Json | null
          created_at: string | null
          distribution_method: string | null
          fallback_action: string | null
          id: string
          instance_id: string
          is_active: boolean | null
          max_concurrent_per_agent: number | null
          name: string
          priority: number | null
          target_ids: string[] | null
          target_type: string | null
          timeout_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          distribution_method?: string | null
          fallback_action?: string | null
          id?: string
          instance_id: string
          is_active?: boolean | null
          max_concurrent_per_agent?: number | null
          name: string
          priority?: number | null
          target_ids?: string[] | null
          target_type?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          distribution_method?: string | null
          fallback_action?: string | null
          id?: string
          instance_id?: string
          is_active?: boolean | null
          max_concurrent_per_agent?: number | null
          name?: string
          priority?: number | null
          target_ids?: string[] | null
          target_type?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      genesis_security_settings: {
        Row: {
          created_at: string | null
          hide_phone_partially: boolean | null
          id: string
          lockout_duration_minutes: number | null
          max_failed_attempts: number | null
          min_password_length: number | null
          phone_visible_digits: number | null
          require_number: boolean | null
          require_special_char: boolean | null
          require_strong_password: boolean | null
          require_uppercase: boolean | null
          session_timeout_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hide_phone_partially?: boolean | null
          id?: string
          lockout_duration_minutes?: number | null
          max_failed_attempts?: number | null
          min_password_length?: number | null
          phone_visible_digits?: number | null
          require_number?: boolean | null
          require_special_char?: boolean | null
          require_strong_password?: boolean | null
          require_uppercase?: boolean | null
          session_timeout_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          hide_phone_partially?: boolean | null
          id?: string
          lockout_duration_minutes?: number | null
          max_failed_attempts?: number | null
          min_password_length?: number | null
          phone_visible_digits?: number | null
          require_number?: boolean | null
          require_special_char?: boolean | null
          require_strong_password?: boolean | null
          require_uppercase?: boolean | null
          session_timeout_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      genesis_session_backups: {
        Row: {
          backup_type: string | null
          checksum: string | null
          created_at: string
          expires_at: string | null
          file_size_bytes: number | null
          id: string
          instance_id: string
          is_valid: boolean | null
          restored_at: string | null
          restored_by: string | null
          session_metadata: Json | null
          storage_path: string
          version: number
        }
        Insert: {
          backup_type?: string | null
          checksum?: string | null
          created_at?: string
          expires_at?: string | null
          file_size_bytes?: number | null
          id?: string
          instance_id: string
          is_valid?: boolean | null
          restored_at?: string | null
          restored_by?: string | null
          session_metadata?: Json | null
          storage_path: string
          version?: number
        }
        Update: {
          backup_type?: string | null
          checksum?: string | null
          created_at?: string
          expires_at?: string | null
          file_size_bytes?: number | null
          id?: string
          instance_id?: string
          is_valid?: boolean | null
          restored_at?: string | null
          restored_by?: string | null
          session_metadata?: Json | null
          storage_path?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "genesis_session_backups_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_spam_words: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          severity: string | null
          word: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          severity?: string | null
          word: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          severity?: string | null
          word?: string
        }
        Relationships: []
      }
      genesis_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          features: Json | null
          id: string
          max_flows: number
          max_instances: number
          plan: Database["public"]["Enums"]["genesis_plan"]
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          max_flows?: number
          max_instances?: number
          plan?: Database["public"]["Enums"]["genesis_plan"]
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          max_flows?: number
          max_instances?: number
          plan?: Database["public"]["Enums"]["genesis_plan"]
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["genesis_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["genesis_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["genesis_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_users: {
        Row: {
          auth_user_id: string
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
          whatsapp_commercial: string | null
          whatsapp_test: string | null
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
          whatsapp_commercial?: string | null
          whatsapp_test?: string | null
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
          whatsapp_commercial?: string | null
          whatsapp_test?: string | null
        }
        Relationships: []
      }
      genesis_verification_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          name: string
          password_hash: string | null
          phone: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          name: string
          password_hash?: string | null
          phone: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          name?: string
          password_hash?: string | null
          phone?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      genesis_vps_nodes: {
        Row: {
          api_token: string
          avg_latency_ms: number | null
          base_url: string
          cpu_load: number | null
          created_at: string
          current_instances: number
          health_score: number | null
          id: string
          is_active: boolean | null
          last_health_check_at: string | null
          last_heartbeat_at: string | null
          max_instances: number
          memory_load: number | null
          name: string
          priority: number | null
          region: string
          status: string
          updated_at: string
        }
        Insert: {
          api_token: string
          avg_latency_ms?: number | null
          base_url: string
          cpu_load?: number | null
          created_at?: string
          current_instances?: number
          health_score?: number | null
          id?: string
          is_active?: boolean | null
          last_health_check_at?: string | null
          last_heartbeat_at?: string | null
          max_instances?: number
          memory_load?: number | null
          name: string
          priority?: number | null
          region?: string
          status?: string
          updated_at?: string
        }
        Update: {
          api_token?: string
          avg_latency_ms?: number | null
          base_url?: string
          cpu_load?: number | null
          created_at?: string
          current_instances?: number
          health_score?: number | null
          id?: string
          is_active?: boolean | null
          last_health_check_at?: string | null
          last_heartbeat_at?: string | null
          max_instances?: number
          memory_load?: number | null
          name?: string
          priority?: number | null
          region?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      genesis_webhook_configs: {
        Row: {
          auth_config: Json | null
          auth_type: string | null
          burst_limit: number | null
          created_at: string | null
          custom_response: Json | null
          custom_response_enabled: boolean | null
          dedup_enabled: boolean | null
          dedup_field: string | null
          dedup_window_seconds: number | null
          description: string | null
          flow_id: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          rate_limit_per_hour: number | null
          rate_limit_per_minute: number | null
          secret_key: string | null
          updated_at: string | null
          user_id: string
          webhook_id: string
        }
        Insert: {
          auth_config?: Json | null
          auth_type?: string | null
          burst_limit?: number | null
          created_at?: string | null
          custom_response?: Json | null
          custom_response_enabled?: boolean | null
          dedup_enabled?: boolean | null
          dedup_field?: string | null
          dedup_window_seconds?: number | null
          description?: string | null
          flow_id?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          secret_key?: string | null
          updated_at?: string | null
          user_id: string
          webhook_id?: string
        }
        Update: {
          auth_config?: Json | null
          auth_type?: string | null
          burst_limit?: number | null
          created_at?: string | null
          custom_response?: Json | null
          custom_response_enabled?: boolean | null
          dedup_enabled?: boolean | null
          dedup_field?: string | null
          dedup_window_seconds?: number | null
          description?: string | null
          flow_id?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          secret_key?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_webhook_configs_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_webhook_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_webhook_dead_letters: {
        Row: {
          failed_at: string | null
          failure_details: Json | null
          failure_reason: string
          id: string
          last_retry_at: string | null
          max_retries: number | null
          original_headers: Json | null
          original_payload: Json
          resolved_at: string | null
          retry_count: number | null
          status: string | null
          webhook_config_id: string
          webhook_event_id: string
        }
        Insert: {
          failed_at?: string | null
          failure_details?: Json | null
          failure_reason: string
          id?: string
          last_retry_at?: string | null
          max_retries?: number | null
          original_headers?: Json | null
          original_payload: Json
          resolved_at?: string | null
          retry_count?: number | null
          status?: string | null
          webhook_config_id: string
          webhook_event_id: string
        }
        Update: {
          failed_at?: string | null
          failure_details?: Json | null
          failure_reason?: string
          id?: string
          last_retry_at?: string | null
          max_retries?: number | null
          original_headers?: Json | null
          original_payload?: Json
          resolved_at?: string | null
          retry_count?: number | null
          status?: string | null
          webhook_config_id?: string
          webhook_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_webhook_dead_letters_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "genesis_webhook_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genesis_webhook_dead_letters_webhook_event_id_fkey"
            columns: ["webhook_event_id"]
            isOneToOne: false
            referencedRelation: "genesis_webhook_events"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_webhook_events: {
        Row: {
          body_parsed: Json | null
          body_raw: string | null
          completed_at: string | null
          content_type: string | null
          error_details: Json | null
          error_message: string | null
          event_id: string | null
          execution_id: string | null
          headers: Json | null
          id: string
          method: string
          path: string | null
          processed_at: string | null
          query_params: Json | null
          received_at: string | null
          source_ip: string | null
          status: string | null
          user_agent: string | null
          validation_result: Json | null
          webhook_config_id: string
        }
        Insert: {
          body_parsed?: Json | null
          body_raw?: string | null
          completed_at?: string | null
          content_type?: string | null
          error_details?: Json | null
          error_message?: string | null
          event_id?: string | null
          execution_id?: string | null
          headers?: Json | null
          id?: string
          method: string
          path?: string | null
          processed_at?: string | null
          query_params?: Json | null
          received_at?: string | null
          source_ip?: string | null
          status?: string | null
          user_agent?: string | null
          validation_result?: Json | null
          webhook_config_id: string
        }
        Update: {
          body_parsed?: Json | null
          body_raw?: string | null
          completed_at?: string | null
          content_type?: string | null
          error_details?: Json | null
          error_message?: string | null
          event_id?: string | null
          execution_id?: string | null
          headers?: Json | null
          id?: string
          method?: string
          path?: string | null
          processed_at?: string | null
          query_params?: Json | null
          received_at?: string | null
          source_ip?: string | null
          status?: string | null
          user_agent?: string | null
          validation_result?: Json | null
          webhook_config_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_webhook_events_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "genesis_webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_webhook_rate_limits: {
        Row: {
          blocked_until: string | null
          burst_count: number | null
          burst_window_start: string | null
          created_at: string | null
          hour_window_start: string | null
          id: string
          is_blocked: boolean | null
          minute_window_start: string | null
          requests_hour: number | null
          requests_minute: number | null
          source_ip: string | null
          updated_at: string | null
          webhook_config_id: string
        }
        Insert: {
          blocked_until?: string | null
          burst_count?: number | null
          burst_window_start?: string | null
          created_at?: string | null
          hour_window_start?: string | null
          id?: string
          is_blocked?: boolean | null
          minute_window_start?: string | null
          requests_hour?: number | null
          requests_minute?: number | null
          source_ip?: string | null
          updated_at?: string | null
          webhook_config_id: string
        }
        Update: {
          blocked_until?: string | null
          burst_count?: number | null
          burst_window_start?: string | null
          created_at?: string | null
          hour_window_start?: string | null
          id?: string
          is_blocked?: boolean | null
          minute_window_start?: string | null
          requests_hour?: number | null
          requests_minute?: number | null
          source_ip?: string | null
          updated_at?: string | null
          webhook_config_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_webhook_rate_limits_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "genesis_webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_webhook_sources: {
        Row: {
          active: boolean
          created_at: string
          id: string
          secret_hash: string
          source_identifier: string
          source_type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          secret_hash: string
          source_identifier: string
          source_type: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          secret_hash?: string
          source_identifier?: string
          source_type?: string
        }
        Relationships: []
      }
      genesis_webhooks: {
        Row: {
          created_at: string | null
          events: string[] | null
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          secret_key: string | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          events?: string[] | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          secret_key?: string | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          events?: string[] | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          secret_key?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genesis_webhooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_widget_leads: {
        Row: {
          city: string | null
          converted: boolean | null
          converted_at: string | null
          country: string | null
          created_at: string | null
          email: string | null
          first_message: string | null
          id: string
          instance_id: string
          ip_address: string | null
          name: string | null
          page_url: string | null
          phone: string | null
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          widget_id: string
        }
        Insert: {
          city?: string | null
          converted?: boolean | null
          converted_at?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_message?: string | null
          id?: string
          instance_id: string
          ip_address?: string | null
          name?: string | null
          page_url?: string | null
          phone?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          widget_id: string
        }
        Update: {
          city?: string | null
          converted?: boolean | null
          converted_at?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_message?: string | null
          id?: string
          instance_id?: string
          ip_address?: string | null
          name?: string | null
          page_url?: string | null
          phone?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "genesis_widget_leads_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "genesis_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      genesis_widgets: {
        Row: {
          away_message: string | null
          collect_info: boolean | null
          created_at: string | null
          custom_css: string | null
          domain_whitelist: string[] | null
          id: string
          instance_id: string
          is_active: boolean | null
          name: string
          position: string | null
          required_fields: string[] | null
          theme: Json | null
          updated_at: string | null
          utm_tracking: boolean | null
          welcome_message: string | null
        }
        Insert: {
          away_message?: string | null
          collect_info?: boolean | null
          created_at?: string | null
          custom_css?: string | null
          domain_whitelist?: string[] | null
          id?: string
          instance_id: string
          is_active?: boolean | null
          name: string
          position?: string | null
          required_fields?: string[] | null
          theme?: Json | null
          updated_at?: string | null
          utm_tracking?: boolean | null
          welcome_message?: string | null
        }
        Update: {
          away_message?: string | null
          collect_info?: boolean | null
          created_at?: string | null
          custom_css?: string | null
          domain_whitelist?: string[] | null
          id?: string
          instance_id?: string
          is_active?: boolean | null
          name?: string
          position?: string | null
          required_fields?: string[] | null
          theme?: Json | null
          updated_at?: string | null
          utm_tracking?: boolean | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      genesis_work_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_enabled: boolean | null
          start_time: string
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time?: string
          id?: string
          is_enabled?: boolean | null
          start_time?: string
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_enabled?: boolean | null
          start_time?: string
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          ai_prompt: string | null
          button_text: string | null
          button_url: string | null
          completed_at: string | null
          created_at: string
          id: string
          image_url: string | null
          message_template: string
          name: string
          scheduled_at: string | null
          sent_count: number
          status: string
          target_count: number
          tenant_id: string | null
          updated_at: string
          use_ai: boolean
          user_id: string | null
        }
        Insert: {
          ai_prompt?: string | null
          button_text?: string | null
          button_url?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          message_template: string
          name: string
          scheduled_at?: string | null
          sent_count?: number
          status?: string
          target_count?: number
          tenant_id?: string | null
          updated_at?: string
          use_ai?: boolean
          user_id?: string | null
        }
        Update: {
          ai_prompt?: string | null
          button_text?: string | null
          button_url?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          message_template?: string
          name?: string
          scheduled_at?: string | null
          sent_count?: number
          status?: string
          target_count?: number
          tenant_id?: string | null
          updated_at?: string
          use_ai?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      marketing_contacts: {
        Row: {
          campaign_id: string | null
          created_at: string
          error_message: string | null
          id: string
          name: string | null
          phone: string
          sent_at: string | null
          status: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          name?: string | null
          phone: string
          sent_at?: string | null
          status?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          name?: string | null
          phone?: string
          sent_at?: string | null
          status?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_settings: {
        Row: {
          allowed_end_hour: number
          allowed_start_hour: number
          consecutive_errors: number
          created_at: string
          daily_limit: number
          delay_between_messages: number
          id: string
          is_enabled: boolean
          last_reset_date: string | null
          max_consecutive_errors: number
          max_contacts: number
          max_delay_seconds: number
          messages_sent_today: number
          min_delay_seconds: number
          pause_duration_seconds: number
          pause_every_n_messages: number
          tenant_id: string | null
          updated_at: string
          user_id: string | null
          warmup_day: number
          warmup_enabled: boolean
        }
        Insert: {
          allowed_end_hour?: number
          allowed_start_hour?: number
          consecutive_errors?: number
          created_at?: string
          daily_limit?: number
          delay_between_messages?: number
          id?: string
          is_enabled?: boolean
          last_reset_date?: string | null
          max_consecutive_errors?: number
          max_contacts?: number
          max_delay_seconds?: number
          messages_sent_today?: number
          min_delay_seconds?: number
          pause_duration_seconds?: number
          pause_every_n_messages?: number
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          warmup_day?: number
          warmup_enabled?: boolean
        }
        Update: {
          allowed_end_hour?: number
          allowed_start_hour?: number
          consecutive_errors?: number
          created_at?: string
          daily_limit?: number
          delay_between_messages?: number
          id?: string
          is_enabled?: boolean
          last_reset_date?: string | null
          max_consecutive_errors?: number
          max_contacts?: number
          max_delay_seconds?: number
          messages_sent_today?: number
          min_delay_seconds?: number
          pause_duration_seconds?: number
          pause_every_n_messages?: number
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          warmup_day?: number
          warmup_enabled?: boolean
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          button_text: string | null
          button_url: string | null
          chatpro_enabled: boolean | null
          created_at: string
          event_type: string
          id: string
          image_url: string | null
          is_active: boolean | null
          template: string
          tenant_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          button_text?: string | null
          button_url?: string | null
          chatpro_enabled?: boolean | null
          created_at?: string
          event_type: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          template: string
          tenant_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          button_text?: string | null
          button_url?: string | null
          chatpro_enabled?: boolean | null
          created_at?: string
          event_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          template?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      monthly_goals: {
        Row: {
          barber_id: string | null
          bonus_amount: number | null
          created_at: string
          current_value: number
          goal_type: string
          id: string
          is_active: boolean
          month: number
          target_value: number
          tenant_id: string | null
          updated_at: string
          user_id: string | null
          year: number
        }
        Insert: {
          barber_id?: string | null
          bonus_amount?: number | null
          created_at?: string
          current_value?: number
          goal_type?: string
          id?: string
          is_active?: boolean
          month: number
          target_value: number
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          year: number
        }
        Update: {
          barber_id?: string | null
          bonus_amount?: number | null
          created_at?: string
          current_value?: number
          goal_type?: string
          id?: string
          is_active?: boolean
          month?: number
          target_value?: number
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_goals_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_github_config: {
        Row: {
          branch: string
          created_at: string
          github_token_secret_id: string | null
          id: string
          install_path: string
          is_active: boolean
          node_version: string
          pm2_app_name: string
          project_name: string
          repository_url: string
          updated_at: string
        }
        Insert: {
          branch?: string
          created_at?: string
          github_token_secret_id?: string | null
          id?: string
          install_path?: string
          is_active?: boolean
          node_version?: string
          pm2_app_name?: string
          project_name?: string
          repository_url: string
          updated_at?: string
        }
        Update: {
          branch?: string
          created_at?: string
          github_token_secret_id?: string | null
          id?: string
          install_path?: string
          is_active?: boolean
          node_version?: string
          pm2_app_name?: string
          project_name?: string
          repository_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      owner_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      phone_verification_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          email: string | null
          expires_at: string
          id: string
          max_attempts: number | null
          name: string | null
          password_hash: string | null
          phone: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          max_attempts?: number | null
          name?: string | null
          password_hash?: string | null
          phone: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          max_attempts?: number | null
          name?: string | null
          password_hash?: string | null
          phone?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      proposal_questionnaire_history: {
        Row: {
          ai_follow_up: string | null
          answer: string | null
          created_at: string
          id: string
          metadata: Json | null
          proposal_id: string
          question: string
          question_index: number
        }
        Insert: {
          ai_follow_up?: string | null
          answer?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          proposal_id: string
          question: string
          question_index: number
        }
        Update: {
          ai_follow_up?: string | null
          answer?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          proposal_id?: string
          question?: string
          question_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_questionnaire_history_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "affiliate_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          client_phone: string | null
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          tenant_id: string | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          auth: string
          client_phone?: string | null
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          tenant_id?: string | null
          user_id?: string | null
          user_type?: string
        }
        Update: {
          auth?: string
          client_phone?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          tenant_id?: string | null
          user_id?: string | null
          user_type?: string
        }
        Relationships: []
      }
      queue: {
        Row: {
          appointment_id: string
          called_at: string | null
          created_at: string
          estimated_wait: number
          id: string
          onway_at: string | null
          position: number
          status: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          appointment_id: string
          called_at?: string | null
          created_at?: string
          estimated_wait?: number
          id?: string
          onway_at?: string | null
          position: number
          status?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_id?: string
          called_at?: string | null
          created_at?: string
          estimated_wait?: number
          id?: string
          onway_at?: string | null
          position?: number
          status?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queue_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          icon: string | null
          id: string
          name: string
          price: number
          tenant_id: string | null
          updated_at: string
          user_id: string | null
          visible: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number
          icon?: string | null
          id?: string
          name: string
          price?: number
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          visible?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          icon?: string | null
          id?: string
          name?: string
          price?: number
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          visible?: boolean | null
        }
        Relationships: []
      }
      shop_settings: {
        Row: {
          address: string | null
          created_at: string
          daily_appointment_limit: number | null
          description: string | null
          facebook: string | null
          hours_saturday: string | null
          hours_sunday: string | null
          hours_weekdays: string | null
          id: string
          instagram: string | null
          logo: string | null
          lunch_break_end: string | null
          lunch_break_start: string | null
          maps_link: string | null
          max_queue_size: number | null
          name: string
          overload_alert_enabled: boolean | null
          phone: string | null
          queue_enabled: boolean | null
          tagline: string | null
          tenant_id: string | null
          theme: string | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          daily_appointment_limit?: number | null
          description?: string | null
          facebook?: string | null
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          id?: string
          instagram?: string | null
          logo?: string | null
          lunch_break_end?: string | null
          lunch_break_start?: string | null
          maps_link?: string | null
          max_queue_size?: number | null
          name?: string
          overload_alert_enabled?: boolean | null
          phone?: string | null
          queue_enabled?: boolean | null
          tagline?: string | null
          tenant_id?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          daily_appointment_limit?: number | null
          description?: string | null
          facebook?: string | null
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          id?: string
          instagram?: string | null
          logo?: string | null
          lunch_break_end?: string | null
          lunch_break_start?: string | null
          maps_link?: string | null
          max_queue_size?: number | null
          name?: string
          overload_alert_enabled?: boolean | null
          phone?: string | null
          queue_enabled?: boolean | null
          tagline?: string | null
          tenant_id?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      shop_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
          plan_id: string
          starts_at: string
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          plan_id: string
          starts_at?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          plan_id?: string
          starts_at?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      site_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          page: string
          tenant_id: string | null
          unique_visitors: number
          user_id: string | null
          visits: number
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          page: string
          tenant_id?: string | null
          unique_visitors?: number
          user_id?: string | null
          visits?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          page?: string
          tenant_id?: string | null
          unique_visitors?: number
          user_id?: string | null
          visits?: number
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          display_name: string
          features: Json
          id: string
          is_active: boolean
          limits: Json
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          display_name: string
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          display_name?: string
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          log_type: string
          message: string
          severity: string
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          log_type: string
          message: string
          severity?: string
          source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          log_type?: string
          message?: string
          severity?: string
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string | null
          owner_user_id: string | null
          plan: string | null
          settings: Json | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          owner_user_id?: string | null
          plan?: string | null
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          owner_user_id?: string | null
          plan?: string | null
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          appointments_count: number
          clients_count: number
          created_at: string
          id: string
          month: number
          tenant_id: string | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          appointments_count?: number
          clients_count?: number
          created_at?: string
          id?: string
          month: number
          tenant_id?: string | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          appointments_count?: number
          clients_count?: number
          created_at?: string
          id?: string
          month?: number
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      user_2fa_secrets: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          secret: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          keyboard_shortcuts_enabled: boolean | null
          language: string | null
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          keyboard_shortcuts_enabled?: boolean | null
          language?: string | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          keyboard_shortcuts_enabled?: boolean | null
          language?: string | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_type: string | null
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          avatar_type?: string | null
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          avatar_type?: string | null
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity_at: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tenants: {
        Row: {
          created_at: string
          id: string | null
          is_active: boolean | null
          is_default: boolean | null
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tenants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_config: {
        Row: {
          config_type: string
          config_value: Json
          created_at: string | null
          id: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_type: string
          config_value?: Json
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_type?: string
          config_value?: Json
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          auto_resolved: boolean | null
          created_at: string | null
          id: string
          instance_id: string | null
          is_resolved: boolean | null
          message: string | null
          metadata: Json | null
          notification_sent: boolean | null
          resolved_at: string | null
          severity: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          auto_resolved?: boolean | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_resolved?: boolean | null
          message?: string | null
          metadata?: Json | null
          notification_sent?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          auto_resolved?: boolean | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_resolved?: boolean | null
          message?: string | null
          metadata?: Json | null
          notification_sent?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_alerts_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          instance_id: string | null
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: string[] | null
          rate_limit_per_minute: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: string[] | null
          rate_limit_per_minute?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[] | null
          rate_limit_per_minute?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_api_keys_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_api_logs: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          idempotency_key: string | null
          ip_address: string | null
          method: string
          project_id: string | null
          request_body: Json | null
          request_headers: Json | null
          response_body: Json | null
          response_status: number | null
          response_time_ms: number | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          idempotency_key?: string | null
          ip_address?: string | null
          method: string
          project_id?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          response_body?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          idempotency_key?: string | null
          ip_address?: string | null
          method?: string
          project_id?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          response_body?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_api_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_api_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_api_projects: {
        Row: {
          api_key: string
          api_secret: string
          created_at: string
          description: string | null
          environment: string
          id: string
          is_active: boolean
          max_instances: number
          name: string
          owner_user_id: string
          rate_limit_per_day: number
          rate_limit_per_hour: number
          rate_limit_per_minute: number
          updated_at: string
        }
        Insert: {
          api_key?: string
          api_secret?: string
          created_at?: string
          description?: string | null
          environment?: string
          id?: string
          is_active?: boolean
          max_instances?: number
          name: string
          owner_user_id: string
          rate_limit_per_day?: number
          rate_limit_per_hour?: number
          rate_limit_per_minute?: number
          updated_at?: string
        }
        Update: {
          api_key?: string
          api_secret?: string
          created_at?: string
          description?: string | null
          environment?: string
          id?: string
          is_active?: boolean
          max_instances?: number
          name?: string
          owner_user_id?: string
          rate_limit_per_day?: number
          rate_limit_per_hour?: number
          rate_limit_per_minute?: number
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string | null
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_audit_logs_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_automation_rules: {
        Row: {
          actions: Json
          activated_at: string | null
          canvas_position: Json | null
          conditions: Json | null
          created_at: string
          description: string | null
          execution_count: number
          flow_data: Json | null
          flow_version: number | null
          global_config: Json | null
          id: string
          instance_id: string
          is_active: boolean
          last_executed_at: string | null
          lifecycle_status: string | null
          name: string
          paused_at: string | null
          priority: number
          project_id: string | null
          trigger_config: Json
          trigger_type: string
          updated_at: string
          user_id: string
          validated_at: string | null
          validation_result: Json | null
        }
        Insert: {
          actions?: Json
          activated_at?: string | null
          canvas_position?: Json | null
          conditions?: Json | null
          created_at?: string
          description?: string | null
          execution_count?: number
          flow_data?: Json | null
          flow_version?: number | null
          global_config?: Json | null
          id?: string
          instance_id: string
          is_active?: boolean
          last_executed_at?: string | null
          lifecycle_status?: string | null
          name: string
          paused_at?: string | null
          priority?: number
          project_id?: string | null
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          user_id: string
          validated_at?: string | null
          validation_result?: Json | null
        }
        Update: {
          actions?: Json
          activated_at?: string | null
          canvas_position?: Json | null
          conditions?: Json | null
          created_at?: string
          description?: string | null
          execution_count?: number
          flow_data?: Json | null
          flow_version?: number | null
          global_config?: Json | null
          id?: string
          instance_id?: string
          is_active?: boolean
          last_executed_at?: string | null
          lifecycle_status?: string | null
          name?: string
          paused_at?: string | null
          priority?: number
          project_id?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
          validated_at?: string | null
          validation_result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_automation_rules_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_automation_rules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_api_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_automation_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_automation_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          message_template: string
          name: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_template: string
          name: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string
          name?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_automations: {
        Row: {
          ai_enabled: boolean | null
          ai_max_tokens: number | null
          ai_model: string | null
          ai_system_prompt: string | null
          ai_temperature: number | null
          company_name: string | null
          created_at: string | null
          delay_seconds: number | null
          fallback_message: string | null
          flow_config: Json | null
          id: string
          instance_id: string | null
          is_active: boolean | null
          match_count: number | null
          max_attempts: number | null
          name: string
          next_automation_id: string | null
          priority: number | null
          response_buttons: Json | null
          response_content: string | null
          response_list: Json | null
          response_type: string | null
          trigger_conditions: Json | null
          trigger_keywords: string[] | null
          trigger_type: string
          updated_at: string | null
          working_hours_only: boolean | null
        }
        Insert: {
          ai_enabled?: boolean | null
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_system_prompt?: string | null
          ai_temperature?: number | null
          company_name?: string | null
          created_at?: string | null
          delay_seconds?: number | null
          fallback_message?: string | null
          flow_config?: Json | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          match_count?: number | null
          max_attempts?: number | null
          name: string
          next_automation_id?: string | null
          priority?: number | null
          response_buttons?: Json | null
          response_content?: string | null
          response_list?: Json | null
          response_type?: string | null
          trigger_conditions?: Json | null
          trigger_keywords?: string[] | null
          trigger_type: string
          updated_at?: string | null
          working_hours_only?: boolean | null
        }
        Update: {
          ai_enabled?: boolean | null
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_system_prompt?: string | null
          ai_temperature?: number | null
          company_name?: string | null
          created_at?: string | null
          delay_seconds?: number | null
          fallback_message?: string | null
          flow_config?: Json | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          match_count?: number | null
          max_attempts?: number | null
          name?: string
          next_automation_id?: string | null
          priority?: number | null
          response_buttons?: Json | null
          response_content?: string | null
          response_list?: Json | null
          response_type?: string | null
          trigger_conditions?: Json | null
          trigger_keywords?: string[] | null
          trigger_type?: string
          updated_at?: string | null
          working_hours_only?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_automations_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "genesis_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_automations_next_automation_id_fkey"
            columns: ["next_automation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_away_messages: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          is_active: boolean | null
          message_text: string
          send_once_per_contact: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          message_text: string
          send_once_per_contact?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          message_text?: string
          send_once_per_contact?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_away_messages_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_backend_config: {
        Row: {
          backend_url: string | null
          created_at: string
          id: string
          is_connected: boolean
          last_health_check: string | null
          master_token: string | null
          updated_at: string
        }
        Insert: {
          backend_url?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_health_check?: string | null
          master_token?: string | null
          updated_at?: string
        }
        Update: {
          backend_url?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_health_check?: string | null
          master_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_business_hours: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          instance_id: string | null
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_business_hours_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_button_actions: {
        Row: {
          action_config: Json | null
          action_type: string
          button_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          template_id: string | null
        }
        Insert: {
          action_config?: Json | null
          action_type: string
          button_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          template_id?: string | null
        }
        Update: {
          action_config?: Json | null
          action_type?: string
          button_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_button_actions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_interactive_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_button_clicks: {
        Row: {
          action_result: Json | null
          action_triggered: string | null
          button_id: string
          button_text: string | null
          conversation_state_id: string | null
          created_at: string | null
          id: string
          instance_id: string | null
          phone: string
          processed_at: string | null
          template_id: string | null
        }
        Insert: {
          action_result?: Json | null
          action_triggered?: string | null
          button_id: string
          button_text?: string | null
          conversation_state_id?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          phone: string
          processed_at?: string | null
          template_id?: string | null
        }
        Update: {
          action_result?: Json | null
          action_triggered?: string | null
          button_id?: string
          button_text?: string | null
          conversation_state_id?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          phone?: string
          processed_at?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_button_clicks_conversation_state_id_fkey"
            columns: ["conversation_state_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversation_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_button_clicks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_button_clicks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_interactive_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_circuit_breaker: {
        Row: {
          circuit_name: string
          created_at: string | null
          failure_count: number | null
          half_open_at: string | null
          id: string
          instance_id: string | null
          last_failure_at: string | null
          last_success_at: string | null
          opened_at: string | null
          reset_timeout_seconds: number | null
          state: string | null
          success_count: number | null
          threshold_failures: number | null
          updated_at: string | null
        }
        Insert: {
          circuit_name: string
          created_at?: string | null
          failure_count?: number | null
          half_open_at?: string | null
          id?: string
          instance_id?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          opened_at?: string | null
          reset_timeout_seconds?: number | null
          state?: string | null
          success_count?: number | null
          threshold_failures?: number | null
          updated_at?: string | null
        }
        Update: {
          circuit_name?: string
          created_at?: string | null
          failure_count?: number | null
          half_open_at?: string | null
          id?: string
          instance_id?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          opened_at?: string | null
          reset_timeout_seconds?: number | null
          state?: string | null
          success_count?: number | null
          threshold_failures?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_circuit_breaker_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_contacts: {
        Row: {
          about: string | null
          created_at: string | null
          custom_fields: Json | null
          has_whatsapp: boolean | null
          id: string
          instance_id: string | null
          is_blocked: boolean | null
          is_business: boolean | null
          is_verified: boolean | null
          last_checked_at: string | null
          name: string | null
          phone: string
          profile_picture_url: string | null
          push_name: string | null
          synced_at: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          about?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          has_whatsapp?: boolean | null
          id?: string
          instance_id?: string | null
          is_blocked?: boolean | null
          is_business?: boolean | null
          is_verified?: boolean | null
          last_checked_at?: string | null
          name?: string | null
          phone: string
          profile_picture_url?: string | null
          push_name?: string | null
          synced_at?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          about?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          has_whatsapp?: boolean | null
          id?: string
          instance_id?: string | null
          is_blocked?: boolean | null
          is_business?: boolean | null
          is_verified?: boolean | null
          last_checked_at?: string | null
          name?: string | null
          phone?: string
          profile_picture_url?: string | null
          push_name?: string | null
          synced_at?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contacts_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversation_states: {
        Row: {
          contact_name: string | null
          context_data: Json | null
          created_at: string | null
          current_state: string | null
          id: string
          instance_id: string | null
          last_button_clicked: string | null
          last_template_id: string | null
          metadata: Json | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          contact_name?: string | null
          context_data?: Json | null
          created_at?: string | null
          current_state?: string | null
          id?: string
          instance_id?: string | null
          last_button_clicked?: string | null
          last_template_id?: string | null
          metadata?: Json | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          contact_name?: string | null
          context_data?: Json | null
          created_at?: string | null
          current_state?: string | null
          id?: string
          instance_id?: string | null
          last_button_clicked?: string | null
          last_template_id?: string | null
          metadata?: Json | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversation_states_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversation_states_last_template_id_fkey"
            columns: ["last_template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_interactive_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          contact_name: string | null
          created_at: string | null
          id: string
          instance_id: string | null
          is_archived: boolean | null
          is_blocked: boolean | null
          is_muted: boolean | null
          is_pinned: boolean | null
          last_message: string | null
          last_message_at: string | null
          notes: string | null
          phone: string
          profile_picture_url: string | null
          tags: string[] | null
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_archived?: boolean | null
          is_blocked?: boolean | null
          is_muted?: boolean | null
          is_pinned?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          notes?: string | null
          phone: string
          profile_picture_url?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_archived?: boolean | null
          is_blocked?: boolean | null
          is_muted?: boolean | null
          is_pinned?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          notes?: string | null
          phone?: string
          profile_picture_url?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_disconnect_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          created_at: string | null
          id: string
          instance_id: string
          message: string | null
          sent_at: string | null
          sent_via_email: boolean | null
          sent_via_push: boolean | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          instance_id: string
          message?: string | null
          sent_at?: string | null
          sent_via_email?: boolean | null
          sent_via_push?: boolean | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          instance_id?: string
          message?: string | null
          sent_at?: string | null
          sent_via_email?: boolean | null
          sent_via_push?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_event_queue: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          event_data: Json
          event_type: string
          id: string
          max_attempts: number
          processed_at: string | null
          project_id: string | null
          scheduled_for: string
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          event_data: Json
          event_type: string
          id?: string
          max_attempts?: number
          processed_at?: string | null
          project_id?: string | null
          scheduled_for?: string
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          max_attempts?: number
          processed_at?: string | null
          project_id?: string | null
          scheduled_for?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_event_queue_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_api_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_external_webhooks: {
        Row: {
          created_at: string
          events: string[]
          failure_count: number
          headers: Json | null
          id: string
          is_active: boolean
          last_status_code: number | null
          last_triggered_at: string | null
          max_retries: number
          name: string
          project_id: string
          retry_delay_seconds: number
          retry_enabled: boolean
          secret_key: string | null
          success_count: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          failure_count?: number
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_status_code?: number | null
          last_triggered_at?: string | null
          max_retries?: number
          name: string
          project_id: string
          retry_delay_seconds?: number
          retry_enabled?: boolean
          secret_key?: string | null
          success_count?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          failure_count?: number
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_status_code?: number | null
          last_triggered_at?: string | null
          max_retries?: number
          name?: string
          project_id?: string
          retry_delay_seconds?: number
          retry_enabled?: boolean
          secret_key?: string | null
          success_count?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_external_webhooks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_api_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_flow_edges: {
        Row: {
          created_at: string | null
          edge_condition: Json | null
          edge_id: string
          edge_label: string | null
          id: string
          rule_id: string | null
          source_handle: string | null
          source_node_id: string
          target_handle: string | null
          target_node_id: string
        }
        Insert: {
          created_at?: string | null
          edge_condition?: Json | null
          edge_id: string
          edge_label?: string | null
          id?: string
          rule_id?: string | null
          source_handle?: string | null
          source_node_id: string
          target_handle?: string | null
          target_node_id: string
        }
        Update: {
          created_at?: string | null
          edge_condition?: Json | null
          edge_id?: string
          edge_label?: string | null
          id?: string
          rule_id?: string | null
          source_handle?: string | null
          source_node_id?: string
          target_handle?: string | null
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_flow_edges_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_flow_nodes: {
        Row: {
          created_at: string | null
          id: string
          node_config: Json | null
          node_id: string
          node_label: string | null
          node_type: string
          position_x: number | null
          position_y: number | null
          rule_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          node_config?: Json | null
          node_id: string
          node_label?: string | null
          node_type: string
          position_x?: number | null
          position_y?: number | null
          rule_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          node_config?: Json | null
          node_id?: string
          node_label?: string | null
          node_type?: string
          position_x?: number | null
          position_y?: number | null
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_flow_nodes_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_group_participants: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          is_admin: boolean | null
          is_super_admin: boolean | null
          joined_at: string | null
          name: string | null
          phone: string
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_admin?: boolean | null
          is_super_admin?: boolean | null
          joined_at?: string | null
          name?: string | null
          phone: string
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_admin?: boolean | null
          is_super_admin?: boolean | null
          joined_at?: string | null
          name?: string | null
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_group_participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_groups: {
        Row: {
          created_at: string | null
          description: string | null
          group_jid: string
          id: string
          instance_id: string | null
          is_admin: boolean | null
          is_archived: boolean | null
          last_message_at: string | null
          metadata: Json | null
          name: string | null
          owner_jid: string | null
          participant_count: number | null
          picture_url: string | null
          synced_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_jid: string
          id?: string
          instance_id?: string | null
          is_admin?: boolean | null
          is_archived?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner_jid?: string | null
          participant_count?: number | null
          picture_url?: string | null
          synced_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_jid?: string
          id?: string
          instance_id?: string | null
          is_admin?: boolean | null
          is_archived?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner_jid?: string | null
          participant_count?: number | null
          picture_url?: string | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_groups_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_health_checks: {
        Row: {
          checked_at: string | null
          connection_state: string | null
          error_message: string | null
          id: string
          instance_id: string | null
          last_message_at: string | null
          latency_ms: number | null
          memory_usage_mb: number | null
          status: string
        }
        Insert: {
          checked_at?: string | null
          connection_state?: string | null
          error_message?: string | null
          id?: string
          instance_id?: string | null
          last_message_at?: string | null
          latency_ms?: number | null
          memory_usage_mb?: number | null
          status: string
        }
        Update: {
          checked_at?: string | null
          connection_state?: string | null
          error_message?: string | null
          id?: string
          instance_id?: string | null
          last_message_at?: string | null
          latency_ms?: number | null
          memory_usage_mb?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_health_checks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_inbox: {
        Row: {
          contact_name: string | null
          created_at: string | null
          id: string
          instance_id: string | null
          is_from_me: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          media_mime_type: string | null
          media_url: string | null
          message_content: string | null
          message_id: string | null
          message_type: string | null
          metadata: Json | null
          phone_from: string
          phone_to: string | null
          read_at: string | null
          received_at: string | null
          replied_to_id: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_from_me?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          media_mime_type?: string | null
          media_url?: string | null
          message_content?: string | null
          message_id?: string | null
          message_type?: string | null
          metadata?: Json | null
          phone_from: string
          phone_to?: string | null
          read_at?: string | null
          received_at?: string | null
          replied_to_id?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_from_me?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          media_mime_type?: string | null
          media_url?: string | null
          message_content?: string | null
          message_id?: string | null
          message_type?: string | null
          metadata?: Json | null
          phone_from?: string
          phone_to?: string | null
          read_at?: string | null
          received_at?: string | null
          replied_to_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_inbox_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_inbox_replied_to_id_fkey"
            columns: ["replied_to_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_inbox"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          auto_reconnect: boolean | null
          auto_reply_enabled: boolean
          auto_reply_message: string | null
          backend_token: string | null
          backend_url: string | null
          created_at: string
          effective_status: string | null
          heartbeat_age_seconds: number | null
          heartbeat_interval_ms: number | null
          id: string
          instance_token: string
          is_active: boolean | null
          last_heartbeat: string | null
          last_heartbeat_at: string | null
          last_seen: string | null
          max_reconnect_attempts: number | null
          message_delay_ms: number
          name: string
          phone_number: string | null
          proxy_url: string | null
          reconnect_attempts: number | null
          session_backup: Json | null
          status: string
          updated_at: string
          uptime_seconds: number | null
          webhook_url: string | null
        }
        Insert: {
          auto_reconnect?: boolean | null
          auto_reply_enabled?: boolean
          auto_reply_message?: string | null
          backend_token?: string | null
          backend_url?: string | null
          created_at?: string
          effective_status?: string | null
          heartbeat_age_seconds?: number | null
          heartbeat_interval_ms?: number | null
          id?: string
          instance_token?: string
          is_active?: boolean | null
          last_heartbeat?: string | null
          last_heartbeat_at?: string | null
          last_seen?: string | null
          max_reconnect_attempts?: number | null
          message_delay_ms?: number
          name: string
          phone_number?: string | null
          proxy_url?: string | null
          reconnect_attempts?: number | null
          session_backup?: Json | null
          status?: string
          updated_at?: string
          uptime_seconds?: number | null
          webhook_url?: string | null
        }
        Update: {
          auto_reconnect?: boolean | null
          auto_reply_enabled?: boolean
          auto_reply_message?: string | null
          backend_token?: string | null
          backend_url?: string | null
          created_at?: string
          effective_status?: string | null
          heartbeat_age_seconds?: number | null
          heartbeat_interval_ms?: number | null
          id?: string
          instance_token?: string
          is_active?: boolean | null
          last_heartbeat?: string | null
          last_heartbeat_at?: string | null
          last_seen?: string | null
          max_reconnect_attempts?: number | null
          message_delay_ms?: number
          name?: string
          phone_number?: string | null
          proxy_url?: string | null
          reconnect_attempts?: number | null
          session_backup?: Json | null
          status?: string
          updated_at?: string
          uptime_seconds?: number | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_interactive_templates: {
        Row: {
          button_text: string | null
          buttons: Json | null
          category: string | null
          created_at: string | null
          description: string | null
          footer_text: string | null
          header_content: string | null
          header_type: string | null
          id: string
          is_active: boolean | null
          list_sections: Json | null
          message_content: string
          name: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          button_text?: string | null
          buttons?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          footer_text?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          is_active?: boolean | null
          list_sections?: Json | null
          message_content: string
          name: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          button_text?: string | null
          buttons?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          footer_text?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          is_active?: boolean | null
          list_sections?: Json | null
          message_content?: string
          name?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      whatsapp_labels: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      whatsapp_message_logs: {
        Row: {
          created_at: string
          direction: string
          error_message: string | null
          id: string
          instance_id: string
          message: string
          phone_to: string
          status: string
        }
        Insert: {
          created_at?: string
          direction: string
          error_message?: string | null
          id?: string
          instance_id: string
          message: string
          phone_to: string
          status?: string
        }
        Update: {
          created_at?: string
          direction?: string
          error_message?: string | null
          id?: string
          instance_id?: string
          message?: string
          phone_to?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_message_logs_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_message_templates: {
        Row: {
          approved_at: string | null
          body: string
          buttons: Json | null
          category: string
          created_at: string | null
          external_id: string | null
          footer: string | null
          header_content: string | null
          header_type: string | null
          id: string
          language: string | null
          name: string
          rejection_reason: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          approved_at?: string | null
          body: string
          buttons?: Json | null
          category: string
          created_at?: string | null
          external_id?: string | null
          footer?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          language?: string | null
          name: string
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          approved_at?: string | null
          body?: string
          buttons?: Json | null
          category?: string
          created_at?: string | null
          external_id?: string | null
          footer?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          language?: string | null
          name?: string
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_message_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "genesis_users"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_metrics: {
        Row: {
          avg_response_time_seconds: number | null
          created_at: string | null
          disconnection_count: number | null
          id: string
          instance_id: string | null
          media_received: number | null
          media_sent: number | null
          messages_failed: number | null
          messages_received: number | null
          messages_sent: number | null
          metric_date: string
          unique_contacts: number | null
          updated_at: string | null
          uptime_seconds: number | null
        }
        Insert: {
          avg_response_time_seconds?: number | null
          created_at?: string | null
          disconnection_count?: number | null
          id?: string
          instance_id?: string | null
          media_received?: number | null
          media_sent?: number | null
          messages_failed?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          metric_date: string
          unique_contacts?: number | null
          updated_at?: string | null
          uptime_seconds?: number | null
        }
        Update: {
          avg_response_time_seconds?: number | null
          created_at?: string | null
          disconnection_count?: number | null
          id?: string
          instance_id?: string | null
          media_received?: number | null
          media_sent?: number | null
          messages_failed?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          metric_date?: string
          unique_contacts?: number | null
          updated_at?: string | null
          uptime_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_metrics_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_phone_validation: {
        Row: {
          check_count: number | null
          country_code: string | null
          created_at: string | null
          id: string
          is_valid: boolean | null
          is_whatsapp: boolean | null
          last_checked_at: string | null
          phone_number: string
          updated_at: string | null
          validation_source: string | null
        }
        Insert: {
          check_count?: number | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          is_whatsapp?: boolean | null
          last_checked_at?: string | null
          phone_number: string
          updated_at?: string | null
          validation_source?: string | null
        }
        Update: {
          check_count?: number | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          is_whatsapp?: boolean | null
          last_checked_at?: string | null
          phone_number?: string
          updated_at?: string | null
          validation_source?: string | null
        }
        Relationships: []
      }
      whatsapp_project_instances: {
        Row: {
          can_manage: boolean
          can_receive: boolean
          can_send: boolean
          id: string
          instance_id: string
          linked_at: string
          project_id: string
        }
        Insert: {
          can_manage?: boolean
          can_receive?: boolean
          can_send?: boolean
          id?: string
          instance_id: string
          linked_at?: string
          project_id: string
        }
        Update: {
          can_manage?: boolean
          can_receive?: boolean
          can_send?: boolean
          id?: string
          instance_id?: string
          linked_at?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_project_instances_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_project_instances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_api_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_quick_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          instance_id: string | null
          is_active: boolean | null
          media_url: string | null
          shortcut: string
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          media_url?: string | null
          shortcut: string
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          media_url?: string | null
          shortcut?: string
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_quick_replies_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_rate_limits: {
        Row: {
          day_count: number
          day_window: string
          hour_count: number
          hour_window: string
          id: string
          minute_count: number
          minute_window: string
          project_id: string
          updated_at: string
        }
        Insert: {
          day_count?: number
          day_window?: string
          hour_count?: number
          hour_window?: string
          id?: string
          minute_count?: number
          minute_window?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          day_count?: number
          day_window?: string
          hour_count?: number
          hour_window?: string
          id?: string
          minute_count?: number
          minute_window?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_rate_limits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "whatsapp_api_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_scheduled_messages: {
        Row: {
          buttons: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          instance_id: string | null
          list_options: Json | null
          max_retries: number | null
          media_url: string | null
          message_content: string | null
          message_type: string | null
          phone_to: string
          retry_count: number | null
          scheduled_at: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          buttons?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          instance_id?: string | null
          list_options?: Json | null
          max_retries?: number | null
          media_url?: string | null
          message_content?: string | null
          message_type?: string | null
          phone_to: string
          retry_count?: number | null
          scheduled_at: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          buttons?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          instance_id?: string | null
          list_options?: Json | null
          max_retries?: number | null
          media_url?: string | null
          message_content?: string | null
          message_type?: string | null
          phone_to?: string
          retry_count?: number | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_scheduled_messages_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_security_settings: {
        Row: {
          audit_log_enabled: boolean | null
          blocked_keywords: string[] | null
          created_at: string | null
          id: string
          instance_id: string | null
          ip_whitelist: string[] | null
          message_delay_max_ms: number | null
          message_delay_min_ms: number | null
          rate_limit_per_hour: number | null
          rate_limit_per_minute: number | null
          require_2fa: boolean | null
          typing_duration_ms: number | null
          typing_simulation: boolean | null
          updated_at: string | null
          warmup_day: number | null
          warmup_enabled: boolean | null
          warmup_messages_per_day: number | null
        }
        Insert: {
          audit_log_enabled?: boolean | null
          blocked_keywords?: string[] | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_whitelist?: string[] | null
          message_delay_max_ms?: number | null
          message_delay_min_ms?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          require_2fa?: boolean | null
          typing_duration_ms?: number | null
          typing_simulation?: boolean | null
          updated_at?: string | null
          warmup_day?: number | null
          warmup_enabled?: boolean | null
          warmup_messages_per_day?: number | null
        }
        Update: {
          audit_log_enabled?: boolean | null
          blocked_keywords?: string[] | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_whitelist?: string[] | null
          message_delay_max_ms?: number | null
          message_delay_min_ms?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          require_2fa?: boolean | null
          typing_duration_ms?: number | null
          typing_simulation?: boolean | null
          updated_at?: string | null
          warmup_day?: number | null
          warmup_enabled?: boolean | null
          warmup_messages_per_day?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_security_settings_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: true
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_send_queue: {
        Row: {
          attempts: number | null
          backoff_multiplier: number | null
          buttons: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          instance_id: string | null
          last_error_code: string | null
          list_options: Json | null
          max_attempts: number | null
          media_caption: string | null
          media_url: string | null
          message_content: string | null
          message_type: string | null
          metadata: Json | null
          next_attempt_at: string | null
          phone_to: string
          phone_validated: boolean | null
          priority: number | null
          retry_delay_seconds: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          validation_status: string | null
        }
        Insert: {
          attempts?: number | null
          backoff_multiplier?: number | null
          buttons?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          instance_id?: string | null
          last_error_code?: string | null
          list_options?: Json | null
          max_attempts?: number | null
          media_caption?: string | null
          media_url?: string | null
          message_content?: string | null
          message_type?: string | null
          metadata?: Json | null
          next_attempt_at?: string | null
          phone_to: string
          phone_validated?: boolean | null
          priority?: number | null
          retry_delay_seconds?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          validation_status?: string | null
        }
        Update: {
          attempts?: number | null
          backoff_multiplier?: number | null
          buttons?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          instance_id?: string | null
          last_error_code?: string | null
          list_options?: Json | null
          max_attempts?: number | null
          media_caption?: string | null
          media_url?: string | null
          message_content?: string | null
          message_type?: string | null
          metadata?: Json | null
          next_attempt_at?: string | null
          phone_to?: string
          phone_validated?: boolean | null
          priority?: number | null
          retry_delay_seconds?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_send_queue_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_stability_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          instance_id: string | null
          message: string | null
          severity: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          instance_id?: string | null
          message?: string | null
          severity?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          instance_id?: string | null
          message?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_stability_logs_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_template_sends: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          instance_id: string | null
          phone: string
          read_at: string | null
          rendered_content: string | null
          sent_at: string | null
          status: string | null
          template_id: string | null
          variables_used: Json | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          instance_id?: string | null
          phone: string
          read_at?: string | null
          rendered_content?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          variables_used?: Json | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          instance_id?: string | null
          phone?: string
          read_at?: string | null
          rendered_content?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          variables_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_template_sends_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_template_sends_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_interactive_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          ai_prompt: string | null
          button_text: string | null
          button_url: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          message_template: string
          name: string
          template_type: string
          updated_at: string | null
          use_ai: boolean | null
        }
        Insert: {
          ai_prompt?: string | null
          button_text?: string | null
          button_url?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message_template: string
          name: string
          template_type: string
          updated_at?: string | null
          use_ai?: boolean | null
        }
        Update: {
          ai_prompt?: string | null
          button_text?: string | null
          button_url?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message_template?: string
          name?: string
          template_type?: string
          updated_at?: string | null
          use_ai?: boolean | null
        }
        Relationships: []
      }
      whatsapp_webhook_logs: {
        Row: {
          attempt_number: number | null
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          is_success: boolean | null
          latency_ms: number | null
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string | null
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          is_success?: boolean | null
          latency_ms?: number | null
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Update: {
          attempt_number?: number | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          is_success?: boolean | null
          latency_ms?: number | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          failure_count: number | null
          headers: Json | null
          id: string
          instance_id: string | null
          is_active: boolean | null
          last_status_code: number | null
          last_triggered_at: string | null
          name: string
          retry_count: number | null
          retry_delay_seconds: number | null
          retry_enabled: boolean | null
          secret_key: string | null
          success_count: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number | null
          retry_delay_seconds?: number | null
          retry_enabled?: boolean | null
          secret_key?: string | null
          success_count?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          instance_id?: string | null
          is_active?: boolean | null
          last_status_code?: number | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number | null
          retry_delay_seconds?: number | null
          retry_enabled?: boolean | null
          secret_key?: string | null
          success_count?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_webhooks_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_contact_blacklisted: {
        Args: { p_phone: string; p_user_id: string }
        Returns: boolean
      }
      check_contact_list_ownership: {
        Args: { p_list_id: string }
        Returns: boolean
      }
      check_ip_fraud: { Args: { check_ip: string }; Returns: boolean }
      check_login_attempts: { Args: { p_email: string }; Returns: boolean }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_limit: number
          p_window_minutes: number
        }
        Returns: {
          allowed: boolean
          remaining: number
          reset_at: string
        }[]
      }
      check_session_timeout: {
        Args: { p_timeout_minutes?: number; p_user_id: string }
        Returns: boolean
      }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_expired_verification_codes: { Args: never; Returns: undefined }
      cleanup_old_genesis_codes: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: number }
      current_tenant_id: { Args: never; Returns: string }
      current_tenant_ids: { Args: never; Returns: string[] }
      deduct_genesis_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: boolean
      }
      genesis_calculate_health_score: {
        Args: { p_instance_id: string }
        Returns: number
      }
      genesis_check_campaign_dedup: {
        Args: { p_message: string; p_phone: string; p_user: string }
        Returns: boolean
      }
      genesis_check_webhook_dedup: {
        Args: { p_event_id: string; p_webhook_config_id: string }
        Returns: boolean
      }
      genesis_check_webhook_rate_limit: {
        Args: { p_source_ip: string; p_webhook_config_id: string }
        Returns: Json
      }
      genesis_cleanup_old_backups: {
        Args: { p_instance_id: string; p_keep_count?: number }
        Returns: number
      }
      genesis_complete_failover: {
        Args: {
          p_error_message?: string
          p_failover_id: string
          p_success: boolean
        }
        Returns: boolean
      }
      genesis_create_alert: {
        Args: {
          p_alert_type: string
          p_instance_id: string
          p_message: string
          p_metadata?: Json
          p_severity: string
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      genesis_create_backup_record: {
        Args: {
          p_backup_type?: string
          p_checksum?: string
          p_file_size?: number
          p_instance_id: string
          p_metadata?: Json
        }
        Returns: string
      }
      genesis_detect_offline_nodes: { Args: never; Returns: number }
      genesis_evaluate_alert_rules: {
        Args: { p_instance_id: string }
        Returns: number
      }
      genesis_get_latest_backup: {
        Args: { p_instance_id: string }
        Returns: {
          backup_id: string
          checksum: string
          created_at: string
          storage_path: string
          version: number
        }[]
      }
      genesis_initiate_failover: {
        Args: {
          p_instance_id: string
          p_reason?: string
          p_target_node_id?: string
        }
        Returns: Json
      }
      genesis_log_event: {
        Args: { p_event_type: string; p_instance_id: string; p_payload?: Json }
        Returns: string
      }
      genesis_mark_backup_restored: {
        Args: { p_backup_id: string }
        Returns: boolean
      }
      genesis_node_heartbeat: {
        Args: {
          p_avg_latency?: number
          p_cpu_load?: number
          p_instance_count?: number
          p_memory_load?: number
          p_node_id: string
        }
        Returns: Json
      }
      genesis_orchestrate_status_change:
        | {
            Args: {
              p_instance_id: string
              p_new_status: string
              p_payload?: Json
              p_source?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_force?: boolean
              p_instance_id: string
              p_new_status: string
              p_source?: string
            }
            Returns: Json
          }
      genesis_record_metrics: {
        Args: { p_instance_id: string; p_metrics: Json }
        Returns: string
      }
      genesis_register_campaign_dedup: {
        Args: {
          p_campaign: string
          p_hours?: number
          p_message: string
          p_phone: string
          p_user: string
        }
        Returns: undefined
      }
      genesis_revoke_instance_tokens: {
        Args: { p_instance_id: string }
        Returns: number
      }
      genesis_select_best_node: {
        Args: { p_exclude_node_id?: string; p_region?: string }
        Returns: {
          available_slots: number
          health_score: number
          node_id: string
          node_name: string
          node_url: string
        }[]
      }
      genesis_validate_state_transition: {
        Args: { p_from_state: string; p_to_state: string }
        Returns: boolean
      }
      get_affiliate_id: { Args: { _user_id: string }; Returns: string }
      get_crm_tenant_id: { Args: { _auth_user_id: string }; Returns: string }
      get_crm_user_id: { Args: { _auth_user_id: string }; Returns: string }
      get_genesis_status_summary: { Args: never; Returns: Json }
      get_genesis_user_id: { Args: { _auth_user_id: string }; Returns: string }
      get_genesis_user_id_for_auth: { Args: never; Returns: string }
      get_user_plan: { Args: { check_user_id: string }; Returns: string }
      get_warmup_limit: { Args: { p_instance_id: string }; Returns: number }
      has_genesis_role: {
        Args: {
          _role: Database["public"]["Enums"]["genesis_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_campaign_contacts: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_affiliate: { Args: { _user_id: string }; Returns: boolean }
      is_circuit_open: {
        Args: { p_circuit_name: string; p_instance_id: string }
        Returns: boolean
      }
      is_crm_admin: { Args: { _auth_user_id: string }; Returns: boolean }
      is_crm_member: {
        Args: { _auth_user_id: string; _tenant_id: string }
        Returns: boolean
      }
      is_feature_allowed: {
        Args: { check_user_id: string; feature_name: string }
        Returns: boolean
      }
      is_genesis_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      log_security_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type: string
        }
        Returns: undefined
      }
      manage_circuit_breaker: {
        Args: {
          p_circuit_name: string
          p_instance_id: string
          p_success: boolean
        }
        Returns: string
      }
      pay_proposal_commission: {
        Args: { proposal_id: string }
        Returns: boolean
      }
      record_login_attempt: {
        Args: {
          p_email: string
          p_ip_address?: string
          p_success: boolean
          p_user_agent?: string
        }
        Returns: undefined
      }
      select_pool_instance: { Args: { p_campaign_id: string }; Returns: string }
      tenant_matches: { Args: { p_tenant: string }; Returns: boolean }
      update_flow_lifecycle_status: {
        Args: {
          p_flow_id: string
          p_new_status: string
          p_validation_result?: Json
        }
        Returns: Json
      }
      update_instance_health: {
        Args: { p_instance_id: string }
        Returns: undefined
      }
      update_session_activity: {
        Args: { p_session_token: string }
        Returns: undefined
      }
      validate_token_owner: {
        Args: { token_user_id: string }
        Returns: boolean
      }
      verify_totp_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      affiliate_status: "pending" | "active" | "blocked"
      app_role: "super_admin" | "admin" | "barber"
      crm_lead_status: "new" | "active" | "won" | "lost"
      crm_role: "admin" | "manager" | "collaborator"
      crm_task_status: "pending" | "in_progress" | "completed" | "cancelled"
      crm_task_type: "call" | "meeting" | "followup" | "internal"
      flow_lifecycle_status:
        | "draft"
        | "validated"
        | "active"
        | "paused"
        | "error"
      genesis_plan: "free" | "starter" | "professional" | "enterprise"
      genesis_role: "super_admin" | "admin" | "user"
      pix_type: "cpf" | "cnpj" | "email" | "phone" | "random"
      proposal_status: "draft" | "sent" | "accepted" | "cancelled"
      referral_status: "pending" | "confirmed" | "cancelled" | "paid"
      withdrawal_status: "pending" | "processing" | "completed" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      affiliate_status: ["pending", "active", "blocked"],
      app_role: ["super_admin", "admin", "barber"],
      crm_lead_status: ["new", "active", "won", "lost"],
      crm_role: ["admin", "manager", "collaborator"],
      crm_task_status: ["pending", "in_progress", "completed", "cancelled"],
      crm_task_type: ["call", "meeting", "followup", "internal"],
      flow_lifecycle_status: [
        "draft",
        "validated",
        "active",
        "paused",
        "error",
      ],
      genesis_plan: ["free", "starter", "professional", "enterprise"],
      genesis_role: ["super_admin", "admin", "user"],
      pix_type: ["cpf", "cnpj", "email", "phone", "random"],
      proposal_status: ["draft", "sent", "accepted", "cancelled"],
      referral_status: ["pending", "confirmed", "cancelled", "paid"],
      withdrawal_status: ["pending", "processing", "completed", "rejected"],
    },
  },
} as const
