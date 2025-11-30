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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      fund_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          id: string
          payment_method: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          screenshot_url: string | null
          status: string | null
          transaction_reference: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          screenshot_url?: string | null
          status?: string | null
          transaction_reference?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          screenshot_url?: string | null
          status?: string | null
          transaction_reference?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string | null
          entry_price: number
          entry_time: string | null
          exchange: string
          exit_price: number | null
          exit_time: string | null
          id: string
          profit_loss: number | null
          profit_loss_percent: number | null
          quantity: number
          script_name: string
          status: string | null
          trade_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_price: number
          entry_time?: string | null
          exchange: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          profit_loss?: number | null
          profit_loss_percent?: number | null
          quantity: number
          script_name: string
          status?: string | null
          trade_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_price?: number
          entry_time?: string | null
          exchange?: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          profit_loss?: number | null
          profit_loss_percent?: number | null
          quantity?: number
          script_name?: string
          status?: string | null
          trade_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          aadhaar: string | null
          aadhaar_back_url: string | null
          aadhaar_front_url: string | null
          account_holder_name: string | null
          account_number: string | null
          bank_passbook_url: string | null
          created_at: string | null
          current_balance: number | null
          father_name: string | null
          full_name: string | null
          id: string
          ifsc_code: string | null
          kyc_document_url: string | null
          kyc_status: string | null
          mother_name: string | null
          nominee_name: string | null
          pan: string | null
          pan_card_url: string | null
          passport_url: string | null
          phone: string | null
          profile_image_url: string | null
          total_deposited: number | null
          total_withdrawn: number | null
          updated_at: string | null
          upi_id: string | null
          user_id: string
        }
        Insert: {
          aadhaar?: string | null
          aadhaar_back_url?: string | null
          aadhaar_front_url?: string | null
          account_holder_name?: string | null
          account_number?: string | null
          bank_passbook_url?: string | null
          created_at?: string | null
          current_balance?: number | null
          father_name?: string | null
          full_name?: string | null
          id?: string
          ifsc_code?: string | null
          kyc_document_url?: string | null
          kyc_status?: string | null
          mother_name?: string | null
          nominee_name?: string | null
          pan?: string | null
          pan_card_url?: string | null
          passport_url?: string | null
          phone?: string | null
          profile_image_url?: string | null
          total_deposited?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          upi_id?: string | null
          user_id: string
        }
        Update: {
          aadhaar?: string | null
          aadhaar_back_url?: string | null
          aadhaar_front_url?: string | null
          account_holder_name?: string | null
          account_number?: string | null
          bank_passbook_url?: string | null
          created_at?: string | null
          current_balance?: number | null
          father_name?: string | null
          full_name?: string | null
          id?: string
          ifsc_code?: string | null
          kyc_document_url?: string | null
          kyc_status?: string | null
          mother_name?: string | null
          nominee_name?: string | null
          pan?: string | null
          pan_card_url?: string | null
          passport_url?: string | null
          phone?: string | null
          profile_image_url?: string | null
          total_deposited?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
