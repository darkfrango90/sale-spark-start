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
      accounts_payable: {
        Row: {
          competence_date: string
          created_at: string | null
          due_date: string
          final_amount: number
          id: string
          installment_number: number | null
          interest_penalty: number | null
          invoice_number: string | null
          notes: string | null
          original_amount: number
          paying_account_id: string | null
          payment_date: string | null
          payment_type: string
          status: string | null
          supplier_code: string
          supplier_id: string
          supplier_name: string
          total_installments: number | null
          updated_at: string | null
        }
        Insert: {
          competence_date: string
          created_at?: string | null
          due_date: string
          final_amount: number
          id?: string
          installment_number?: number | null
          interest_penalty?: number | null
          invoice_number?: string | null
          notes?: string | null
          original_amount: number
          paying_account_id?: string | null
          payment_date?: string | null
          payment_type: string
          status?: string | null
          supplier_code: string
          supplier_id: string
          supplier_name: string
          total_installments?: number | null
          updated_at?: string | null
        }
        Update: {
          competence_date?: string
          created_at?: string | null
          due_date?: string
          final_amount?: number
          id?: string
          installment_number?: number | null
          interest_penalty?: number | null
          invoice_number?: string | null
          notes?: string | null
          original_amount?: number
          paying_account_id?: string | null
          payment_date?: string | null
          payment_type?: string
          status?: string | null
          supplier_code?: string
          supplier_id?: string
          supplier_name?: string
          total_installments?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_paying_account_id_fkey"
            columns: ["paying_account_id"]
            isOneToOne: false
            referencedRelation: "receiving_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          confirmed_by: string | null
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
          confirmed_by?: string | null
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
          confirmed_by?: string | null
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
      app_users: {
        Row: {
          access_code: string
          active: boolean | null
          cpf: string
          created_at: string | null
          id: string
          name: string
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          access_code: string
          active?: boolean | null
          cpf: string
          created_at?: string | null
          id?: string
          name: string
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          access_code?: string
          active?: boolean | null
          cpf?: string
          created_at?: string | null
          id?: string
          name?: string
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: []
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
          barter_credit: number | null
          barter_limit: number | null
          barter_notes: string | null
          birth_date: string | null
          cellphone: string | null
          city: string | null
          code: string
          complement: string | null
          cpf_cnpj: string
          created_at: string
          email: string | null
          has_barter: boolean | null
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
          barter_credit?: number | null
          barter_limit?: number | null
          barter_notes?: string | null
          birth_date?: string | null
          cellphone?: string | null
          city?: string | null
          code: string
          complement?: string | null
          cpf_cnpj: string
          created_at?: string
          email?: string | null
          has_barter?: boolean | null
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
          barter_credit?: number | null
          barter_limit?: number | null
          barter_notes?: string | null
          birth_date?: string | null
          cellphone?: string | null
          city?: string | null
          code?: string
          complement?: string | null
          cpf_cnpj?: string
          created_at?: string
          email?: string | null
          has_barter?: boolean | null
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
      daily_reports: {
        Row: {
          created_at: string
          customer_name: string
          freight_value: number
          id: string
          km_final: number
          km_initial: number
          observation: string | null
          order_number: string
          signature: string
          user_id: string
          user_name: string
          vehicle_plate: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          freight_value?: number
          id?: string
          km_final: number
          km_initial: number
          observation?: string | null
          order_number: string
          signature: string
          user_id: string
          user_name: string
          vehicle_plate: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          freight_value?: number
          id?: string
          km_final?: number
          km_initial?: number
          observation?: string | null
          order_number?: string
          signature?: string
          user_id?: string
          user_name?: string
          vehicle_plate?: string
        }
        Relationships: []
      }
      driver_expenses: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          location_equipment: string
          receipt_image_url: string | null
          user_id: string
          user_name: string
          vehicle_plate: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          location_equipment: string
          receipt_image_url?: string | null
          user_id: string
          user_name: string
          vehicle_plate: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          location_equipment?: string
          receipt_image_url?: string | null
          user_id?: string
          user_name?: string
          vehicle_plate?: string
        }
        Relationships: []
      }
      fuel_entries: {
        Row: {
          created_at: string
          date: string
          fuel_type: string
          id: string
          liters: number
          notes: string | null
          odometer_value: number
          operator_name: string | null
          price_per_liter: number | null
          receipt_url: string | null
          total_cost: number | null
          user_id: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          fuel_type: string
          id?: string
          liters: number
          notes?: string | null
          odometer_value: number
          operator_name?: string | null
          price_per_liter?: number | null
          receipt_url?: string | null
          total_cost?: number | null
          user_id?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          date?: string
          fuel_type?: string
          id?: string
          liters?: number
          notes?: string | null
          odometer_value?: number
          operator_name?: string | null
          price_per_liter?: number | null
          receipt_url?: string | null
          total_cost?: number | null
          user_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_entries_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_reports: {
        Row: {
          created_at: string
          id: string
          problem_description: string
          resolution_date: string | null
          resolved_by: string | null
          status: string
          updated_at: string
          user_id: string
          user_name: string
          vehicle_plate: string
        }
        Insert: {
          created_at?: string
          id?: string
          problem_description: string
          resolution_date?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          user_name: string
          vehicle_plate: string
        }
        Update: {
          created_at?: string
          id?: string
          problem_description?: string
          resolution_date?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          user_name?: string
          vehicle_plate?: string
        }
        Relationships: []
      }
      operator_checklists: {
        Row: {
          alarme_re: string
          ar_condicionado: string
          articulacao_central: string
          buzina: string
          cabo_conexao_balanca: string
          cacamba_estado: string
          calibracao_balanca: string
          cilindros_hidraulicos: string
          cintos_seguranca: string
          comandos_operacionais: string
          created_at: string
          dentes_cacamba: string
          display_balanca: string
          equipment_id: string
          espelhos_retrovisores: string
          extintor: string
          filtro_ar_limpo: string
          freios: string
          has_repairs_needed: boolean | null
          id: string
          limpador_parabrisa: string
          luzes_funcionando: string
          mangueiras_hidraulicas: string
          nivel_liquido_arrefecimento: string
          nivel_oleo_hidraulico: string
          nivel_oleo_motor: string
          parafusos_rodas: string
          pinos_buchas: string
          pneus_calibragem: string
          pneus_estado: string
          sensores_balanca: string
          user_id: string
          user_name: string
          vazamentos_hidraulicos: string
        }
        Insert: {
          alarme_re?: string
          ar_condicionado?: string
          articulacao_central?: string
          buzina?: string
          cabo_conexao_balanca?: string
          cacamba_estado?: string
          calibracao_balanca?: string
          cilindros_hidraulicos?: string
          cintos_seguranca?: string
          comandos_operacionais?: string
          created_at?: string
          dentes_cacamba?: string
          display_balanca?: string
          equipment_id: string
          espelhos_retrovisores?: string
          extintor?: string
          filtro_ar_limpo?: string
          freios?: string
          has_repairs_needed?: boolean | null
          id?: string
          limpador_parabrisa?: string
          luzes_funcionando?: string
          mangueiras_hidraulicas?: string
          nivel_liquido_arrefecimento?: string
          nivel_oleo_hidraulico?: string
          nivel_oleo_motor?: string
          parafusos_rodas?: string
          pinos_buchas?: string
          pneus_calibragem?: string
          pneus_estado?: string
          sensores_balanca?: string
          user_id: string
          user_name: string
          vazamentos_hidraulicos?: string
        }
        Update: {
          alarme_re?: string
          ar_condicionado?: string
          articulacao_central?: string
          buzina?: string
          cabo_conexao_balanca?: string
          cacamba_estado?: string
          calibracao_balanca?: string
          cilindros_hidraulicos?: string
          cintos_seguranca?: string
          comandos_operacionais?: string
          created_at?: string
          dentes_cacamba?: string
          display_balanca?: string
          equipment_id?: string
          espelhos_retrovisores?: string
          extintor?: string
          filtro_ar_limpo?: string
          freios?: string
          has_repairs_needed?: boolean | null
          id?: string
          limpador_parabrisa?: string
          luzes_funcionando?: string
          mangueiras_hidraulicas?: string
          nivel_liquido_arrefecimento?: string
          nivel_oleo_hidraulico?: string
          nivel_oleo_motor?: string
          parafusos_rodas?: string
          pinos_buchas?: string
          pneus_calibragem?: string
          pneus_estado?: string
          sensores_balanca?: string
          user_id?: string
          user_name?: string
          vazamentos_hidraulicos?: string
        }
        Relationships: []
      }
      order_loadings: {
        Row: {
          ai_response: Json | null
          created_at: string
          customer_name: string
          expected_weight_kg: number | null
          id: string
          loaded_at: string
          operator_id: string
          operator_name: string
          sale_id: string
          sale_number: string
          ticket_image_url: string | null
          ticket_weight_kg: number | null
          weight_difference_percent: number | null
          weight_verified: boolean | null
        }
        Insert: {
          ai_response?: Json | null
          created_at?: string
          customer_name: string
          expected_weight_kg?: number | null
          id?: string
          loaded_at?: string
          operator_id: string
          operator_name: string
          sale_id: string
          sale_number: string
          ticket_image_url?: string | null
          ticket_weight_kg?: number | null
          weight_difference_percent?: number | null
          weight_verified?: boolean | null
        }
        Update: {
          ai_response?: Json | null
          created_at?: string
          customer_name?: string
          expected_weight_kg?: number | null
          id?: string
          loaded_at?: string
          operator_id?: string
          operator_name?: string
          sale_id?: string
          sale_number?: string
          ticket_image_url?: string | null
          ticket_weight_kg?: number | null
          weight_difference_percent?: number | null
          weight_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "order_loadings_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
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
      safety_checklists: {
        Row: {
          agua_radiador: string
          buzina: string
          cinto_seguranca: string
          created_at: string
          documentos_veiculo: string
          espelhos_retrovisores: string
          estepe_estado: string
          extintor_incendio: string
          farois_funcionando: string
          fluido_freio: string
          freio_estacionamento: string
          freio_servico: string
          has_repairs_needed: boolean | null
          id: string
          lanternas_funcionando: string
          limpador_parabrisa: string
          limpeza_geral: string
          macaco_chave_roda: string
          oleo_hidraulico: string
          oleo_motor: string
          pneus_calibrados: string
          pneus_estado: string
          setas_funcionando: string
          triangulo_sinalizacao: string
          user_id: string
          user_name: string
          vehicle_plate: string
        }
        Insert: {
          agua_radiador?: string
          buzina?: string
          cinto_seguranca?: string
          created_at?: string
          documentos_veiculo?: string
          espelhos_retrovisores?: string
          estepe_estado?: string
          extintor_incendio?: string
          farois_funcionando?: string
          fluido_freio?: string
          freio_estacionamento?: string
          freio_servico?: string
          has_repairs_needed?: boolean | null
          id?: string
          lanternas_funcionando?: string
          limpador_parabrisa?: string
          limpeza_geral?: string
          macaco_chave_roda?: string
          oleo_hidraulico?: string
          oleo_motor?: string
          pneus_calibrados?: string
          pneus_estado?: string
          setas_funcionando?: string
          triangulo_sinalizacao?: string
          user_id: string
          user_name: string
          vehicle_plate: string
        }
        Update: {
          agua_radiador?: string
          buzina?: string
          cinto_seguranca?: string
          created_at?: string
          documentos_veiculo?: string
          espelhos_retrovisores?: string
          estepe_estado?: string
          extintor_incendio?: string
          farois_funcionando?: string
          fluido_freio?: string
          freio_estacionamento?: string
          freio_servico?: string
          has_repairs_needed?: boolean | null
          id?: string
          lanternas_funcionando?: string
          limpador_parabrisa?: string
          limpeza_geral?: string
          macaco_chave_roda?: string
          oleo_hidraulico?: string
          oleo_motor?: string
          pneus_calibrados?: string
          pneus_estado?: string
          setas_funcionando?: string
          triangulo_sinalizacao?: string
          user_id?: string
          user_name?: string
          vehicle_plate?: string
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
          payment_type: string | null
          seller_name: string | null
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
          payment_type?: string | null
          seller_name?: string | null
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
          payment_type?: string | null
          seller_name?: string | null
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
      suppliers: {
        Row: {
          active: boolean | null
          birth_date: string | null
          cellphone: string | null
          city: string | null
          code: string
          complement: string | null
          cpf_cnpj: string
          created_at: string | null
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
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          active?: boolean | null
          birth_date?: string | null
          cellphone?: string | null
          city?: string | null
          code: string
          complement?: string | null
          cpf_cnpj: string
          created_at?: string | null
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
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          active?: boolean | null
          birth_date?: string | null
          cellphone?: string | null
          city?: string | null
          code?: string
          complement?: string | null
          cpf_cnpj?: string
          created_at?: string | null
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
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          actions: string[]
          id: string
          module: string
          user_id: string
        }
        Insert: {
          actions: string[]
          id?: string
          module: string
          user_id: string
        }
        Update: {
          actions?: string[]
          id?: string
          module?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          active: boolean
          created_at: string
          fuel_type: string
          id: string
          name: string
          plate: string | null
          tank_capacity: number | null
          type: string
          uses_odometer: boolean
        }
        Insert: {
          active?: boolean
          created_at?: string
          fuel_type?: string
          id?: string
          name: string
          plate?: string | null
          tank_capacity?: number | null
          type: string
          uses_odometer?: boolean
        }
        Update: {
          active?: boolean
          created_at?: string
          fuel_type?: string
          id?: string
          name?: string
          plate?: string | null
          tank_capacity?: number | null
          type?: string
          uses_odometer?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "diretor"
        | "gerente"
        | "vendedor"
        | "caixa"
        | "administrativo"
        | "motorista"
        | "operador"
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
      app_role: [
        "diretor",
        "gerente",
        "vendedor",
        "caixa",
        "administrativo",
        "motorista",
        "operador",
      ],
    },
  },
} as const
