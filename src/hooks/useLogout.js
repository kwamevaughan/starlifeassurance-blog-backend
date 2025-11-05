import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return handleLogout;
}