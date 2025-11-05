import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabaseServer } from '@/lib/supabase';
import useAuthSession from '@/hooks/useAuthSession';
import useLogout from '@/hooks/useLogout';
import { useCategories } from '@/hooks/useCategories';
import SEO from '@/components/SEO';
import toast, { Toaster } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import MainLayout from '@/components/layouts/MainLayout';
import useDarkMode from '@/hooks/useDarkMode';
import { GenericTable } from '@/components/GenericTable';

export default function AdminCategories({ user }) {
  const router = useRouter();
  useAuthSession();
  const handleLogout = useLogout();
  const { 
    categories, 
    loading, 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: ''
  });
  const { mode, toggleMode } = useDarkMode();

  // Define columns for categories table
  const categoryTableColumns = [
    {
      key: "name",
      label: "Name",
      render: (category) => (
        <div className="font-medium text-slate-800 dark:text-white">
          {category.name}
        </div>
      )
    },
    {
      key: "slug",
      label: "Slug",
      render: (category) => (
        <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm text-slate-600 dark:text-slate-300">
          {category.slug}
        </code>
      )
    },
    {
      key: "description",
      label: "Description",
      render: (category) => (
        <span className="text-slate-600 dark:text-slate-400">
          {category.description || '-'}
        </span>
      )
    },
    {
      key: "post_count",
      label: "Posts",
      render: (category) => (
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full text-sm">
          {category.post_count} posts
        </span>
      )
    },
    {
      key: "created_at",
      label: "Created",
      render: (category) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {new Date(category.created_at).toLocaleDateString()}
        </span>
      )
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name
      ...(name === 'name' && { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const success = editingCategory 
      ? await updateCategory(editingCategory.id, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description
        })
      : await createCategory({
          name: formData.name,
          slug: formData.slug,
          description: formData.description
        });
    
    if (success) {
      // Reset form
      setFormData({ name: '', description: '', slug: '' });
      setShowForm(false);
      setEditingCategory(null);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      slug: category.slug
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    await deleteCategory(categoryId);
  };

  const cancelForm = () => {
    setFormData({ name: '', description: '', slug: '' });
    setShowForm(false);
    setEditingCategory(null);
  };



  return (
    <>
      <SEO 
        title="Categories - Blog Admin"
        description="Manage blog categories"
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
                <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
                <p className="text-slate-600">Organize your blog posts with categories</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Icon icon="mdi:plus" className="w-5 h-5" />
                Add Category
              </button>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="category-slug"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of this category"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">All Categories</h2>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="mdi:folder-outline" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No categories yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Your First Category
                </button>
              </div>
            ) : (
              <GenericTable
                data={categories}
                columns={categoryTableColumns}
                onEdit={handleEdit}
                onDelete={(category) => handleDelete(category.id)}
                onAddNew={() => setShowForm(true)}
                addNewLabel="Add Category"
                title="Categories"
                emptyMessage="No categories found. Create your first category to get started!"
                mode={mode}
                loading={loading}
                selectable={true}
                searchable={true}
                enableDateFilter={false}
                enableSortFilter={true}
                enableRefresh={true}
                onRefresh={() => fetchCategories(true)}
                bulkActions={[
                  {
                    label: "Delete Selected",
                    icon: "mdi:delete",
                    onClick: async (selected) => {
                      if (confirm(`Are you sure you want to delete ${selected.length} categories?`)) {
                        for (const id of selected) {
                          await handleDelete(id);
                        }
                      }
                    },
                    show: (selected) => selected.length > 0,
                    className: "bg-red-100 text-red-700 hover:bg-red-200"
                  }
                ]}
              />
            )}
          </div>
        </div>
      </MainLayout>
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