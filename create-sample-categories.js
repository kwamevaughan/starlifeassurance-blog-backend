const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createSampleCategories() {
  console.log('🔍 Creating Sample Categories...\n');
  
  const sampleCategories = [
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Latest tech trends, programming, and digital innovations'
    },
    {
      name: 'Business',
      slug: 'business',
      description: 'Business insights, entrepreneurship, and industry news'
    },
    {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Health, wellness, travel, and personal development'
    },
    {
      name: 'Education',
      slug: 'education',
      description: 'Learning resources, tutorials, and educational content'
    },
    {
      name: 'News',
      slug: 'news',
      description: 'Current events and breaking news'
    }
  ];
  
  try {
    // Check if categories already exist
    const { data: existing, error: checkError } = await supabase
      .from('blog_categories')
      .select('*');
    
    if (checkError) {
      console.log('❌ Error checking existing categories:', checkError.message);
      return;
    }
    
    console.log(`Found ${existing.length} existing categories`);
    
    if (existing.length > 0) {
      console.log('Categories already exist:');
      existing.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat.slug})`);
      });
      console.log('\nSkipping creation to avoid duplicates.');
      return;
    }
    
    // Insert sample categories
    console.log('Creating sample categories...');
    
    const { data, error } = await supabase
      .from('blog_categories')
      .insert(sampleCategories)
      .select();
    
    if (error) {
      console.log('❌ Error creating categories:', error.message);
      return;
    }
    
    console.log('✅ Successfully created categories:');
    data.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} (${category.slug})`);
      console.log(`     ID: ${category.id}`);
      console.log(`     Description: ${category.description}`);
    });
    
  } catch (error) {
    console.log('❌ Failed to create sample categories:', error.message);
  }
  
  console.log('\n🏁 Sample categories creation completed!');
}

createSampleCategories().catch(console.error);