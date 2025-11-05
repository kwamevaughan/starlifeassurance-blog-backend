// API endpoint to serve individual blog post by slug
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers to allow the original HTML page to access this API
  const allowedOrigins = [
    'https://starlifeassurance.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://starlifeassurance.vercel.app');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Create server-side Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const { slug } = req.query;
    
    if (!slug) {
      res.status(400).json({ 
        success: false, 
        error: 'Article slug is required' 
      });
      return;
    }

    // Fetch the specific blog post by slug
    const { data: post, error } = await supabase
      .from('blogs')
      .select(`
        id,
        article_name,
        article_body,
        article_image,
        meta_description,
        meta_title,
        slug,
        author,
        created_at,
        updated_at,
        is_published
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        res.status(404).json({
          success: false,
          error: 'Article not found'
        });
        return;
      }
      throw error;
    }

    // Get author name if author field is a UUID
    let authorName = post.author || 'StarLife Admin';
    
    // Check if author field looks like a UUID (if it contains hyphens and is 36 chars)
    if (post.author && post.author.length === 36 && post.author.includes('-')) {
      try {
        // Try to fetch the author name from hr_users table
        const { data: authorData } = await supabase
          .from('hr_users')
          .select('name')
          .eq('id', post.author)
          .single();
        
        if (authorData?.name) {
          authorName = authorData.name;
        }
      } catch (authorError) {
        console.log('Could not fetch author name for UUID:', post.author);
        // Keep the default name
      }
    }

    // Transform the data to include proper author name
    const transformedPost = {
      ...post,
      author_name: authorName
    };

    res.status(200).json({
      success: true,
      data: transformedPost
    });
  } catch (error) {
    console.error('Error fetching blog article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article'
    });
  }
}