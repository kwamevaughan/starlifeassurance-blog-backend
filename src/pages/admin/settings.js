import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase';
import useAuthSession from '@/hooks/useAuthSession';
import useLogout from '@/hooks/useLogout';
import { useAuthors } from '@/hooks/useAuthors';
import SEO from '@/components/SEO';
import toast, { Toaster } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import MainLayout from '@/components/layouts/MainLayout';
import SimpleModal from '@/components/modals/SimpleModal';
import { GenericTable } from '@/components/GenericTable';
import useDarkMode from '@/hooks/useDarkMode';

export default function AdminSettings({ user }) {
  const router = useRouter();
  useAuthSession();
  const handleLogout = useLogout();
  const [activeTab, setActiveTab] = useState('general');
  const { authors, loading: authorsLoading, refreshAuthors } = useAuthors();
  const [settings, setSettings] = useState({
    siteName: 'My Blog',
    siteDescription: 'A modern blog built with Next.js',
    siteUrl: 'https://myblog.com',
    postsPerPage: 10,
    allowComments: true,
    moderateComments: true,
    emailNotifications: true,
    seoEnabled: true,
    analyticsId: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      linkedin: '',
      instagram: ''
    }
  });
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { mode, toggleMode } = useDarkMode();

  // User table columns
  const userTableColumns = [
    {
      accessor: "name",
      Header: "Name",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            user.role === 'admin'
              ? mode === "dark"
                ? "bg-red-900/30 text-red-400"
                : "bg-red-100 text-red-700"
              : user.role === 'editor'
                ? mode === "dark"
                  ? "bg-purple-900/30 text-purple-400"
                  : "bg-purple-100 text-purple-700"
                : mode === "dark"
                  ? "bg-green-900/30 text-green-400"
                  : "bg-green-100 text-green-700"
          }`}>
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div className={`font-medium ${
              mode === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {user.name}
            </div>
            <div className={`text-sm ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      accessor: "role",
      Header: "Role",
      render: (user) => (
        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
          user.role === 'admin'
            ? mode === "dark"
              ? "bg-red-900/30 text-red-400 border border-red-800"
              : "bg-red-100 text-red-700 border border-red-200"
            : user.role === 'editor'
              ? mode === "dark"
                ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                : "bg-purple-100 text-purple-700 border border-purple-200"
              : mode === "dark"
                ? "bg-green-900/30 text-green-400 border border-green-800"
                : "bg-green-100 text-green-700 border border-green-200"
        }`}>
          {user.role === 'admin' ? 'Admin' : 
           user.role === 'editor' ? 'Editor' : 
           'User'}
        </span>
      )
    },
    {
      accessor: "username",
      Header: "Username",
      render: (user) => (
        <span className={`text-sm font-mono ${
          mode === "dark" ? "text-gray-300" : "text-gray-700"
        }`}>
          @{user.username?.split('@')[0] || 'unknown'}
        </span>
      )
    },
    {
      accessor: "status",
      Header: "Status",
      render: (user) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
          mode === "dark"
            ? "bg-green-900/30 text-green-400"
            : "bg-green-100 text-green-700"
        }`}>
          <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
          Active
        </span>
      )
    }
  ];

  const loadSettings = async () => {
    try {
      // In a real app, you'd load settings from database
      // For now, we'll use localStorage or default values
      const savedSettings = localStorage.getItem('blogSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects like socialLinks.twitter
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    try {
      // In a real app, you'd save to database
      localStorage.setItem('blogSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsAddingUser(true);
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email.toLowerCase().trim(), // Normalize email
        password: newUser.password,
        options: {
          data: {
            name: newUser.name.trim()
          }
        }
      });

      if (authError) {
        // Handle specific Supabase auth errors
        if (authError.message.includes('Email address')) {
          toast.error('Invalid email address format. Please use a valid email.');
        } else if (authError.message.includes('already registered')) {
          toast.error('This email is already registered. Please use a different email.');
        } else {
          toast.error(authError.message || 'Failed to create user account');
        }
        return;
      }

      // Then add to hr_users table
      const { error: insertError } = await supabase
        .from('hr_users')
        .insert([{
          id: authData.user.id,
          name: newUser.name.trim(),
          username: newUser.email.toLowerCase().trim(), // Store email in username field
          role: 'user' // Default role
        }]);

      if (insertError) {
        console.error('Error inserting into hr_users:', insertError);
        toast.error('User account created but failed to add to system. Please contact administrator.');
        return;
      }

      setNewUser({
        name: '',
        email: '',
        password: ''
      });

      await refreshAuthors();
      toast.success('User added successfully');
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Failed to add user');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Delete from hr_users table
      const { error } = await supabase
        .from('hr_users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      await refreshAuthors();
      toast.success('User removed successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'user'
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser.name || !editingUser.email) {
      toast.error('Name and email are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingUser.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsUpdatingUser(true);
    try {
      // Update hr_users table
      const { error } = await supabase
        .from('hr_users')
        .update({
          name: editingUser.name.trim(),
          username: editingUser.email.toLowerCase().trim(), // Store email in username field
          role: editingUser.role
        })
        .eq('id', editingUser.id);

      if (error) {
        throw error;
      }

      setShowEditModal(false);
      setEditingUser(null);
      await refreshAuthors();
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'mdi:cog' },
    { id: 'content', label: 'Content', icon: 'mdi:file-document' },
    { id: 'authors', label: 'Authors', icon: 'mdi:account-multiple' },
    { id: 'social', label: 'Social Media', icon: 'mdi:share-variant' },
    { id: 'advanced', label: 'Advanced', icon: 'mdi:tune' }
  ];





  return (
    <>
      <SEO 
        title="Settings - Blog Admin"
        description="Configure blog settings"
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
          <div className={`rounded-xl shadow-sm border p-6 ${
            mode === "dark"
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-slate-200"
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-2xl font-bold ${
                  mode === "dark" ? "text-white" : "text-slate-800"
                }`}>Settings</h1>
                <p className={`${
                  mode === "dark" ? "text-gray-400" : "text-slate-600"
                }`}>Configure your blog preferences</p>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Icon icon="mdi:content-save" className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className={`rounded-xl shadow-sm border p-4 ${
                mode === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-slate-200"
              }`}>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? mode === "dark"
                            ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                          : mode === "dark"
                            ? 'text-gray-400 hover:bg-gray-800'
                            : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon icon={tab.icon} className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className={`rounded-xl shadow-sm border p-6 ${
                mode === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-slate-200"
              }`}>
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className={`text-lg font-semibold ${
                      mode === "dark" ? "text-white" : "text-slate-800"
                    }`}>General Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          Site Name
                        </label>
                        <input
                          type="text"
                          name="siteName"
                          value={settings.siteName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            mode === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-slate-300 text-gray-900"
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          Site URL
                        </label>
                        <input
                          type="url"
                          name="siteUrl"
                          value={settings.siteUrl}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            mode === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-slate-300 text-gray-900"
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        mode === "dark" ? "text-gray-300" : "text-slate-700"
                      }`}>
                        Site Description
                      </label>
                      <textarea
                        name="siteDescription"
                        value={settings.siteDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          mode === "dark"
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-slate-300 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Content Settings */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <h2 className={`text-lg font-semibold ${
                      mode === "dark" ? "text-white" : "text-slate-800"
                    }`}>Content Settings</h2>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        mode === "dark" ? "text-gray-300" : "text-slate-700"
                      }`}>
                        Posts Per Page
                      </label>
                      <input
                        type="number"
                        name="postsPerPage"
                        value={settings.postsPerPage}
                        onChange={handleInputChange}
                        min="1"
                        max="50"
                        className={`w-full md:w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          mode === "dark"
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-slate-300 text-gray-900"
                        }`}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="allowComments"
                          checked={settings.allowComments}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className={`ml-2 text-sm ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          Allow comments on posts
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="moderateComments"
                          checked={settings.moderateComments}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className={`ml-2 text-sm ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          Moderate comments before publishing
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Authors Management */}
                {activeTab === 'authors' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className={`text-lg font-semibold ${
                        mode === "dark" ? "text-white" : "text-slate-800"
                      }`}>User Management</h2>
                    </div>
                    
                    {/* Add New User Form */}
                    <div className={`p-4 rounded-lg border ${
                      mode === "dark" 
                        ? "bg-gray-800 border-gray-700" 
                        : "bg-gray-50 border-gray-200"
                    }`}>
                      <h3 className={`text-md font-medium mb-4 ${
                        mode === "dark" ? "text-white" : "text-slate-700"
                      }`}>Add New User</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            mode === "dark" ? "text-gray-300" : "text-slate-700"
                          }`}>
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              mode === "dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-slate-300 text-gray-900"
                            }`}
                            placeholder="Enter full name"
                            disabled={isAddingUser}
                          />
                        </div>
                        

                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            mode === "dark" ? "text-gray-300" : "text-slate-700"
                          }`}>
                            Email *
                          </label>
                          <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              mode === "dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-slate-300 text-gray-900"
                            }`}
                            placeholder="user@example.com"
                            disabled={isAddingUser}
                          />
                          <p className={`text-xs mt-1 ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>
                            Use a valid email format (e.g., user@gmail.com, admin@company.com)
                          </p>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            mode === "dark" ? "text-gray-300" : "text-slate-700"
                          }`}>
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={newUser.password}
                              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                mode === "dark"
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white border-slate-300 text-gray-900"
                              }`}
                              placeholder="Enter password"
                              disabled={isAddingUser}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                                mode === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                              } transition-colors`}
                              disabled={isAddingUser}
                            >
                              <Icon 
                                icon={showPassword ? "mdi:eye-off" : "mdi:eye"} 
                                className="w-4 h-4" 
                              />
                            </button>
                          </div>
                          <p className={`text-xs mt-1 ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>
                            Minimum 6 characters required
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleAddUser}
                        disabled={isAddingUser}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {isAddingUser ? (
                          <>
                            <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                            Adding User...
                          </>
                        ) : (
                          <>
                            <Icon icon="mdi:plus" className="w-4 h-4" />
                            Add User
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Users Table */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-md font-medium ${
                          mode === "dark" ? "text-white" : "text-slate-700"
                        }`}>Current Users</h3>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          mode === "dark"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {authors.length} user{authors.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {authorsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Icon icon="mdi:loading" className="w-6 h-6 animate-spin text-blue-600" />
                          <span className={`ml-2 ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Loading users...
                          </span>
                        </div>
                      ) : (
                        <GenericTable
                          data={authors}
                          columns={userTableColumns}
                          onEdit={handleEditUser}
                          onDelete={(user) => handleDeleteUser(user.id)}
                          title="System Users"
                          emptyMessage="No users found. Add your first user above."
                          mode={mode}
                          selectable={false}
                          searchable={true}
                          enableDateFilter={false}
                          enableSortFilter={true}
                          enableRefresh={false}
                          confirmDelete={true}
                          deleteConfirmationProps={{
                            title: "Delete User",
                            itemType: "user",
                            warning: "This will remove the user from the system and they will no longer be able to access the admin panel."
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Social Media Settings */}
                {activeTab === 'social' && (
                  <div className="space-y-6">
                    <h2 className={`text-lg font-semibold ${
                      mode === "dark" ? "text-white" : "text-slate-800"
                    }`}>Social Media Links</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          Twitter
                        </label>
                        <input
                          type="url"
                          name="socialLinks.twitter"
                          value={settings.socialLinks.twitter}
                          onChange={handleInputChange}
                          placeholder="https://twitter.com/username"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            mode === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-slate-300 text-gray-900"
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          Facebook
                        </label>
                        <input
                          type="url"
                          name="socialLinks.facebook"
                          value={settings.socialLinks.facebook}
                          onChange={handleInputChange}
                          placeholder="https://facebook.com/page"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            mode === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-slate-300 text-gray-900"
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          name="socialLinks.linkedin"
                          value={settings.socialLinks.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/username"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            mode === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-slate-300 text-gray-900"
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          Instagram
                        </label>
                        <input
                          type="url"
                          name="socialLinks.instagram"
                          value={settings.socialLinks.instagram}
                          onChange={handleInputChange}
                          placeholder="https://instagram.com/username"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            mode === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-slate-300 text-gray-900"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <h2 className={`text-lg font-semibold ${
                      mode === "dark" ? "text-white" : "text-slate-800"
                    }`}>Advanced Settings</h2>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        mode === "dark" ? "text-gray-300" : "text-slate-700"
                      }`}>
                        Google Analytics ID
                      </label>
                      <input
                        type="text"
                        name="analyticsId"
                        value={settings.analyticsId}
                        onChange={handleInputChange}
                        placeholder="G-XXXXXXXXXX"
                        className={`w-full md:w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          mode === "dark"
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-slate-300 text-gray-900"
                        }`}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="seoEnabled"
                          checked={settings.seoEnabled}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className={`ml-2 text-sm ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          Enable SEO optimization
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className={`ml-2 text-sm ${
                          mode === "dark" ? "text-gray-300" : "text-slate-700"
                        }`}>
                          Send email notifications for new comments
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>

      {/* Edit User Modal */}
      <SimpleModal
        isOpen={showEditModal}
        onClose={handleCancelEdit}
        title="Edit User"
        mode={mode}
        width="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-300" : "text-slate-700"
            }`}>
              Full Name *
            </label>
            <input
              type="text"
              value={editingUser?.name || ''}
              onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-slate-300 text-gray-900"
              }`}
              placeholder="Enter full name"
              disabled={isUpdatingUser}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-300" : "text-slate-700"
            }`}>
              Email *
            </label>
            <input
              type="email"
              value={editingUser?.email || ''}
              onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-slate-300 text-gray-900"
              }`}
              placeholder="Enter email address"
              disabled={isUpdatingUser}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-300" : "text-slate-700"
            }`}>
              Role
            </label>
            <select
              value={editingUser?.role || 'user'}
              onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-slate-300 text-gray-900"
              }`}
              disabled={isUpdatingUser}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleCancelEdit}
              disabled={isUpdatingUser}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                mode === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              disabled={isUpdatingUser}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isUpdatingUser ? (
                <>
                  <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Icon icon="mdi:check" className="w-4 h-4" />
                  Update User
                </>
              )}
            </button>
          </div>
        </div>
      </SimpleModal>

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