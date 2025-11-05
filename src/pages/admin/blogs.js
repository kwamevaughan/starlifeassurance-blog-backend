import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import useAuthSession from "@/hooks/useAuthSession";
import useLogout from "@/hooks/useLogout";
import { useBlog } from "@/hooks/useBlog";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import DocumentUploadModal from "@/components/modals/DocumentUploadModal";
import BlogForm from "@/components/blog/BlogForm";
import { getAdminBlogProps } from "@/utils/getPropsUtils";
import useDarkMode from "@/hooks/useDarkMode";
import PageHeader from "@/components/common/PageHeader";
import DataGrid from "@/components/common/DataGrid";
import DataTable from "@/components/common/DataTable";
import ViewToggle from "@/components/common/ViewToggle";
import { GenericTable } from "@/components/GenericTable";
import BlogCard from "@/components/blog/BlogCard";
import Select from "react-select";
import { getSelectStyles } from "@/utils/selectStyles";
import MainLayout from "@/components/layouts/MainLayout";

export default function AdminBlog({
  categories,
  user,
}) {
  const router = useRouter();
  const { mode, toggleMode } = useDarkMode();
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterTerm, setFilterTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);

  useAuthSession();
  const handleLogout = useLogout();

  const {
    blogs,
    formData,
    setFormData,
    loading,
    handleEdit,
    handleDelete,
    handleSubmit,
    fetchBlogs,
  } = useBlog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const processedEditRef = useRef(null);

  const handleCreateBlog = useCallback(() => {
    setSelectedIds([]);
    
    // Reset form data first
    setFormData({
      id: null,
      article_name: "",
      article_body: "",
      category_id: null,
      tag_ids: [],
      article_image: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      slug: "",
      is_published: false,
      is_draft: true,
      publish_date: null,
      author: "",
      title: "",
      description: "",
      keywords: [],
      featured_image_url: "",
      featured_image_upload: null,
      featured_image_library: null,
      content: "",
      publish_option: "draft",
      scheduled_date: null,
    });

    // Then open modal for new post
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  }, [setFormData]);

  const handleEditClick = useCallback((blog) => {
    setSelectedIds([]);
    
    // Reset form data first
    setFormData({
      id: null,
      article_name: "",
      article_body: "",
      category_id: null,
      tag_ids: [],
      article_image: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      slug: "",
      is_published: false,
      is_draft: true,
      publish_date: null,
      author: "",
      title: "",
      description: "",
      keywords: [],
      featured_image_url: "",
      featured_image_upload: null,
      featured_image_library: null,
      content: "",
      publish_option: "draft",
      scheduled_date: null,
    });

    // Then set editing state and load new data
    setIsEditing(true);
    setEditingId(blog.id);
    handleEdit(blog);
    setIsModalOpen(true);
  }, [handleEdit, setFormData]);

  // Handle edit query parameter from URL
  useEffect(() => {
    const { edit } = router.query;
    if (edit && blogs.length > 0 && processedEditRef.current !== edit) {
      const blogToEdit = blogs.find(blog => blog.id === parseInt(edit));
      if (blogToEdit) {
        processedEditRef.current = edit;
        handleEditClick(blogToEdit);
        // Remove the edit parameter from URL without page reload
        router.replace('/admin/blogs', undefined, { shallow: true });
      }
    }
    
    // Reset the ref when there's no edit parameter
    if (!edit) {
      processedEditRef.current = null;
    }
  }, [router.query.edit, blogs.length, router, blogs, handleEditClick]); // Removed router and handleEditClick to prevent infinite loop

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIds([]);
    setDocumentData(null); // Clear document data when closing
    // Reset form after modal closes
    setTimeout(() => {
      setIsEditing(false);
      setEditingId(null);
      handleEdit({
        id: null,
        article_name: "",
        article_body: "",
        article_category: "General",
        article_tags: [],
        article_image: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        slug: "",
        is_published: false,
      });
    }, 50);
  }, [handleEdit]);

  const handleFormSubmit = useCallback(async (e, updatedFormData) => {
    e.preventDefault();
    try {
      const success = await handleSubmit(e, updatedFormData);
      
      if (success) {
        await fetchBlogs();
        setFormData({
          id: null,
          article_name: "",
          article_body: "",
          category_id: null,
          tag_ids: [],
          article_image: "",
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          slug: "",
          is_published: false,
          is_draft: true,
          publish_date: null,
          author: "",
          title: "",
          description: "",
          keywords: [],
          featured_image_url: "",
          featured_image_upload: null,
          featured_image_library: null,
          content: "",
          publish_option: "draft",
          scheduled_date: null,
        });
        return true; // Explicitly return true on success
      }
      return false; // Return false if not successful
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
      return false;
    }
  }, [handleSubmit, fetchBlogs, setFormData]);

  const handleDeleteClick = useCallback((blog) => {
    setItemToDelete(blog);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      handleDelete(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, handleDelete]);

  const handleSelectAll = useCallback((selected) => {
    if (selected) {
      setSelectedIds(blogs.map((blog) => blog.id));
    } else {
      setSelectedIds([]);
    }
  }, [blogs]);

  const handleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((blogId) => blogId !== id)
        : [...prev, id]
    );
  }, []);

  const handleDocumentProcessed = useCallback((processedDocumentData) => {
    // Store the document data to pass to BlogForm
    setDocumentData(processedDocumentData);
    
    // Open the blog form with document data
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
    
    toast.success(`Document "${processedDocumentData.filename}" processed successfully!`);
  }, []);



  const filteredBlogs = useMemo(() => {
    if (!blogs) return [];
    
    return blogs.filter((blog) => {
      if (!blog) return false;
      
      // Search filter
      const matchesSearch = !filterTerm || (
        (blog.article_name && blog.article_name.toLowerCase().includes(filterTerm.toLowerCase())) ||
        (blog.article_body && blog.article_body.toLowerCase().includes(filterTerm.toLowerCase()))
      );

      // Category filter
      const matchesCategory = selectedCategory === "All" || blog.article_category === selectedCategory;

      // Tags filter - ensure selectedTags is an array and handle empty case
      const matchesTags = !selectedTags || selectedTags.length === 0 || (
        blog.article_tags && 
        Array.isArray(blog.article_tags) && 
        Array.isArray(selectedTags) && 
        selectedTags.some(tag => blog.article_tags.includes(tag))
      );

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [blogs, filterTerm, selectedCategory, selectedTags]);



  // Table columns for Table View
  const blogTableColumns = [
    {
      accessor: "article_name",
      Header: "Title",
      render: (blog) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
            {blog.article_image ? (
              <img
                src={blog.article_image}
                alt={blog.article_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon 
                  icon="heroicons:photo" 
                  className={`w-5 h-5 ${
                    mode === "dark" ? "text-gray-600" : "text-gray-400"
                  }`} 
                />
              </div>
            )}
          </div>
          <div>
            <div className={`font-medium ${
              mode === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {blog.article_name}
            </div>
            <div className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {blog.slug || 'No slug'}
            </div>
          </div>
        </div>
      )
    },
    {
      accessor: "article_category",
      Header: "Category",
      render: (blog) => blog.article_category ? (
        <span className={`px-2 py-1 text-xs rounded-full ${
          mode === "dark" 
            ? "bg-blue-900/30 text-blue-400" 
            : "bg-blue-100 text-blue-700"
        }`}>
          {blog.article_category}
        </span>
      ) : (
        <span className={`text-sm ${
          mode === "dark" ? "text-gray-500" : "text-gray-400"
        }`}>
          Uncategorized
        </span>
      )
    },
    {
      accessor: "status",
      Header: "Status",
      render: (blog) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          blog.is_published
            ? mode === "dark"
              ? "bg-green-900/30 text-green-400"
              : "bg-green-100 text-green-700"
            : mode === "dark"
              ? "bg-yellow-900/30 text-yellow-400"
              : "bg-yellow-100 text-yellow-700"
        }`}>
          {blog.is_published ? "Published" : "Draft"}
        </span>
      )
    },
    {
      accessor: "author",
      Header: "Author",
      render: (blog) => (
        <span className={`text-sm ${
          mode === "dark" ? "text-gray-300" : "text-gray-700"
        }`}>
          {blog.author_details?.name || blog.author_details?.username || 'Unknown'}
        </span>
      )
    },
    {
      accessor: "created_at",
      Header: "Created",
      render: (blog) => (
        <span className={`text-sm ${
          mode === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          {new Date(blog.created_at).toLocaleDateString()}
        </span>
      )
    }
  ];

  return (
    <MainLayout
      mode={mode}
      toggleMode={toggleMode}
      user={user}
      onLogout={handleLogout}
      hideFooter={true}
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative group">
          <div
            className={`absolute inset-0 rounded-2xl backdrop-blur-xl ${
              mode === "dark"
                ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60"
                : "bg-gradient-to-br from-white/80 via-white/20 to-white/80"
            } border ${
              mode === "dark" ? "border-white/10" : "border-white/20"
            } shadow-2xl group-hover:shadow-lg transition-all duration-500`}
          ></div>
          <PageHeader
            title="Blog"
            description="Manage blog posts, articles, and content. Create engaging content for your audience and track engagement."
            mode={mode}
            stats={[
              {
                icon: "heroicons:document-text",
                value: `${blogs.length} total posts`,
              },
              ...(blogs.length > 0
                ? [
                    {
                      icon: "heroicons:clock",
                      value: `Last published ${new Date(
                        blogs[0].created_at
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}`,
                      iconColor: "text-purple-500",
                    },
                  ]
                : []),
            ]}
            actions={[
              {
                label: "Upload Document",
                icon: "heroicons:document-arrow-up",
                onClick: () => setIsDocumentUploadOpen(true),
                variant: "secondary",
              },
              {
                label: "New Post",
                icon: "heroicons:plus",
                onClick: handleCreateBlog,
                variant: "enhanced",
              },
            ]}
          />
        </div>

        <div className="space-y-8 mt-8">
          <div className="relative group">
            <div
              className={`absolute inset-0 rounded-2xl backdrop-blur-xl ${
                mode === "dark"
                  ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60"
                  : "bg-gradient-to-br from-white/80 via-white/20 to-white/80"
              } border ${
                mode === "dark" ? "border-white/10" : "border-white/20"
              } shadow-2xl group-hover:shadow-lg transition-all duration-500`}
            ></div>
            <div
              className={`relative rounded-2xl overflow-hidden shadow-lg border ${
                mode === "dark"
                  ? "bg-gray-900 border-gray-800"
                : "bg-white border-gray-200"
              }`}
            >
              {/* Filters and View Toggle */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative">
                      <Icon 
                        icon="heroicons:magnifying-glass" 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                        }`} 
                      />
                      <input
                        type="text"
                        placeholder="Search blog posts..."
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                        className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          mode === "dark"
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                    <Select
                      value={{ value: selectedCategory, label: selectedCategory }}
                      onChange={(selectedOption) => setSelectedCategory(selectedOption?.value || "All")}
                      options={[
                        { value: "All", label: "All Categories" },
                        ...categories.map((category) => ({
                          value: category.name,
                          label: category.name
                        }))
                      ]}
                      placeholder="All Categories"
                      isClearable={false}
                      isSearchable
                      styles={getSelectStyles(mode)}
                    />
                  </div>
                  {/* View Toggle */}
                  <ViewToggle
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    mode={mode}
                    loading={loading}
                  />
                </div>
              </div>

              {/* Blog Posts Content */}
              <div className="p-6">
                {filteredBlogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon icon="heroicons:document-text" className={`w-16 h-16 mx-auto mb-4 ${
                      mode === "dark" ? "text-gray-600" : "text-gray-400"
                    }`} />
                    <h3 className={`text-lg font-medium mb-2 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {blogs.length === 0 ? "No blog posts yet" : "No posts match your filters"}
                    </h3>
                    <p className={`text-sm mb-6 ${
                      mode === "dark" ? "text-gray-500" : "text-gray-600"
                    }`}>
                      {blogs.length === 0 
                        ? "Create your first blog post to get started!"
                        : "Try adjusting your search or filter criteria."
                      }
                    </p>
                    {blogs.length === 0 && (
                      <button
                        onClick={handleCreateBlog}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        Create Your First Blog Post
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {viewMode === "grid" ? (
                      <DataGrid
                        data={filteredBlogs}
                        mode={mode}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        renderCard={(blog, { onEdit, onDelete }) => (
                          <BlogCard 
                            blog={blog} 
                            mode={mode} 
                            handleEditClick={onEdit} 
                            onDelete={onDelete}
                          />
                        )}
                      />
                    ) : (
                      <GenericTable
                        data={filteredBlogs}
                        columns={blogTableColumns}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onAddNew={handleCreateBlog}
                        addNewLabel="Create Post"
                        title="Blog Posts"
                        emptyMessage="No blog posts found. Create your first post to get started!"
                        mode={mode}
                        selectable={true}
                        searchable={false} // We have custom search above
                        enableDateFilter={true}
                        enableSortFilter={true}
                        enableRefresh={true}
                        onRefresh={fetchBlogs}
                        onSelectionChange={(selected) => setSelectedIds(selected)}
                        bulkActions={[
                          {
                            label: "Publish Selected",
                            icon: "mdi:publish",
                            onClick: (selected) => {
                              console.log("Publishing:", selected);
                              toast.success(`Publishing ${selected.length} posts...`);
                            },
                            show: (selected) => selected.length > 0
                          }
                        ]}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 ${
                mode === "dark"
                  ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500"
                : "bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"
              }`}
            ></div>
            <div
              className={`absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-3 sm:w-4 h-3 sm:h-4 bg-[#85c2da] rounded-full opacity-60`}
            ></div>
            <div
              className={`absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 bg-[#f3584a] rounded-full opacity-40 animate-pulse delay-1000`}
            ></div>
          </div>
        </div>
      </div>

      {/* Blog Form Modal */}
      <BlogForm
        key={`blog-form-${editingId}-${isModalOpen}-${documentData?.filename || ''}`}
        mode={mode}
        blogId={editingId}
        showForm={isModalOpen}
        handleCancel={handleCancel}
        handleSubmit={handleFormSubmit}
        fetchBlogs={fetchBlogs}
        documentData={documentData}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isDocumentUploadOpen}
        onClose={() => setIsDocumentUploadOpen(false)}
        onDocumentProcessed={handleDocumentProcessed}
        mode={mode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.article_name || "this blog post"}
        itemType="blog post"
        mode={mode}
        itemId={itemToDelete?.id}
      />
      
    </MainLayout>
  );
}

export async function getServerSideProps({ req, res }) {
  return await getAdminBlogProps({ req, res });
}