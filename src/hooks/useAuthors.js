import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      
      // Fetch users from hr_users table
      const { data: hrUsers, error } = await supabase
        .from('hr_users')
        .select('id, name, username, role')
        .order('name');

      if (error) {
        console.error('Error fetching authors:', error);
        // Fallback to default author
        setAuthors([
          { id: 'default', name: 'Star Assurance Admin', email: 'admin@starassurance.com' }
        ]);
      } else {
        // Transform hr_users data to authors format
        const transformedAuthors = hrUsers.map(user => ({
          id: user.id,
          name: user.name || 'Unknown User',
          email: user.username || 'unknown@hello.com', // username contains email
          username: user.username,
          role: user.role
        }));

        // Add default author if no users found
        if (transformedAuthors.length === 0) {
          transformedAuthors.push({
            id: 'default',
            name: 'Star Assurance Admin',
            email: 'admin@starassurance.com'
          });
        }

        setAuthors(transformedAuthors);
      }
    } catch (error) {
      console.error('Error loading authors:', error);
      // Fallback to default author
      setAuthors([
        { id: 'default', name: 'Star Assurance Admin', email: 'admin@starassurance.com' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const refreshAuthors = async () => {
    await loadAuthors();
  };

  return { authors, loading, refreshAuthors };
};