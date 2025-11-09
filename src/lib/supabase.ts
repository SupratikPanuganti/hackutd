import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  ai_agent_enabled: boolean;
  preferred_language: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
}

// Helper functions for user operations
export const userOperations = {
  async getByClerkId(clerkUserId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) throw error;
    return data as User;
  },

  async create(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  async update(clerkUserId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  async upsert(clerkUserId: string, userData: Partial<User>) {
    try {
      const existing = await this.getByClerkId(clerkUserId);
      return await this.update(clerkUserId, userData);
    } catch {
      return await this.create({ ...userData, clerk_user_id: clerkUserId });
    }
  },
};

// Helper functions for preferences
export const preferencesOperations = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserPreferences | null;
  },

  async upsert(userId: string, preferences: Partial<UserPreferences>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, ...preferences }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data as UserPreferences;
  },
};

// Helper functions for support tickets
export const ticketsOperations = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SupportTicket[];
  },

  async create(ticketData: Partial<SupportTicket>) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticketData])
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  },

  async update(ticketId: string, updates: Partial<SupportTicket>) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data as SupportTicket;
  },
};
