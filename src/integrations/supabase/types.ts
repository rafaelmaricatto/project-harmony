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
      departments: {
        Row: {
          code: string
          cost_center: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          cost_center?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          cost_center?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      levels: {
        Row: {
          base_salary: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          position_id: string
          ppr_index: number | null
          updated_at: string
        }
        Insert: {
          base_salary: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          position_id: string
          ppr_index?: number | null
          updated_at?: string
        }
        Update: {
          base_salary?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          position_id?: string
          ppr_index?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "levels_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      person_department_allocations: {
        Row: {
          allocated_cost: number | null
          created_at: string
          department_id: string
          id: string
          percentage: number
          person_id: string
          updated_at: string
          year_month: string
        }
        Insert: {
          allocated_cost?: number | null
          created_at?: string
          department_id: string
          id?: string
          percentage: number
          person_id: string
          updated_at?: string
          year_month: string
        }
        Update: {
          allocated_cost?: number | null
          created_at?: string
          department_id?: string
          id?: string
          percentage?: number
          person_id?: string
          updated_at?: string
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_department_allocations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_department_allocations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      person_monthly_costs: {
        Row: {
          base_salary: number
          benefits: number
          charges: number
          created_at: string
          id: string
          is_projected: boolean
          notes: string | null
          other_costs: number
          person_id: string
          proportionality_factor: number | null
          provisions: number
          total_cost: number
          updated_at: string
          year_month: string
        }
        Insert: {
          base_salary?: number
          benefits?: number
          charges?: number
          created_at?: string
          id?: string
          is_projected?: boolean
          notes?: string | null
          other_costs?: number
          person_id: string
          proportionality_factor?: number | null
          provisions?: number
          total_cost?: number
          updated_at?: string
          year_month: string
        }
        Update: {
          base_salary?: number
          benefits?: number
          charges?: number
          created_at?: string
          id?: string
          is_projected?: boolean
          notes?: string | null
          other_costs?: number
          person_id?: string
          proportionality_factor?: number | null
          provisions?: number
          total_cost?: number
          updated_at?: string
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_monthly_costs_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      person_position_history: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          level_id: string
          person_id: string
          position_id: string
          reason: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          level_id: string
          person_id: string
          position_id: string
          reason?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          level_id?: string
          person_id?: string
          position_id?: string
          reason?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_position_history_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_position_history_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_position_history_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      persons: {
        Row: {
          created_at: string
          current_level_id: string | null
          current_position_id: string | null
          full_name: string
          hire_date: string
          id: string
          primary_department_id: string | null
          status: Database["public"]["Enums"]["person_status"]
          supervisor_id: string | null
          termination_date: string | null
          type: Database["public"]["Enums"]["person_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_level_id?: string | null
          current_position_id?: string | null
          full_name: string
          hire_date: string
          id?: string
          primary_department_id?: string | null
          status?: Database["public"]["Enums"]["person_status"]
          supervisor_id?: string | null
          termination_date?: string | null
          type: Database["public"]["Enums"]["person_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_level_id?: string | null
          current_position_id?: string | null
          full_name?: string
          hire_date?: string
          id?: string
          primary_department_id?: string | null
          status?: Database["public"]["Enums"]["person_status"]
          supervisor_id?: string | null
          termination_date?: string | null
          type?: Database["public"]["Enums"]["person_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persons_current_level_id_fkey"
            columns: ["current_level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persons_current_position_id_fkey"
            columns: ["current_position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persons_primary_department_id_fkey"
            columns: ["primary_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persons_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          type: Database["public"]["Enums"]["person_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          type: Database["public"]["Enums"]["person_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: Database["public"]["Enums"]["person_type"]
          updated_at?: string
        }
        Relationships: []
      }
      termination_events: {
        Row: {
          classification: Database["public"]["Enums"]["cost_classification"]
          created_at: string
          description: string | null
          id: string
          person_id: string
          severance_amount: number
          termination_date: string
          termination_type: Database["public"]["Enums"]["termination_type"]
          updated_at: string
        }
        Insert: {
          classification?: Database["public"]["Enums"]["cost_classification"]
          created_at?: string
          description?: string | null
          id?: string
          person_id: string
          severance_amount?: number
          termination_date: string
          termination_type: Database["public"]["Enums"]["termination_type"]
          updated_at?: string
        }
        Update: {
          classification?: Database["public"]["Enums"]["cost_classification"]
          created_at?: string
          description?: string | null
          id?: string
          person_id?: string
          severance_amount?: number
          termination_date?: string
          termination_type?: Database["public"]["Enums"]["termination_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "termination_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      cost_classification: "cost" | "expense"
      person_status: "active" | "inactive"
      person_type: "administrative" | "commercial" | "consulting"
      termination_type:
        | "dismissal"
        | "agreement"
        | "pj_termination"
        | "resignation"
        | "retirement"
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
      cost_classification: ["cost", "expense"],
      person_status: ["active", "inactive"],
      person_type: ["administrative", "commercial", "consulting"],
      termination_type: [
        "dismissal",
        "agreement",
        "pj_termination",
        "resignation",
        "retirement",
      ],
    },
  },
} as const
