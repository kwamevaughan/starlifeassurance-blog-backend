import Link from "next/link";
import { useRouter } from 'next/router';
import { Icon } from "@iconify/react";
import SEO from "../components/SEO";

export default function Custom404() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/admin');
  };

  const handleGoLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <SEO 
        title="Page Not Found - Blog Admin" 
        description="The page you're looking for doesn't exist." 
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-50 scale-110 animate-pulse" />
            <div className="relative bg-white p-6 rounded-full shadow-lg border border-blue-100">
              <Icon icon="heroicons:exclamation-triangle" className="text-blue-500 text-4xl" />
            </div>
          </div>
          
          <h1 className="text-7xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-slate-600 leading-relaxed mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <Icon icon="heroicons:home" className="text-lg" />
              Go to Admin
            </button>
            
            <button
              onClick={handleGoLogin}
              className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl shadow-lg border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              <Icon icon="heroicons:arrow-right-on-rectangle" className="text-lg" />
              Back to Login
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl shadow-lg border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              <Icon icon="heroicons:arrow-left" className="text-lg" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 