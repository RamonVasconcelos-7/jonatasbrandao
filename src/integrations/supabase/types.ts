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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      advogado_empresas: {
        Row: {
          advogado_id: string
          empresa_id: string
        }
        Insert: {
          advogado_id: string
          empresa_id: string
        }
        Update: {
          advogado_id?: string
          empresa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advogado_empresas_advogado_id_fkey"
            columns: ["advogado_id"]
            isOneToOne: false
            referencedRelation: "advogados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advogado_empresas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      advogados: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          oab: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          oab?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          oab?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      areas: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      empresas: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["empresa_tipo"]
        }
        Insert: {
          cor?: string
          created_at?: string
          id?: string
          nome: string
          tipo?: Database["public"]["Enums"]["empresa_tipo"]
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["empresa_tipo"]
        }
        Relationships: []
      }
      movimentacoes: {
        Row: {
          created_at: string
          data: string
          descricao: string
          id: string
          processo_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          descricao: string
          id?: string
          processo_id: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          processo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      prazos: {
        Row: {
          created_at: string
          cumprido: boolean
          data: string
          descricao: string | null
          id: string
          notificado_0d: boolean
          notificado_1d: boolean
          notificado_3d: boolean
          processo_id: string
          tipo: Database["public"]["Enums"]["tipo_prazo"]
        }
        Insert: {
          created_at?: string
          cumprido?: boolean
          data: string
          descricao?: string | null
          id?: string
          notificado_0d?: boolean
          notificado_1d?: boolean
          notificado_3d?: boolean
          processo_id: string
          tipo?: Database["public"]["Enums"]["tipo_prazo"]
        }
        Update: {
          created_at?: string
          cumprido?: boolean
          data?: string
          descricao?: string | null
          id?: string
          notificado_0d?: boolean
          notificado_1d?: boolean
          notificado_3d?: boolean
          processo_id?: string
          tipo?: Database["public"]["Enums"]["tipo_prazo"]
        }
        Relationships: [
          {
            foreignKeyName: "prazos_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      processos: {
        Row: {
          advogado_id: string | null
          area_id: string | null
          classe: string | null
          created_at: string
          data_audiencia: string | null
          data_autuacao: string | null
          empresa_id: string | null
          id: string
          numero: string
          observacoes: string | null
          parte_contraria: string | null
          status: Database["public"]["Enums"]["processo_status"]
          ultima_movimentacao_data: string | null
          ultima_movimentacao_texto: string | null
          updated_at: string
          valor_acao: number | null
          vara: string | null
        }
        Insert: {
          advogado_id?: string | null
          area_id?: string | null
          classe?: string | null
          created_at?: string
          data_audiencia?: string | null
          data_autuacao?: string | null
          empresa_id?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          parte_contraria?: string | null
          status?: Database["public"]["Enums"]["processo_status"]
          ultima_movimentacao_data?: string | null
          ultima_movimentacao_texto?: string | null
          updated_at?: string
          valor_acao?: number | null
          vara?: string | null
        }
        Update: {
          advogado_id?: string | null
          area_id?: string | null
          classe?: string | null
          created_at?: string
          data_audiencia?: string | null
          data_autuacao?: string | null
          empresa_id?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          parte_contraria?: string | null
          status?: Database["public"]["Enums"]["processo_status"]
          ultima_movimentacao_data?: string | null
          ultima_movimentacao_texto?: string | null
          updated_at?: string
          valor_acao?: number | null
          vara?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_advogado_id_fkey"
            columns: ["advogado_id"]
            isOneToOne: false
            referencedRelation: "advogados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
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
      set_admin_role: {
        Args: { _is_admin: boolean; _target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "advogado"
      empresa_tipo: "Escritorio" | "Empresa" | "Prefeitura"
      processo_status: "Aguardando" | "Em Progresso" | "Concluído"
      tipo_prazo:
        | "Audiencia"
        | "Manifestacao_Parte_Contraria"
        | "Aguardando_Sentenca_Decisao"
        | "Contestacao"
        | "Replica_Impugnacao"
        | "Recurso_Apelacao"
        | "Contrarrazoes"
        | "Embargos_Declaracao"
        | "Cumprimento_Sentenca"
        | "Prazo_Interno_Escritorio"
        | "Diligencia"
        | "Pericia"
        | "Outro"
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
      app_role: ["admin", "advogado"],
      empresa_tipo: ["Escritorio", "Empresa", "Prefeitura"],
      processo_status: ["Aguardando", "Em Progresso", "Concluído"],
      tipo_prazo: [
        "Audiencia",
        "Manifestacao_Parte_Contraria",
        "Aguardando_Sentenca_Decisao",
        "Contestacao",
        "Replica_Impugnacao",
        "Recurso_Apelacao",
        "Contrarrazoes",
        "Embargos_Declaracao",
        "Cumprimento_Sentenca",
        "Prazo_Interno_Escritorio",
        "Diligencia",
        "Pericia",
        "Outro",
      ],
    },
  },
} as const
