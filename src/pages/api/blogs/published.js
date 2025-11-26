// API endpoint to serve published blog posts for the original HTML news page
import { createClient } from '@supabase/supabase-js';
import { getFeaturedImageUrl } from '@/utils/defaultImage';

export default async function handler(req, res) {
  // Set CORS headers to allow the original HTML page to access this API
  const allowedOrigins = [
    'https://starlifeassurance.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:8000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Allow any localhost/127.0.0.1 origin in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'https://starlifeassurance.vercel.app');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
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

  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase credentials');
      throw new Error('Server configuration error: Missing Supabase credentials');
    }

    // Create server-side Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { limit = 10, offset = 0 } = req.query;
    
    const { data: posts, error } = await supabase
      .from('blogs')
      .select(`
        id,
        article_name,
        article_image,
        meta_description,
        excerpt,
        slug,
        author,
        created_at,
        publish_date,
        is_published
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    // Get all unique author UUIDs
    const authorUUIDs = posts?.filter(post => 
      post.author && post.author.length === 36 && post.author.includes('-')
    ).map(post => post.author) || [];

    // Fetch all authors in one query if there are any UUIDs
    let authorMap = {};
    if (authorUUIDs.length > 0) {
      const { data: authors } = await supabase
        .from('hr_users')
        .select('id, name')
        .in('id', authorUUIDs);
      
      if (authors) {
        authorMap = authors.reduce((acc, author) => {
          acc[author.id] = author.name;
          return acc;
        }, {});
      }
    }

    // Transform the data to include proper author names
    const transformedPosts = posts?.map((post) => {
      // Get author name from map or use default
      const authorName = authorMap[post.author] || post.author || 'StarLife Admin';
      
      // Get the featured image URL (with default fallback)
      const imageUrl = getFeaturedImageUrl(post.article_image);
      
      // Convert relative default image path to absolute URL for external consumption
      const absoluteImageUrl = imageUrl.startsWith('/') 
        ? `${req.headers.origin || process.env.PRODUCTION_URL || 'http://localhost:3000'}${imageUrl}`
        : imageUrl;

      return {
        ...post,
        author_name: authorName,
        article_image: absoluteImageUrl,
        publish_date: post.publish_date || post.created_at // Fallback to created_at if no publish_date
      };
    }) || [];

    res.status(200).json({
      success: true,
      data: transformedPosts,
      total: transformedPosts.length
    });
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}