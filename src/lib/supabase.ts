import { createClient } from '@supabase/supabase-js';

type EnvSource = Record<string, string | undefined>;

const DEFAULT_SUPABASE_URL = 'https://xjmzqlilkmbbpkjjpghu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbXpxbGlsa21iYnBrampwZ2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mjg5OTUsImV4cCI6MjA3ODIwNDk5NX0.y7AVIOQvJyWwuJPEEZjxXom4GlrDIwHkDj3dYjfNlw0';

const runtimeEnv: EnvSource = (() => {
  const sources: EnvSource[] = [];

  if (typeof import.meta !== 'undefined' && typeof (import.meta as any).env !== 'undefined') {
    sources.push((import.meta as any).env);
  }

  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    sources.push(process.env as EnvSource);
  }

  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    sources.push((window as any).__ENV__);
  }

  return Object.assign({}, ...sources);
})();

const resolveEnv = (key: string): string => (runtimeEnv[key] ?? '').toString().trim();

const resolvedSupabaseUrl =
  resolveEnv('VITE_SUPABASE_URL') || resolveEnv('SUPABASE_URL') || DEFAULT_SUPABASE_URL;
const resolvedSupabaseAnonKey =
  resolveEnv('VITE_SUPABASE_ANON_KEY') || resolveEnv('SUPABASE_ANON_KEY') || DEFAULT_SUPABASE_ANON_KEY;

const SUPABASE_CONFIGURED =
  resolvedSupabaseUrl !== DEFAULT_SUPABASE_URL || resolvedSupabaseAnonKey !== DEFAULT_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:', {
  hasUrl: resolvedSupabaseUrl ? '✅ URL set' : '❌ URL missing',
  hasKey: resolvedSupabaseAnonKey ? '✅ Key set' : '❌ Key missing',
  configured: SUPABASE_CONFIGURED
    ? '✅ Using environment Supabase credentials'
    : 'ℹ️ Using default Supabase credentials',
});

export const supabase = createClient(resolvedSupabaseUrl.replace(/\/+$/, ''), resolvedSupabaseAnonKey);

export const isSupabaseConfigured = () => SUPABASE_CONFIGURED;

export interface ServicePlan {
  id: string;
  name: string;
  price: number;
  popular: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  _fromDatabase?: boolean;
}

export interface Device {
  id: string;
  name: string;
  os: string;
  supports_5g: boolean;
  supports_esim: boolean;
  price: number | null;
  image_url: string | null;
  devices_pics_url: string | null;
  created_at: string;
  updated_at: string;
  is_available: boolean;
  _fromDatabase?: boolean;
}

export interface Tower {
  id: string;
  region: string;
  health: 'ok' | 'degraded';
  lat: number;
  lng: number;
  tower_id?: string;
  network_happiness_score?: number;
  eta_minutes?: number | null;
  sparkline?: number[];
  _fromDatabase?: boolean;
}

export interface StatusSnapshot {
  id: string;
  session_id: string | null;
  region: string;
  tower_id: string | null;
  health: string;
  eta_minutes: number | null;
  network_happiness_score: number | null;
  sparkline: number[] | null;
  source_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

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

export const preferencesOperations = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && 'code' in error && error.code !== 'PGRST116') {
      throw error;
    }

    return (data as UserPreferences) ?? null;
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
