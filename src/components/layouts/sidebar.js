import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import { sidebarNav } from "@/data/nav";

const Sidebar = ({
  mode,
  isOpen,
  toggleSidebar,
  user,
  onLogout,
  isMobile,
  isTablet,
  className = "",
}) => {
  const router = useRouter();
  const sidebarRef = useRef(null);
  const [filteredNav, setFilteredNav] = useState(sidebarNav);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (isMobile || isTablet) &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        toggleSidebar();
      }
    };

    if (isOpen && (isMobile || isTablet)) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, isMobile, isTablet, toggleSidebar]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile || isTablet) {
      const handleRouteChange = () => {
        if (isOpen) {
          toggleSidebar();
        }
      };

      router.events.on("routeChangeStart", handleRouteChange);
      return () => router.events.off("routeChangeStart", handleRouteChange);
    }
  }, [router.events, isOpen, toggleSidebar, isMobile, isTablet]);

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActiveRoute = (href) => {
    if (!href) return false;
    
    // Exact match for dashboard to prevent it from being active on all admin pages
    if (href === '/admin') {
      return router.pathname === '/admin';
    }
    
    // For other routes, allow matching sub-routes
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile/Tablet overlay */}
      {(isMobile || isTablet) && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          ${isMobile || isTablet ? 'fixed' : 'relative'}
          ${isMobile || isTablet ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
          ${isMobile || isTablet ? 'z-50' : 'z-30'}
          h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${className}
        `}
        style={{
          width: isOpen ? '240px' : '64px',
          ...(isMobile || isTablet ? { width: '240px' } : {})
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            {isOpen ? (
              <div className="flex items-center gap-2">
                <Icon icon="mdi:blog" className="w-8 h-8 text-blue-600" />
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Blog Admin
                </span>
              </div>
            ) : (
              <Icon icon="mdi:blog" className="w-8 h-8 text-blue-600" />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredNav.map((navItem, index) => (
                <div key={index}>
                  {navItem.isStandalone ? (
                    <button
                      onClick={() => router.push(navItem.href)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        isActiveRoute(navItem.href)
                          ? mode === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-700"
                          : mode === "dark"
                            ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon icon={navItem.icon} className="w-5 h-5 flex-shrink-0" />
                      {isOpen && (
                        <span className="ml-3 text-sm font-medium">
                          {navItem.label}
                        </span>
                      )}
                    </button>
                  ) : (
                    <div>
                      {/* Category header */}
                      <div className={`px-3 py-2 ${isOpen ? 'block' : 'hidden'}`}>
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {navItem.label}
                        </h3>
                      </div>
                      
                      {/* Category items */}
                      <div className="space-y-1">
                        {navItem.items?.map((item, itemIndex) => (
                          <button
                            key={itemIndex}
                            onClick={() => router.push(item.href)}
                            className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                              isActiveRoute(item.href)
                                ? mode === "dark"
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-50 text-blue-700"
                                : mode === "dark"
                                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            <Icon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
                            {isOpen && (
                              <span className="ml-3 text-sm font-medium">
                                {item.label}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* User section */}
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon icon="mdi:account" className="w-4 h-4 text-white" />
                </div>
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Administrator
                    </p>
                  </div>
                )}
              </div>
              
              {isOpen && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Icon icon="mdi:logout" className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;