import { supabaseServer } from '@/lib/supabase';

export async function getAdminBlogProps({ req, res }) {
  try {
    // Check authentication
    const supabase = supabaseServer(req, res);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Fetch only the categories data that we need
    const { data: categories, error: categoriesError } = await supabase
      .from('blog_categories')
      .select('id, name, slug')
      .order('name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    return {
      props: {
        categories: categories || [],
        user: {
          id: user.id,
          email: user.email,
          name: user.email
        }
      },
    };
  } catch (error) {
    console.error('Error in getAdminBlogProps:', error);
    
    return {
      props: {
        categories: [],
        user: null
      },
    };
  }
}