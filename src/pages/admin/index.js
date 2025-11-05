import { useRouter } from 'next/router';
import useAuthSession from '@/hooks/useAuthSession';
import useLogout from '@/hooks/useLogout';
import SEO from '@/components/SEO';
import { useBlog } from '@/hooks/useBlog';
import toast, { Toaster } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getQuickActions, findNavItemByLabel } from '@/utils/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import useDarkMode from '@/hooks/useDarkMode';
import { supabaseServer } from '@/lib/supabase';
import { GenericTable } from '@/components/GenericTable';

export default function AdminDashboard({ user }) {
  const router = useRouter();
  useAuthSession();
  const { blogs } = useBlog();
  const { mode, toggleMode } = useDarkMode();
  const handleLogout = useLogout();

  const publishedBlogs = blogs.filter(blog => blog.is_published);
  const draftBlogs = blogs.filter(blog => blog.is_draft);
  
  // Get navigation items
  const quickActions = getQuickActions();
  const blogPostsNav = findNavItemByLabel('Blog Posts');

  // Define columns for recent posts table
  const recentPostsColumns = [
    {
      accessor: "article_name",
      Header: "Title",
      render: (blog) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {blog.article_image ? (
              <img
                src={blog.article_image}
                alt={blog.article_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon 
                  icon="mdi:file-document" 
                  className="w-5 h-5 text-gray-400" 
                />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-800 truncate">{blog.article_name}</h3>
            <p className="text-sm text-slate-500 truncate">
              {blog.article_body ? 
                blog.article_body.replace(/<[^>]*>/g, '').substring(0, 60) + '...' :
                'No content'
              }
            </p>
          </div>
        </div>
      )
    },
    {
      accessor: "status",
      Header: "Status",
      render: (blog) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          blog.is_published
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            blog.is_published ? 'bg-green-400' : 'bg-yellow-400'
          }`} />
          {blog.is_published ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      accessor: "created_at",
      Header: "Created",
      render: (blog) => (
        <div className="text-sm text-slate-600">
          <div>{new Date(blog.created_at).toLocaleDateString()}</div>
          <div className="text-xs text-slate-400">
            {new Date(blog.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      )
    },
    {
      accessor: "author",
      Header: "Author",
      render: (blog) => (
        <div className="text-sm text-slate-600">
          {blog.author_name || 'Unknown'}
        </div>
      )
    }
  ];

  return (
    <>
      <SEO 
        title="Admin Dashboard - Blog"
        description="Blog administration dashboard"
        noindex={true}
      />
      <MainLayout
        mode={mode}
        toggleMode={toggleMode}
        user={user}
        onLogout={handleLogout}
        showSidebar={true}
      >
        <div className="space-y-8">
          {/* Page Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-600">Welcome back, {user.email}</p>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Icon icon="mdi:view-dashboard" className="w-5 h-5" />
                <span className="text-sm">Admin Overview</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon icon="mdi:file-document" className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Posts</p>
                  <p className="text-2xl font-bold text-slate-900">{blogs.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Icon icon="mdi:check-circle" className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Published</p>
                  <p className="text-2xl font-bold text-slate-900">{publishedBlogs.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Icon icon="mdi:file-edit" className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Drafts</p>
                  <p className="text-2xl font-bold text-slate-900">{draftBlogs.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const colors = [
                  { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', icon: 'text-blue-600', text: 'text-blue-700' },
                  { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', icon: 'text-purple-600', text: 'text-purple-700' },
                  { bg: 'bg-gray-50', hover: 'hover:bg-gray-100', icon: 'text-gray-600', text: 'text-gray-700' }
                ];
                const colorScheme = colors[index % colors.length];
                
                return (
                  <button
                    key={action.href}
                    onClick={() => router.push(action.href)}
                    className={`flex items-center gap-3 p-4 ${colorScheme.bg} ${colorScheme.hover} rounded-lg transition-colors group`}
                  >
                    <Icon icon={action.icon} className={`w-5 h-5 ${colorScheme.icon}`} />
                    <span className={`font-medium ${colorScheme.text}`}>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-lg font-semibold text-slate-800">Recent Posts</h2>
              <button
                onClick={() => router.push(blogPostsNav?.href)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200 px-4 py-2 rounded-md text-sm font-medium"
              >
                View All
                <Icon icon="mdi:arrow-right" className="w-4 h-4" />
              </button>
            </div>
            
            <GenericTable
              data={blogs.slice(0, 5)}
              columns={recentPostsColumns}
              mode={mode === "dark" ? "dark" : "light"}
              selectable={false}
              searchable={false}
              enableDateFilter={false}
              enableSortFilter={false}
              enableRefresh={false}
              onEdit={(blog) => router.push(`${blogPostsNav?.href}?edit=${blog.id}`)}
              onAddNew={() => router.push(blogPostsNav?.href)}
              addNewLabel="Create Post"
              emptyMessage="No blog posts yet. Create your first post to get started!"
              hideEmptyColumns={false}
              showBulkBar={false}
            />
          </div>
        </div>
      </MainLayout>
      <Toaster position="top-right" />
    </>
  );
}

export async function getServerSideProps({ req, res }) {
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

    return {
      props: {
        user: {
          id: user.id,
          email: user.email,
          name: user.email
        }
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}