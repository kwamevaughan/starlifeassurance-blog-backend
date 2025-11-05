import { supabaseServer } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = supabaseServer(req, res);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}