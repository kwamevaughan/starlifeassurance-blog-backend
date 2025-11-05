import Footer from "@/components/layouts/footer";
import Sidebar from "@/components/layouts/sidebar";
import Header from "@/components/layouts/header";
import useSidebar from "@/hooks/useSidebar";
import { useState } from "react";
import { createPortal } from "react-dom";

export default function MainLayout({
  children,
  mode,
  toggleMode,
  HeaderComponent = Header,
  showSidebar = true,
  user,
  onLogout,
  hideFooter = false,
  ...props
}) {
  const { isSidebarOpen, toggleSidebar, isMobile, isTablet } = useSidebar();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
  };

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

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
    <>
      {/* Mobile/Tablet: Render sidebar using portal for proper fixed positioning */}
      {showSidebar &&
        (isMobile || isTablet) &&
        typeof window !== "undefined" &&
        createPortal(
          <Sidebar
            isOpen={isSidebarOpen}
            mode={mode}
            toggleSidebar={handleToggleSidebar}
            user={user}
            onLogout={handleLogout}
            isHeaderVisible={isHeaderVisible}
            toggleHeader={toggleHeader}
            isMobile={isMobile}
            isTablet={isTablet}
            className="overflow-y-auto"
          />,
          document.body
        )}

      <div className="relative min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-30">
          <HeaderComponent
            {...props}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={handleToggleSidebar}
            mode={mode}
            toggleMode={toggleMode}
            user={user}
            onLogout={handleLogout}
            isHeaderVisible={isHeaderVisible}
            toggleHeader={toggleHeader}
          />
        </div>

        <div className="flex flex-1 relative">
          {/* Sidebar */}
          {showSidebar && (
            <>
              {/* Desktop: Use sticky container */}
              {!isMobile && !isTablet && (
                <div
                  className={`sticky h-[calc(100vh-20px)] left-0 top-0 z-30 mx-0 md:mx-3 transition-all duration-300 ease-in-out`}
                  style={{
                    width: isSidebarOpen ? "240px" : "64px",
                  }}
                >
                  <Sidebar
                    isOpen={isSidebarOpen}
                    mode={mode}
                    toggleSidebar={toggleSidebar}
                    user={user}
                    onLogout={onLogout}
                    isHeaderVisible={isHeaderVisible}
                    toggleHeader={toggleHeader}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    className="h-full overflow-y-auto"
                  />
                </div>
              )}
            </>
          )}

          {/* Main content */}
          <div
            className={`flex-1 transition-all duration-300 ease-in-out min-h-[calc(100vh-64px)] ${
              !isMobile && !isTablet && showSidebar
                ? isSidebarOpen
                  ? ""
                  : ""
                : "ml-0"
            }`}
          >
            <div className="h-full">
              {/* Page Content */}
              <div className="p-4 md:p-6 lg:p-8">
                {children}

                {/* Footer */}
                {!hideFooter && (
                  <div className="mt-8">
                    <Footer 
                      mode={mode} 
                      isSidebarOpen={isSidebarOpen}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}