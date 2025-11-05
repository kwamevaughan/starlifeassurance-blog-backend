import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  console.log('🔍 Middleware running for:', req.nextUrl.pathname);
  
  // Log all cookies for debugging
  const cookies = req.cookies.getAll();
  console.log('Available cookies:', cookies.map(c => c.name));
  const supabaseCookies = cookies.filter(c => c.name.includes('supabase'));
  console.log('Supabase cookies:', supabaseCookies.length);

  // Check if the route is protected (admin routes)
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔒 Checking auth for admin route...');
    
    // First try Supabase SSR auth
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    console.log('Supabase SSR auth result:', { user: user?.email, error: error?.message });

    // If Supabase SSR fails, try manual cookie check
    if (!user) {
      const accessToken = req.cookies.get('supabase-auth-token')?.value;
      const userCookie = req.cookies.get('supabase-user')?.value;
      
      console.log('Manual cookie check:', { 
        hasAccessToken: !!accessToken, 
        hasUserCookie: !!userCookie 
      });
      
      if (accessToken && userCookie) {
        try {
          const userData = JSON.parse(userCookie);
          console.log('✅ User authenticated via manual cookies:', userData.email);
          // Allow access
        } catch (e) {
          console.log('❌ Invalid user cookie, redirecting to login');
          return NextResponse.redirect(new URL('/login', req.url));
        }
      } else {
        console.log('❌ No valid auth found, redirecting to login');
        return NextResponse.redirect(new URL('/login', req.url));
      }
    } else {
      console.log('✅ User authenticated via Supabase SSR:', user.email);
    }
  }

  // Skip middleware redirect for login page to avoid conflicts with client-side auth
  // The client-side auth state listener will handle the redirect after login
  // if (req.nextUrl.pathname === '/login') {
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();

  //   if (user) {
  //     console.log('Middleware: User already logged in, redirecting from login to admin');
  //     return NextResponse.redirect(new URL('/admin', req.url));
  //   }
  // }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};