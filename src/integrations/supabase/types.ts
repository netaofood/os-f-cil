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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string | null
          cor: string
          created_at: string
          data_hora: string
          duracao_minutos: number
          empresa_id: string
          id: string
          observacoes: string | null
          servico: string | null
          status: Database["public"]["Enums"]["status_agendamento"]
        }
        Insert: {
          cliente_id?: string | null
          cor?: string
          created_at?: string
          data_hora: string
          duracao_minutos?: number
          empresa_id: string
          id?: string
          observacoes?: string | null
          servico?: string | null
          status?: Database["public"]["Enums"]["status_agendamento"]
        }
        Update: {
          cliente_id?: string | null
          cor?: string
          created_at?: string
          data_hora?: string
          duracao_minutos?: number
          empresa_id?: string
          id?: string
          observacoes?: string | null
          servico?: string | null
          status?: Database["public"]["Enums"]["status_agendamento"]
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cidade: string | null
          cpf: string | null
          created_at: string
          email: string | null
          empresa_id: string
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
        }
        Insert: {
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          empresa_id: string
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
        }
        Update: {
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          banco: string | null
          cidade: string | null
          cnpj: string | null
          cor_destaque: string
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          logo_url: string | null
          nome: string
          pix: string | null
          telefone: string | null
        }
        Insert: {
          banco?: string | null
          cidade?: string | null
          cnpj?: string | null
          cor_destaque?: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          pix?: string | null
          telefone?: string | null
        }
        Update: {
          banco?: string | null
          cidade?: string | null
          cnpj?: string | null
          cor_destaque?: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          pix?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      faturas: {
        Row: {
          assinatura_url: string | null
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string
          empresa_id: string
          forma_pagamento: string | null
          id: string
          itens: Json
          link_publico_token: string
          numero: string
          os_id: string | null
          pago_em: string | null
          status: Database["public"]["Enums"]["status_fatura"]
          total: number
          vencimento: string | null
        }
        Insert: {
          assinatura_url?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          empresa_id: string
          forma_pagamento?: string | null
          id?: string
          itens?: Json
          link_publico_token?: string
          numero: string
          os_id?: string | null
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_fatura"]
          total?: number
          vencimento?: string | null
        }
        Update: {
          assinatura_url?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          empresa_id?: string
          forma_pagamento?: string | null
          id?: string
          itens?: Json
          link_publico_token?: string
          numero?: string
          os_id?: string | null
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_fatura"]
          total?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      formas_pagamento: {
        Row: {
          ativo: boolean
          empresa_id: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          empresa_id: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          empresa_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "formas_pagamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_os: {
        Row: {
          descricao: string
          id: string
          os_id: string
          preco_unitario: number
          quantidade: number
          total: number
        }
        Insert: {
          descricao: string
          id?: string
          os_id: string
          preco_unitario?: number
          quantidade?: number
          total?: number
        }
        Update: {
          descricao?: string
          id?: string
          os_id?: string
          preco_unitario?: number
          quantidade?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_os_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      log_os: {
        Row: {
          campo_alterado: string
          created_at: string
          id: string
          os_id: string
          usuario_id: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          campo_alterado: string
          created_at?: string
          id?: string
          os_id: string
          usuario_id?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          campo_alterado?: string
          created_at?: string
          id?: string
          os_id?: string
          usuario_id?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "log_os_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_os_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cliente_id: string | null
          created_at: string
          criado_por: string | null
          diagnostico: string | null
          empresa_id: string
          forma_pagamento: string | null
          id: string
          numero: string
          observacoes: string | null
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          criado_por?: string | null
          diagnostico?: string | null
          empresa_id: string
          forma_pagamento?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          criado_por?: string | null
          diagnostico?: string | null
          empresa_id?: string
          forma_pagamento?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          created_at: string
          empresa_id: string
          id: string
          nome: string
          preco: number
          tipo: Database["public"]["Enums"]["tipo_produto"]
          unidade: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          empresa_id: string
          id?: string
          nome: string
          preco?: number
          tipo?: Database["public"]["Enums"]["tipo_produto"]
          unidade?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string
          id?: string
          nome?: string
          preco?: number
          tipo?: Database["public"]["Enums"]["tipo_produto"]
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      status_os: {
        Row: {
          cor: string
          created_at: string
          empresa_id: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          cor?: string
          created_at?: string
          empresa_id: string
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          cor?: string
          created_at?: string
          empresa_id?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "status_os_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean
          auth_user_id: string
          celular: string | null
          created_at: string
          email: string | null
          empresa_id: string | null
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
        }
        Insert: {
          ativo?: boolean
          auth_user_id: string
          celular?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
        }
        Update: {
          ativo?: boolean
          auth_user_id?: string
          celular?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_empresa_id: { Args: never; Returns: string }
      current_perfil: {
        Args: never
        Returns: Database["public"]["Enums"]["perfil_usuario"]
      }
      is_admin_or_super: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      same_empresa: { Args: { _empresa_id: string }; Returns: boolean }
    }
    Enums: {
      perfil_usuario: "super_admin" | "admin" | "colaborador"
      status_agendamento:
        | "agendado"
        | "confirmado"
        | "andamento"
        | "concluido"
        | "cancelado"
      status_fatura: "pendente" | "pago" | "vencido" | "cancelado"
      tipo_produto: "produto" | "servico"
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
      perfil_usuario: ["super_admin", "admin", "colaborador"],
      status_agendamento: [
        "agendado",
        "confirmado",
        "andamento",
        "concluido",
        "cancelado",
      ],
      status_fatura: ["pendente", "pago", "vencido", "cancelado"],
      tipo_produto: ["produto", "servico"],
    },
  },
} as const
