import { createClient } from "@supabase/supabase-js";

// Validate environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

// Debug logging in development
// if (process.env.NODE_ENV === 'development') {
//   console.log('Supabase Admin Config:', {
//     supabaseUrl: supabaseUrl ? '✅ Set' : '❌ Missing',
//     supabaseServiceKey: supabaseServiceKey ? '✅ Set' : '❌ Missing',
//     allEnvVars: {
//       NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
//       SUPABASE_URL: process.env.SUPABASE_URL,
//       SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
//       NEXT_PUBLIC_SUPABASE_SERVICE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
//     }
//   });
// }

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase admin configuration missing!");
  console.error("Required environment variables:", {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✅' : '❌',
    SUPABASE_SERVICE_KEY: supabaseServiceKey ? '✅' : '❌',
  });
  console.error("Available environment variables:", Object.keys(process.env).filter(key => key.includes('SUPABASE')));
  
  throw new Error(
    "Supabase admin configuration missing: Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your environment variables"
  );
}

// Server-side Supabase admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseAdmin; 