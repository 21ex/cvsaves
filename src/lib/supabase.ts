import { createClient } from '@supabase/supabase-js';

// 1️⃣  These come from .env.local and are exposed to Vite because they start with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// 2️⃣  Create a single client for the whole front-end
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
