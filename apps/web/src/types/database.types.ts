export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      attribute_definitions: {
        Row: {
          archived_at: string | null;
          category_id: number;
          created_at: string;
          id: number;
          is_filterable: boolean;
          is_required: boolean;
          key: string;
          name: string;
          options: Json;
          sort_order: number;
          updated_at: string;
          value_type: string;
        };
        Insert: {
          archived_at?: string | null;
          category_id: number;
          created_at?: string;
          id?: never;
          is_filterable?: boolean;
          is_required?: boolean;
          key: string;
          name: string;
          options?: Json;
          sort_order?: number;
          updated_at?: string;
          value_type: string;
        };
        Update: {
          archived_at?: string | null;
          category_id?: number;
          created_at?: string;
          id?: never;
          is_filterable?: boolean;
          is_required?: boolean;
          key?: string;
          name?: string;
          options?: Json;
          sort_order?: number;
          updated_at?: string;
          value_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attribute_definitions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity_id: string;
          entity_table: string;
          id: number;
          summary: Json;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id: string;
          entity_table: string;
          id?: never;
          summary?: Json;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string;
          entity_table?: string;
          id?: never;
          summary?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      brands: {
        Row: {
          archived_at: string | null;
          created_at: string;
          description: string | null;
          featured: boolean;
          id: number;
          logo_path: string | null;
          name: string;
          published_at: string | null;
          slug: string;
          sort_order: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          featured?: boolean;
          id?: never;
          logo_path?: string | null;
          name: string;
          published_at?: string | null;
          slug: string;
          sort_order?: number;
          status?: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          featured?: boolean;
          id?: never;
          logo_path?: string | null;
          name?: string;
          published_at?: string | null;
          slug?: string;
          sort_order?: number;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          archived_at: string | null;
          created_at: string;
          description: string | null;
          eyebrow: string | null;
          featured: boolean;
          id: number;
          name: string;
          parent_id: number | null;
          published_at: string | null;
          slug: string;
          sort_order: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          eyebrow?: string | null;
          featured?: boolean;
          id?: never;
          name: string;
          parent_id?: number | null;
          published_at?: string | null;
          slug: string;
          sort_order?: number;
          status?: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          eyebrow?: string | null;
          featured?: boolean;
          id?: never;
          name?: string;
          parent_id?: number | null;
          published_at?: string | null;
          slug?: string;
          sort_order?: number;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      collection_products: {
        Row: {
          collection_id: number;
          created_at: string;
          id: number;
          product_id: number;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          collection_id: number;
          created_at?: string;
          id?: never;
          product_id: number;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          collection_id?: number;
          created_at?: string;
          id?: never;
          product_id?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          archived_at: string | null;
          created_at: string;
          description: string | null;
          eyebrow: string | null;
          featured: boolean;
          id: number;
          name: string;
          published_at: string | null;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          eyebrow?: string | null;
          featured?: boolean;
          id?: never;
          name: string;
          published_at?: string | null;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          description?: string | null;
          eyebrow?: string | null;
          featured?: boolean;
          id?: never;
          name?: string;
          published_at?: string | null;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inquiry_events: {
        Row: {
          anonymous_session_hash: string | null;
          campaign: Json;
          catalog_snapshot: Json;
          created_at: string;
          entry_path: string | null;
          event_type: string;
          id: number;
          idempotency_key_hash: string;
          public_id: string;
        };
        Insert: {
          anonymous_session_hash?: string | null;
          campaign?: Json;
          catalog_snapshot?: Json;
          created_at?: string;
          entry_path?: string | null;
          event_type: string;
          id?: never;
          idempotency_key_hash: string;
          public_id: string;
        };
        Update: {
          anonymous_session_hash?: string | null;
          campaign?: Json;
          catalog_snapshot?: Json;
          created_at?: string;
          entry_path?: string | null;
          event_type?: string;
          id?: never;
          idempotency_key_hash?: string;
          public_id?: string;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          archived_at: string | null;
          body_markdown: string;
          created_at: string;
          excerpt: string | null;
          id: number;
          kind: string;
          published_at: string | null;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          body_markdown?: string;
          created_at?: string;
          excerpt?: string | null;
          id?: never;
          kind: string;
          published_at?: string | null;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          body_markdown?: string;
          created_at?: string;
          excerpt?: string | null;
          id?: never;
          kind?: string;
          published_at?: string | null;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_attribute_values: {
        Row: {
          attribute_definition_id: number;
          created_at: string;
          id: number;
          product_id: number;
          updated_at: string;
          value_boolean: boolean | null;
          value_json: Json | null;
          value_number: number | null;
          value_text: string | null;
          variant_id: number | null;
        };
        Insert: {
          attribute_definition_id: number;
          created_at?: string;
          id?: never;
          product_id: number;
          updated_at?: string;
          value_boolean?: boolean | null;
          value_json?: Json | null;
          value_number?: number | null;
          value_text?: string | null;
          variant_id?: number | null;
        };
        Update: {
          attribute_definition_id?: number;
          created_at?: string;
          id?: never;
          product_id?: number;
          updated_at?: string;
          value_boolean?: boolean | null;
          value_json?: Json | null;
          value_number?: number | null;
          value_text?: string | null;
          variant_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_attribute_values_attribute_definition_id_fkey";
            columns: ["attribute_definition_id"];
            isOneToOne: false;
            referencedRelation: "attribute_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_attribute_values_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_attribute_values_variant_product_fkey";
            columns: ["variant_id", "product_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id", "product_id"];
          },
        ];
      };
      product_media: {
        Row: {
          alt_text: string;
          archived_at: string | null;
          byte_size: number;
          created_at: string;
          focal_x: number;
          focal_y: number;
          height: number;
          id: number;
          is_primary: boolean;
          mime_type: string;
          product_id: number;
          public_path: string | null;
          rights_status: string;
          sort_order: number;
          source_path: string;
          updated_at: string;
          variant_id: number | null;
          width: number;
        };
        Insert: {
          alt_text: string;
          archived_at?: string | null;
          byte_size: number;
          created_at?: string;
          focal_x?: number;
          focal_y?: number;
          height: number;
          id?: never;
          is_primary?: boolean;
          mime_type: string;
          product_id: number;
          public_path?: string | null;
          rights_status?: string;
          sort_order?: number;
          source_path: string;
          updated_at?: string;
          variant_id?: number | null;
          width: number;
        };
        Update: {
          alt_text?: string;
          archived_at?: string | null;
          byte_size?: number;
          created_at?: string;
          focal_x?: number;
          focal_y?: number;
          height?: number;
          id?: never;
          is_primary?: boolean;
          mime_type?: string;
          product_id?: number;
          public_path?: string | null;
          rights_status?: string;
          sort_order?: number;
          source_path?: string;
          updated_at?: string;
          variant_id?: number | null;
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_media_variant_product_fkey";
            columns: ["variant_id", "product_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id", "product_id"];
          },
        ];
      };
      product_variants: {
        Row: {
          archived_at: string | null;
          availability: string;
          created_at: string;
          id: number;
          name: string;
          price: number | null;
          price_mode: string | null;
          product_id: number;
          sku: string;
          sort_order: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          availability?: string;
          created_at?: string;
          id?: never;
          name: string;
          price?: number | null;
          price_mode?: string | null;
          product_id: number;
          sku: string;
          sort_order?: number;
          status?: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          availability?: string;
          created_at?: string;
          id?: never;
          name?: string;
          price?: number | null;
          price_mode?: string | null;
          product_id?: number;
          sku?: string;
          sort_order?: number;
          status?: string;
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
          archived_at: string | null;
          availability: string;
          brand_id: number | null;
          category_id: number;
          created_at: string;
          currency: string;
          description: string | null;
          eyebrow: string | null;
          featured: boolean;
          id: number;
          model_number: string;
          name: string;
          price: number | null;
          price_mode: string;
          published_at: string | null;
          search_vector: unknown;
          short_description: string | null;
          sku: string;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          availability?: string;
          brand_id?: number | null;
          category_id: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          eyebrow?: string | null;
          featured?: boolean;
          id?: never;
          model_number: string;
          name: string;
          price?: number | null;
          price_mode?: string;
          published_at?: string | null;
          search_vector?: unknown;
          short_description?: string | null;
          sku: string;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          availability?: string;
          brand_id?: number | null;
          category_id?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          eyebrow?: string | null;
          featured?: boolean;
          id?: never;
          model_number?: string;
          name?: string;
          price?: number | null;
          price_mode?: string;
          published_at?: string | null;
          search_vector?: unknown;
          short_description?: string | null;
          sku?: string;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
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
          created_at: string;
          display_name: string | null;
          id: string;
          role: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          role?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          business_hours: Json | null;
          delivery_available: boolean;
          full_address: string | null;
          id: boolean;
          location_label: string;
          phone_number: string | null;
          public_email: string | null;
          updated_at: string;
          whatsapp_number: string;
        };
        Insert: {
          business_hours?: Json | null;
          delivery_available?: boolean;
          full_address?: string | null;
          id?: boolean;
          location_label?: string;
          phone_number?: string | null;
          public_email?: string | null;
          updated_at?: string;
          whatsapp_number?: string;
        };
        Update: {
          business_hours?: Json | null;
          delivery_available?: boolean;
          full_address?: string | null;
          id?: boolean;
          location_label?: string;
          phone_number?: string | null;
          public_email?: string | null;
          updated_at?: string;
          whatsapp_number?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      save_product_attribute_values: {
        Args: { p_product_id: number; p_values: Json };
        Returns: undefined;
      };
      set_product_primary_media: {
        Args: { p_media_id: number; p_product_id: number };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
