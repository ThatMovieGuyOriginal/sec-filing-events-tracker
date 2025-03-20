// src/lib/database/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../utils/logger';

// Supabase client singleton
let supabaseClient: SupabaseClient | null = null;

// Create and configure Supabase client
export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.NODE_ENV === 'production'
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.SUPABASE_ANON_KEY;
    
  if (!supabaseUrl || !supabaseKey) {
    logger.error('Missing Supabase credentials');
    throw new Error('Missing Supabase credentials');
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
  
  return supabaseClient;
};

// Query wrapper with error handling and logging
export const executeQuery = async <T>(
  fn: (client: SupabaseClient) => Promise<T>
): Promise<T> => {
  try {
    const supabase = getSupabaseClient();
    return await fn(supabase);
  } catch (error: any) {
    logger.error('Supabase query error:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
};
