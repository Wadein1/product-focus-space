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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          date: string
          id: string
          material_cost: number
          profit: number
          shipping_cost: number
          total_orders: number
          total_sales: number
        }
        Insert: {
          date?: string
          id?: string
          material_cost: number
          profit?: number
          shipping_cost: number
          total_orders?: number
          total_sales?: number
        }
        Update: {
          date?: string
          id?: string
          material_cost?: number
          profit?: number
          shipping_cost?: number
          total_orders?: number
          total_sales?: number
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string | null
          created_at: string
          id: string
          image_path: string | null
          price: number
          product_name: string
          quantity: number | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          price: number
          product_name: string
          quantity?: number | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          price?: number
          product_name?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraiser_age_divisions: {
        Row: {
          created_at: string
          display_order: number
          division_name: string
          fundraiser_id: string
          id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          division_name: string
          fundraiser_id: string
          id?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          division_name?: string
          fundraiser_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraiser_age_divisions_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_summary"
            referencedColumns: ["fundraiser_id"]
          },
          {
            foreignKeyName: "fundraiser_age_divisions_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraisers"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraiser_orders: {
        Row: {
          amount: number
          created_at: string
          donation_amount: number
          fundraiser_id: string
          id: string
          order_id: string | null
          variation_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          donation_amount: number
          fundraiser_id: string
          id?: string
          order_id?: string | null
          variation_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          donation_amount?: number
          fundraiser_id?: string
          id?: string
          order_id?: string | null
          variation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraiser_orders_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_summary"
            referencedColumns: ["fundraiser_id"]
          },
          {
            foreignKeyName: "fundraiser_orders_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fundraiser_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fundraiser_orders_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraiser_teams: {
        Row: {
          age_division_id: string
          created_at: string
          display_order: number
          id: string
          team_name: string
        }
        Insert: {
          age_division_id: string
          created_at?: string
          display_order?: number
          id?: string
          team_name: string
        }
        Update: {
          age_division_id?: string
          created_at?: string
          display_order?: number
          id?: string
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraiser_teams_age_division_id_fkey"
            columns: ["age_division_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_age_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraiser_totals: {
        Row: {
          created_at: string
          donation_amount: number | null
          fundraiser_id: string | null
          id: string
          title: string | null
          total_items_sold: number | null
          total_raised: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          donation_amount?: number | null
          fundraiser_id?: string | null
          id?: string
          title?: string | null
          total_items_sold?: number | null
          total_raised?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          donation_amount?: number | null
          fundraiser_id?: string | null
          id?: string
          title?: string | null
          total_items_sold?: number | null
          total_raised?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraiser_totals_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: true
            referencedRelation: "fundraiser_summary"
            referencedColumns: ["fundraiser_id"]
          },
          {
            foreignKeyName: "fundraiser_totals_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: true
            referencedRelation: "fundraisers"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraiser_transactions: {
        Row: {
          amount: number
          created_at: string
          donation_amount: number
          donation_type: string
          fundraiser_id: string
          id: string
          order_id: string
          quantity: number
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          donation_amount: number
          donation_type: string
          fundraiser_id: string
          id?: string
          order_id: string
          quantity: number
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          donation_amount?: number
          donation_type?: string
          fundraiser_id?: string
          id?: string
          order_id?: string
          quantity?: number
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fundraiser_transactions_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_summary"
            referencedColumns: ["fundraiser_id"]
          },
          {
            foreignKeyName: "fundraiser_transactions_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fundraiser_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraiser_variation_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_path: string
          variation_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_path: string
          variation_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string
          variation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraiser_variation_images_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraiser_variations: {
        Row: {
          created_at: string
          fundraiser_id: string
          id: string
          image_path: string | null
          is_default: boolean
          price: number
          title: string
        }
        Insert: {
          created_at?: string
          fundraiser_id: string
          id?: string
          image_path?: string | null
          is_default?: boolean
          price: number
          title: string
        }
        Update: {
          created_at?: string
          fundraiser_id?: string
          id?: string
          image_path?: string | null
          is_default?: boolean
          price?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraiser_variations_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_summary"
            referencedColumns: ["fundraiser_id"]
          },
          {
            foreignKeyName: "fundraiser_variations_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraisers"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraisers: {
        Row: {
          allow_regular_shipping: boolean | null
          allow_team_shipping: boolean | null
          base_price: number
          created_at: string
          custom_link: string
          description: string | null
          donation_amount: number | null
          donation_percentage: number
          donation_type: string
          id: string
          status: string
          title: string
        }
        Insert: {
          allow_regular_shipping?: boolean | null
          allow_team_shipping?: boolean | null
          base_price: number
          created_at?: string
          custom_link: string
          description?: string | null
          donation_amount?: number | null
          donation_percentage: number
          donation_type?: string
          id?: string
          status?: string
          title: string
        }
        Update: {
          allow_regular_shipping?: boolean | null
          allow_team_shipping?: boolean | null
          base_price?: number
          created_at?: string
          custom_link?: string
          description?: string | null
          donation_amount?: number | null
          donation_percentage?: number
          donation_type?: string
          id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      fundraising_requests: {
        Row: {
          company_name: string
          contact_email: string
          created_at: string
          description: string | null
          id: string
          status: string
        }
        Insert: {
          company_name: string
          contact_email: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
        }
        Update: {
          company_name?: string
          contact_email?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_path: string
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_path: string
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string
          title?: string | null
        }
        Relationships: []
      }
      inventory_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          is_locked: boolean | null
          name: string
          par_level: number
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean | null
          name: string
          par_level?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean | null
          name?: string
          par_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_variations: {
        Row: {
          color: string | null
          created_at: string
          id: string
          item_id: string
          name: string
          order_index: number | null
          par_level: number | null
          quantity: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          item_id: string
          name: string
          order_index?: number | null
          par_level?: number | null
          quantity?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          item_id?: string
          name?: string
          order_index?: number | null
          par_level?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_variations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_images: {
        Row: {
          created_at: string
          id: string
          image_path: string
          order_id: string | null
          quantity: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_path: string
          order_id?: string | null
          quantity?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string
          order_id?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_images_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          age_division: string | null
          cart_id: string | null
          chain_color: string | null
          created_at: string
          customer_email: string
          design_notes: string | null
          first_name: string | null
          fundraiser_id: string | null
          id: string
          image_path: string | null
          is_fundraiser: boolean | null
          last_name: string | null
          order_status: string | null
          pickup_team_name: string | null
          price: number
          product_name: string
          quantity: number
          shipping_address: Json
          shipping_cost: number
          status: string
          stl_file_path: string | null
          tax_amount: number
          team_location: string | null
          team_name: string | null
          total_amount: number
          tracking_number: string | null
          variation_id: string | null
        }
        Insert: {
          age_division?: string | null
          cart_id?: string | null
          chain_color?: string | null
          created_at?: string
          customer_email: string
          design_notes?: string | null
          first_name?: string | null
          fundraiser_id?: string | null
          id?: string
          image_path?: string | null
          is_fundraiser?: boolean | null
          last_name?: string | null
          order_status?: string | null
          pickup_team_name?: string | null
          price: number
          product_name: string
          quantity?: number
          shipping_address: Json
          shipping_cost?: number
          status?: string
          stl_file_path?: string | null
          tax_amount: number
          team_location?: string | null
          team_name?: string | null
          total_amount: number
          tracking_number?: string | null
          variation_id?: string | null
        }
        Update: {
          age_division?: string | null
          cart_id?: string | null
          chain_color?: string | null
          created_at?: string
          customer_email?: string
          design_notes?: string | null
          first_name?: string | null
          fundraiser_id?: string | null
          id?: string
          image_path?: string | null
          is_fundraiser?: boolean | null
          last_name?: string | null
          order_status?: string | null
          pickup_team_name?: string | null
          price?: number
          product_name?: string
          quantity?: number
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          stl_file_path?: string | null
          tax_amount?: number
          team_location?: string | null
          team_name?: string | null
          total_amount?: number
          tracking_number?: string | null
          variation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_summary"
            referencedColumns: ["fundraiser_id"]
          },
          {
            foreignKeyName: "orders_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_carts: {
        Row: {
          created_at: string
          customer_email: string | null
          id: string
          last_activity: string | null
          last_modified: string
          status: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          id?: string
          last_activity?: string | null
          last_modified?: string
          status?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          id?: string
          last_activity?: string | null
          last_modified?: string
          status?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          customer_email: string
          description: string
          id: string
          image_path: string | null
          status: string
          ticket_type: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          description: string
          id?: string
          image_path?: string | null
          status?: string
          ticket_type: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          description?: string
          id?: string
          image_path?: string | null
          status?: string
          ticket_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      fundraiser_summary: {
        Row: {
          description: string | null
          fundraiser_id: string | null
          title: string | null
          total_orders: number | null
          total_raised: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_fundraiser_profit: {
        Args: { fundraiser_id_param: string }
        Returns: number
      }
      calculate_fundraiser_total: {
        Args: { fundraiser_id: string }
        Returns: number
      }
      calculate_fundraiser_totals: {
        Args: { fundraiser_id: string }
        Returns: {
          total_items_sold: number
          total_orders: number
          total_raised: number
        }[]
      }
      cleanup_inactive_carts: { Args: never; Returns: undefined }
      get_fundraiser_stats: {
        Args: { fundraiser_id_param: string }
        Returns: {
          total_items_sold: number
          total_raised: number
        }[]
      }
      get_fundraiser_stats_improved: {
        Args: { fundraiser_id_param: string }
        Returns: {
          total_items_sold: number
          total_orders: number
          total_raised: number
        }[]
      }
      recover_fundraiser_orders: { Args: never; Returns: undefined }
      validate_fundraiser_tracking: {
        Args: never
        Returns: {
          has_tracking: boolean
          is_fundraiser: boolean
          order_id: string
          product_name: string
        }[]
      }
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
