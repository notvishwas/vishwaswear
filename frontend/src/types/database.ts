// Mirrors supabase/migrations. Regenerate from a live project with `npm run db:types`
// (see README, "Database setup"). Keep hand edits out of the generated file.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_events: {
        Row: {
          id: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: Database["public"]["Enums"]["order_status"];
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          size: string;
          color: string;
          unit_price_paise: number;
          quantity: number;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          size: string;
          color: string;
          unit_price_paise: number;
          quantity: number;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name?: string;
          size?: string;
          color?: string;
          unit_price_paise?: number;
          quantity?: number;
          image_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          email: string;
          phone: string;
          status: Database["public"]["Enums"]["order_status"];
          subtotal_paise: number;
          shipping_paise: number;
          total_paise: number;
          shipping_address: Json;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          paid_at: string | null;
          payment_issue: string | null;
          idempotency_key: string | null;
          customer_email_sent_at: string | null;
          admin_email_sent_at: string | null;
          shipped_email_sent_at: string | null;
          courier_name: string | null;
          tracking_number: string | null;
          tracking_url: string | null;
          shipped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          email: string;
          phone: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_paise: number;
          shipping_paise?: number;
          total_paise: number;
          shipping_address: Json;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          paid_at?: string | null;
          payment_issue?: string | null;
          idempotency_key?: string | null;
          customer_email_sent_at?: string | null;
          admin_email_sent_at?: string | null;
          shipped_email_sent_at?: string | null;
          courier_name?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          shipped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          email?: string;
          phone?: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_paise?: number;
          shipping_paise?: number;
          total_paise?: number;
          shipping_address?: Json;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          paid_at?: string | null;
          payment_issue?: string | null;
          idempotency_key?: string | null;
          customer_email_sent_at?: string | null;
          admin_email_sent_at?: string | null;
          shipped_email_sent_at?: string | null;
          courier_name?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          shipped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string;
          sku: string;
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          color: string;
          sku: string;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size?: string;
          color?: string;
          sku?: string;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          price_paise: number;
          compare_at_price_paise: number | null;
          fabric: string | null;
          fit: string | null;
          care_instructions: string | null;
          is_active: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          price_paise: number;
          compare_at_price_paise?: number | null;
          fabric?: string | null;
          fit?: string | null;
          care_instructions?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price_paise?: number;
          compare_at_price_paise?: number | null;
          fabric?: string | null;
          fit?: string | null;
          care_instructions?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          source: string;
          welcome_email_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          welcome_email_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          source?: string;
          welcome_email_sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      admin_update_order_status: {
        Args: {
          p_order_id: string;
          p_status: Database["public"]["Enums"]["order_status"];
          p_admin_id?: string;
          p_courier_name?: string;
          p_tracking_number?: string;
          p_tracking_url?: string;
        };
        Returns: string;
      };
      admin_save_product: {
        Args: { p_id: string | null; p_product: Json; p_variants: Json; p_images: Json };
        Returns: string;
      };
      admin_list_customers: {
        Args: { p_search?: string; p_sort?: string; p_dir?: string; p_limit?: number; p_offset?: number };
        Returns: Json;
      };
      admin_dashboard_stats: {
        Args: { p_low_stock_threshold?: number };
        Returns: Json;
      };
      mark_order_paid: {
        Args: { p_razorpay_order_id: string; p_payment_id: string; p_amount_paise?: number };
        Returns: string;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      order_status:
        | "pending_payment"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded";
      user_role: "customer" | "admin";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
