import { Icon } from "@iconify/react";

const Footer = ({ mode, isSidebarOpen }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left side - Copyright */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Icon icon="mdi:copyright" className="w-4 h-4" />
            <span>{currentYear} Blog Admin. All rights reserved.</span>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center gap-4 text-sm">
            <a
              href="/admin"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/admin/blogs"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Blog Posts
            </a>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
              <Icon icon="mdi:heart" className="w-4 h-4 text-red-500" />
              <span>Made with care</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;