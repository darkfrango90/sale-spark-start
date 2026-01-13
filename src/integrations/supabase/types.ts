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
      accounts_receivable: {
        Row: {
          created_at: string | null
          final_amount: number
          id: string
          interest_penalty: number | null
          notes: string | null
          original_amount: number
          receipt_date: string | null
          receipt_url: string | null
          receiving_account_id: string | null
          sale_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          final_amount: number
          id?: string
          interest_penalty?: number | null
          notes?: string | null
          original_amount: number
          receipt_date?: string | null
          receipt_url?: string | null
          receiving_account_id?: string | null
          sale_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          final_amount?: number
          id?: string
          interest_penalty?: number | null
          notes?: string | null
          original_amount?: number
          receipt_date?: string | null
          receipt_url?: string | null
          receiving_account_id?: string | null
          sale_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_receiving_account_id_fkey"
            columns: ["receiving_account_id"]
            isOneToOne: false
            referencedRelation: "receiving_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          active: boolean
          address: string | null
          birth_date: string | null
          cellphone: string | null
          city: string | null
          code: string
          complement: string | null
          cpf_cnpj: string
          created_at: string
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          notes: string | null
          number: string | null
          phone: string | null
          rg_ie: string | null
          state: string | null
          street: string | null
          trade_name: string | null
          type: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          birth_date?: string | null
          cellphone?: string | null
          city?: string | null
          code: string
          complement?: string | null
          cpf_cnpj: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          rg_ie?: string | null
          state?: string | null
          street?: string | null
          trade_name?: string | null
          type: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          birth_date?: string | null
          cellphone?: string | null
          city?: string | null
          code?: string
          complement?: string | null
          cpf_cnpj?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          rg_ie?: string | null
          state?: string | null
          street?: string | null
          trade_name?: string | null
          type?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category: string | null
          code: string
          cost_price: number
          created_at: string
          density: number | null
          description: string | null
          id: string
          min_stock: number
          name: string
          sale_price: number
          stock: number
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          code: string
          cost_price?: number
          created_at?: string
          density?: number | null
          description?: string | null
          id?: string
          min_stock?: number
          name: string
          sale_price?: number
          stock?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          code?: string
          cost_price?: number
          created_at?: string
          density?: number | null
          description?: string | null
          id?: string
          min_stock?: number
          name?: string
          sale_price?: number
          stock?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      receiving_accounts: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          density: number | null
          discount: number
          id: string
          product_code: string
          product_id: string
          product_name: string
          quantity: number
          sale_id: string
          total: number
          unit: string
          unit_price: number
          weight: number | null
        }
        Insert: {
          created_at?: string
          density?: number | null
          discount?: number
          id?: string
          product_code: string
          product_id: string
          product_name: string
          quantity?: number
          sale_id: string
          total?: number
          unit: string
          unit_price?: number
          weight?: number | null
        }
        Update: {
          created_at?: string
          density?: number | null
          discount?: number
          id?: string
          product_code?: string
          product_id?: string
          product_name?: string
          quantity?: number
          sale_id?: string
          total?: number
          unit?: string
          unit_price?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_code: string
          customer_cpf_cnpj: string
          customer_id: string
          customer_name: string
          customer_neighborhood: string | null
          customer_phone: string | null
          customer_state: string | null
          customer_zip_code: string | null
          discount: number
          id: string
          notes: string | null
          number: string
          payment_method_id: string | null
          payment_method_name: string | null
          status: string
          subtotal: number
          total: number
          total_weight: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_code: string
          customer_cpf_cnpj: string
          customer_id: string
          customer_name: string
          customer_neighborhood?: string | null
          customer_phone?: string | null
          customer_state?: string | null
          customer_zip_code?: string | null
          discount?: number
          id?: string
          notes?: string | null
          number: string
          payment_method_id?: string | null
          payment_method_name?: string | null
          status?: string
          subtotal?: number
          total?: number
          total_weight?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_code?: string
          customer_cpf_cnpj?: string
          customer_id?: string
          customer_name?: string
          customer_neighborhood?: string | null
          customer_phone?: string | null
          customer_state?: string | null
          customer_zip_code?: string | null
          discount?: number
          id?: string
          notes?: string | null
          number?: string
          payment_method_id?: string | null
          payment_method_name?: string | null
          status?: string
          subtotal?: number
          total?: number
          total_weight?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_deletions: {
        Row: {
          customer_name: string
          deleted_at: string
          deleted_by: string | null
          id: string
          reason: string
          sale_id: string | null
          sale_number: string
          sale_type: string
          total: number
        }
        Insert: {
          customer_name: string
          deleted_at?: string
          deleted_by?: string | null
          id?: string
          reason: string
          sale_id?: string | null
          sale_number: string
          sale_type: string
          total: number
        }
        Update: {
          customer_name?: string
          deleted_at?: string
          deleted_by?: string | null
          id?: string
          reason?: string
          sale_id?: string | null
          sale_number?: string
          sale_type?: string
          total?: number
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
    Enums: {},
  },
} as const
