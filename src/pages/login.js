import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signInAndSetCookies } from '@/lib/auth';
import FormField from '@/components/forms/FormField';

import SEO from '@/components/SEO';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // Removed automatic session check to prevent redirect loops

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    console.log('=== LOGIN FORM SUBMITTED ===');
    console.log('Form data:', formData);
    console.log('Email:', formData.email);
    console.log('Password length:', formData.password?.length);
    
    try {
      console.log('🔐 Attempting Supabase login...');
      const { data, error } = await signInAndSetCookies(
        formData.email,
        formData.password
      );

      console.log('📋 Login response received:');
      console.log('  - Error:', error);
      console.log('  - User:', data?.user?.email);
      console.log('  - Session exists:', !!data?.session);
      console.log('  - Access token exists:', !!data?.session?.access_token);

      if (error) {
        console.error('❌ Login error details:', error);
        throw error;
      }

      if (data.user && data.session) {
        console.log('✅ Login successful!');
        console.log('👤 User:', data.user.email);
        console.log('🎫 Session token:', data.session.access_token ? 'Present' : 'Missing');
        console.log('⏰ Session expires:', data.session.expires_at);
        
        toast.success('Login successful! Redirecting...');
        
        // Test session immediately
        console.log('🔍 Testing session immediately after login...');
        const { data: { user: testUser }, error: testError } = await supabase.auth.getUser();
        console.log('  - Test user:', testUser?.email);
        console.log('  - Test error:', testError);
        
        // Wait a moment for session to be established, then redirect
        console.log('⏳ Waiting 1 second before redirect...');
        setTimeout(() => {
          console.log('🚀 Attempting redirect to /admin...');
          console.log('📍 Current location:', window.location.href);
          
          // Try multiple redirect methods
          try {
            console.log('Method 1: window.location.href');
            window.location.href = '/admin';
          } catch (redirectError) {
            console.error('Redirect method 1 failed:', redirectError);
            try {
              console.log('Method 2: window.location.replace');
              window.location.replace('/admin');
            } catch (replaceError) {
              console.error('Redirect method 2 failed:', replaceError);
              console.log('Method 3: Manual navigation');
              window.history.pushState({}, '', '/admin');
              window.location.reload();
            }
          }
        }, 1000);
      } else {
        console.error('❌ Login succeeded but missing user or session');
        console.log('  - User present:', !!data.user);
        console.log('  - Session present:', !!data.session);
        throw new Error('Login succeeded but no user or session returned');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      toast.error(error.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Login - Blog Admin"
        description="Login to access the blog administration panel"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Blog Admin</h1>
              <p className="text-slate-600">Sign in to manage your blog</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <FormField 
                label="Email Address" 
                required
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </FormField>

              <FormField 
                label="Password" 
                required
              >
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </FormField>

              <button
                type="submit"
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}