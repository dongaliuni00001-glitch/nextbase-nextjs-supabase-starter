export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };

  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string;
          id: string;
          is_personal: boolean;
          name: string;
          primary_owner_id: string | null;
          slug: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_personal?: boolean;
          name: string;
          primary_owner_id?: string | null;
          slug?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_personal?: boolean;
          name?: string;
          primary_owner_id?: string | null;
          slug?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      content_blog_post_comments: {
        Row: {
          author_id: string;
          blog_post_id: string;
          body: string;
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          blog_post_id: string;
          body: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          blog_post_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_blog_post_comments_blog_post_id_fkey";
            columns: ["blog_post_id"];
            isOneToOne: false;
            referencedRelation: "content_blog_posts";
            referencedColumns: ["id"];
          },
        ];
      };

      content_blog_posts: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          excerpt: string | null;
          id: string;
          is_published: boolean;
          published_at: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          is_published?: boolean;
          published_at?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          is_published?: boolean;
          published_at?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      job_postings: {
        Row: {
          application_method: string | null;
          company: string | null;
          company_name: string | null;
          content: string | null;
          created_at: string;
          deadline: string | null;
          extracted_text: string | null;
          file_names: string[] | null;
          file_urls: string[] | null;
          id: string;
          job_description: string | null;
          job_title: string | null;
          title: string | null;
          user_id: string | null;
        };
        Insert: {
          application_method?: string | null;
          company?: string | null;
          company_name?: string | null;
          content?: string | null;
          created_at?: string;
          deadline?: string | null;
          extracted_text?: string | null;
          file_names?: string[] | null;
          file_urls?: string[] | null;
          id?: string;
          job_description?: string | null;
          job_title?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Update: {
          application_method?: string | null;
          company?: string | null;
          company_name?: string | null;
          content?: string | null;
          created_at?: string;
          deadline?: string | null;
          extracted_text?: string | null;
          file_names?: string[] | null;
          file_urls?: string[] | null;
          id?: string;
          job_description?: string | null;
          job_title?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };

      memberships: {
        Row: {
          account_id: string;
          created_at: string;
          id: string;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          id?: string;
          role?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          id?: string;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memberships_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };

      private_items: {
        Row: {
          body: string | null;
          created_at: string;
          description: string;
          id: string;
          name: string;
          owner_id: string | null;
          title: string | null;
          user_id: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          description: string;
          id?: string;
          name: string;
          owner_id?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          owner_id?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };

      profiles: {
        Row: {
          age: number | null;
          avatar_url: string | null;
          birth_date: string | null;
          birth_type: string | null;
          career_summary: string | null;
          certifications: string | null;
          created_at: string;
          desired_industry: string | null;
          desired_location: string | null;
          desired_role: string | null;
          email: string | null;
          full_name: string | null;
          gender: string | null;
          id: string;
          major: string | null;
          military_service: string | null;
          portfolio_url: string | null;
          portfolios: Json | null;
          role: string | null;
          status: string | null;
          university: string | null;
          updated_at: string | null;
        };
        Insert: {
          age?: number | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          birth_type?: string | null;
          career_summary?: string | null;
          certifications?: string | null;
          created_at?: string;
          desired_industry?: string | null;
          desired_location?: string | null;
          desired_role?: string | null;
          email?: string | null;
          full_name?: string | null;
          gender?: string | null;
          id: string;
          major?: string | null;
          military_service?: string | null;
          portfolio_url?: string | null;
          portfolios?: Json | null;
          role?: string | null;
          status?: string | null;
          university?: string | null;
          updated_at?: string | null;
        };
        Update: {
          age?: number | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          birth_type?: string | null;
          career_summary?: string | null;
          certifications?: string | null;
          created_at?: string;
          desired_industry?: string | null;
          desired_location?: string | null;
          desired_role?: string | null;
          email?: string | null;
          full_name?: string | null;
          gender?: string | null;
          id?: string;
          major?: string | null;
          military_service?: string | null;
          portfolio_url?: string | null;
          portfolios?: Json | null;
          role?: string | null;
          status?: string | null;
          university?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      projects: {
        Row: {
          created_at: string;
          description: string | null;
          file_names: string[] | null;
          file_url: string | null;
          file_urls: string[] | null;
          id: string;
          role: string | null;
          tech_stack: string | null;
          title: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          file_names?: string[] | null;
          file_url?: string | null;
          file_urls?: string[] | null;
          id?: string;
          role?: string | null;
          tech_stack?: string | null;
          title: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          file_names?: string[] | null;
          file_url?: string | null;
          file_urls?: string[] | null;
          id?: string;
          role?: string | null;
          tech_stack?: string | null;
          title?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };

      resume_files: {
        Row: {
          created_at: string;
          file_name: string;
          file_size: number | null;
          id: string;
          mime_type: string | null;
          resume_id: string;
          storage_path: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          file_name: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          resume_id: string;
          storage_path?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          file_name?: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          resume_id?: string;
          storage_path?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resume_files_resume_id_fkey";
            columns: ["resume_id"];
            isOneToOne: false;
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };

      resumes: {
        Row: {
          company: string | null;
          content: string;
          created_at: string;
          id: string;
          linked_projects: string[];
          position: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          company?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          linked_projects?: string[];
          position?: string | null;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          company?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          linked_projects?: string[];
          position?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
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

type DefaultSchema = DatabaseWithoutInternals[
  Extract<keyof Database, "public">
];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (
        DatabaseWithoutInternals[
          DefaultSchemaTableNameOrOptions["schema"]
        ]["Tables"] &
          DatabaseWithoutInternals[
            DefaultSchemaTableNameOrOptions["schema"]
          ]["Views"]
      )
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (
      DatabaseWithoutInternals[
        DefaultSchemaTableNameOrOptions["schema"]
      ]["Tables"] &
        DatabaseWithoutInternals[
          DefaultSchemaTableNameOrOptions["schema"]
        ]["Views"]
    )[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (
        DefaultSchema["Tables"] & DefaultSchema["Views"]
      )
    ? (
        DefaultSchema["Tables"] & DefaultSchema["Views"]
      )[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
        DefaultSchemaTableNameOrOptions["schema"]
      ]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[
      DefaultSchemaTableNameOrOptions["schema"]
    ]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][
        DefaultSchemaTableNameOrOptions
      ] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
        DefaultSchemaTableNameOrOptions["schema"]
      ]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[
      DefaultSchemaTableNameOrOptions["schema"]
    ]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DatabaseWithoutInternals[
        "public"
      ]["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
        DefaultSchemaTableNameOrOptions["schema"]
      ]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[
      DefaultSchemaEnumNameOrOptions["schema"]
    ]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
        PublicCompositeTypeNameOrOptions["schema"]
      ]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[
      PublicCompositeTypeNameOrOptions["schema"]
    ]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema[
      "CompositeTypes"
    ]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;