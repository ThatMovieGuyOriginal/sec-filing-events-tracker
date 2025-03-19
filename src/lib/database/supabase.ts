// src/lib/database/supabase.ts
import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger';

// Supabase client singleton
let supabaseClient;

// Create and configure Supabase client
export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.NODE_ENV === 'production'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_ANON_KEY;
    
  if (!supabaseUrl || !supabaseKey) {
    logger.error('Missing Supabase credentials');
    throw new Error('Missing Supabase credentials');
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
  
  return supabaseClient;
};

// Query wrapper with error handling and logging
export const executeQuery = async (fn) => {
  try {
    const supabase = getSupabaseClient();
    return await fn(supabase);
  } catch (error) {
    logger.error('Supabase query error:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
};
