export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_access: {
        Row: {
          access_code: string
          created_at: string
          email: string
          id: string
          last_login: string | null
        }
        Insert: {
          access_code: string
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          permissions: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          permissions?: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          permissions?: Json
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          password_hash: string
          role_id: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          password_hash: string
          role_id?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          password_hash?: string
          role_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      fundraiser_orders: {
        Row: {
          amount: number
          created_at: string
          donation_amount: number
          fundraiser_id: string
          id: string
          order_id: string
          variation_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          donation_amount: number
          fundraiser_id: string
          id?: string
          order_id: string
          variation_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          donation_amount?: number
          fundraiser_id?: string
          id?: string
          order_id?: string
          variation_id?: string
        }
        Relationships: [
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
      fundraiser_variations: {
        Row: {
          created_at: string
          fundraiser_id: string
          id: string
          image_path: string | null
          is_default: boolean
          title: string
        }
        Insert: {
          created_at?: string
          fundraiser_id: string
          id?: string
          image_path?: string | null
          is_default?: boolean
          title: string
        }
        Update: {
          created_at?: string
          fundraiser_id?: string
          id?: string
          image_path?: string | null
          is_default?: boolean
          title?: string
        }
        Relationships: [
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
          cart_id: string | null
          created_at: string
          customer_email: string
          design_notes: string | null
          first_name: string | null
          id: string
          image_path: string | null
          is_fundraiser: boolean | null
          last_name: string | null
          order_status: string | null
          price: number
          product_name: string
          shipping_address: Json
          shipping_cost: number
          status: string
          stl_file_path: string | null
          tax_amount: number
          total_amount: number
          tracking_number: string | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string
          customer_email: string
          design_notes?: string | null
          first_name?: string | null
          id?: string
          image_path?: string | null
          is_fundraiser?: boolean | null
          last_name?: string | null
          order_status?: string | null
          price: number
          product_name: string
          shipping_address: Json
          shipping_cost?: number
          status?: string
          stl_file_path?: string | null
          tax_amount: number
          total_amount: number
          tracking_number?: string | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string
          customer_email?: string
          design_notes?: string | null
          first_name?: string | null
          id?: string
          image_path?: string | null
          is_fundraiser?: boolean | null
          last_name?: string | null
          order_status?: string | null
          price?: number
          product_name?: string
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          stl_file_path?: string | null
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      calculate_fundraiser_total: {
        Args: {
          fundraiser_id: string
        }
        Returns: number
      }
      calculate_fundraiser_totals: {
        Args: {
          fundraiser_id: string
        }
        Returns: {
          total_raised: number
          total_orders: number
          total_items_sold: number
        }[]
      }
      cleanup_inactive_carts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
