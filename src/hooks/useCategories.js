import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// Cache for categories data
let categoriesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to invalidate cache
const invalidateCache = () => {
  categoriesCache = null;
  cacheTimestamp = null;
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Check cache first
      const now = Date.now();
      if (!forceRefresh && categoriesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        setCategories(categoriesCache);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Add post count for each category by checking blogs table
      const categoriesWithCount = await Promise.all(
        data.map(async (category) => {
          const { count, error: countError } = await supabase
            .from('blogs')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          
          return {
            ...category,
            post_count: countError ? 0 : count || 0
          };
        })
      );
      
      // Update cache
      categoriesCache = categoriesWithCount;
      cacheTimestamp = now;
      
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert([categoryData])
        .select();
      
      if (error) throw error;
      
      toast.success('Category created successfully');
      
      // Invalidate cache and refresh
      invalidateCache();
      await fetchCategories(true);
      
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
      return false;
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      toast.success('Category updated successfully');
      
      // Invalidate cache and refresh
      invalidateCache();
      await fetchCategories(true);
      
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      return false;
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (categoryId) => {
    try {
      // Check if category is being used by any blogs
      const { count, error: countError } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);
      
      if (countError) throw countError;
      
      if (count > 0) {
        toast.error(`Cannot delete category. It is being used by ${count} blog post(s).`);
        return false;
      }
      
      // Delete the category
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      toast.success('Category deleted successfully');
      
      // Invalidate cache and refresh
      invalidateCache();
      await fetchCategories(true);
      
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      return false;
    }
  }, [fetchCategories]);

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};