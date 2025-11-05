import { supabase } from './supabase';

// Helper to ensure session is stored in cookies after login
export const signInAndSetCookies = async (email, password) => {
  try {
    console.log('🔐 Signing in with cookie storage...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      console.log('✅ Session created, manually setting cookies...');
      
      // Manually set cookies for SSR
      const expires = new Date(data.session.expires_at * 1000);
      
      // Set access token cookie
      document.cookie = `supabase-auth-token=${data.session.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      
      // Set refresh token cookie  
      document.cookie = `supabase-refresh-token=${data.session.refresh_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      
      // Set user info cookie
      document.cookie = `supabase-user=${JSON.stringify(data.user)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      
      console.log('🍪 Cookies set manually');
      
      // Also ensure localStorage is set
      await supabase.auth.setSession(data.session);
    }

    return { data, error: null };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return { data: null, error };
  }
};

// Helper to check if user is authenticated
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    console.error('❌ Get user error:', error);
    return { user: null, error };
  }
};

// Helper to sign out and clear cookies
export const signOut = async () => {
  try {
    console.log('🚪 Signing out...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Signed out successfully');
    return { error: null };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { error };
  }
};