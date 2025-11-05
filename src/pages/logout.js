import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        console.log('Logging out...');
        await supabase.auth.signOut();
        console.log('Logged out successfully');
        
        // Clear any local storage
        localStorage.clear();
        
        // Redirect to login
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if logout fails
        window.location.href = '/login';
      }
    };

    handleLogout();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Logging out...</p>
      </div>
    </div>
  );
}