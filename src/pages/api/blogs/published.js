// API endpoint to serve published blog posts for the original HTML news page
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  // Set CORS headers to allow the original HTML page to access this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const { data: posts, error } = await supabase
      .from('blogs')
      .select(`
        id,
        article_name,
        article_image,
        meta_description,
        slug,
        author,
        created_at,
        is_published
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    // Transform the data to include proper author names
    const transformedPosts = await Promise.all(posts?.map(async (post) => {
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
      
      return {
        ...post,
        author_name: authorName
      };
    }) || []);

    res.status(200).json({
      success: true,
      data: transformedPosts,
      total: transformedPosts.length
    });
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog posts'
    });
  }
}