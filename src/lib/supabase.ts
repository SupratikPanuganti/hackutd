import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log configuration status on module load
console.log('🔧 Supabase Configuration Check:');
console.log('  - VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Not set');
console.log('  - VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Not set');
console.log('  - Configured:', !!supabaseUrl && !!supabaseAnonKey ? '✅ Yes' : '❌ No');

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  const configured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '';
  console.log('🔍 isSupabaseConfigured() called, result:', configured);
  return configured;
};

// Create Supabase client safely
let supabaseInstance: SupabaseClient;

try {
  if (isSupabaseConfigured()) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    // Create a minimal dummy client - it won't be used since isSupabaseConfigured() returns false
    // But we need something to export to prevent import errors
    supabaseInstance = createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'
    );
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a dummy client as fallback
  supabaseInstance = createClient(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'
  );
}

export const supabase = supabaseInstance;

// Database types
export interface ServicePlan {
  id: string;
  name: string;
  price: number;
  popular: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  _fromDatabase?: boolean; // Internal flag to track data source
}

export interface Device {
  id: string;
  name: string;
  os: string;
  supports_5g: boolean;
  supports_esim: boolean;
  price: number | null;
  image_url: string | null;
  devices_pics_url: string | null; // Device pictures URL from database
  created_at: string;
  updated_at: string;
  is_available: boolean;
  _fromDatabase?: boolean; // Internal flag to track data source
}


