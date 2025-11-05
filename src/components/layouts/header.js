import { useState } from "react";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";

const Header = ({
  mode,
  toggleMode,
  isSidebarOpen,
  toggleSidebar,
  user,
  onLogout,
  isHeaderVisible,
  toggleHeader,
}) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Sidebar toggle and title */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon 
              icon={isSidebarOpen ? "mdi:menu-open" : "mdi:menu"} 
              className="w-5 h-5 text-gray-600 dark:text-gray-300" 
            />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Blog Admin
            </h1>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon 
              icon={mode === 'dark' ? "mdi:weather-sunny" : "mdi:weather-night"} 
              className="w-5 h-5 text-gray-600 dark:text-gray-300" 
            />
          </button>

          {/* User menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:account" className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
                  {user.email}
                </span>
                <Icon 
                  icon="mdi:chevron-down" 
                  className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Administrator
                    </p>
                  </div>
                  
                  <div className="p-1">
                    <button
                      onClick={() => {
                        router.push('/admin');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <Icon icon="mdi:view-dashboard" className="w-4 h-4" />
                      Dashboard
                    </button>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Icon icon="mdi:logout" className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;