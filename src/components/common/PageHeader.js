import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

function PageHeader({
  title,
  description,
  icon,
  iconBgColor = "from-blue-600 to-blue-500",
  mode = "light",
  actions = [],
  children,
  variant = "enhanced", // "simple" or "enhanced"
  className = "",
}) {
  const isDark = mode === "dark";

  if (variant === "enhanced") {
    return (
      <div className={`mb-2 ${className}`}>
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-8 mb-6 border border-gray-200 border-blue-600/20 dark:border-blue-600/20 shadow-lg shadow-blue-500/10 hover:shadow-none transition-all duration-300">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {icon && (
                    <div className="relative">
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${iconBgColor} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/10`}
                      >
                        <Icon icon={icon} className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  <div>
                    <h1
                      className={`text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent`}
                    >
                      {title}
                    </h1>
                    {description && (
                      <div className="flex items-center gap-2 mt-1">
                        <p
                          className={`text-md max-w-md ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          {description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {(actions.length > 0 || children) && (
                <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (action.label === "Refresh") {
                          toast.promise(action.onClick(), {
                            loading: "Refreshing data...",
                            success: "Data refreshed successfully!",
                            error: "Failed to refresh data",
                          });
                        } else {
                          action.onClick();
                        }
                      }}
                      disabled={action.disabled}
                      className={
                        action.variant === "primary"
                          ? "group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/10"
                          : action.variant === "secondary"
                          ? `group relative overflow-hidden px-6 py-3 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                              isDark
                                ? "bg-slate-800/80 backdrop-blur-sm border-slate-600/50 text-slate-200 hover:bg-slate-700/80 hover:border-slate-500"
                                : "bg-white/80 backdrop-blur-sm border-slate-300/50 text-slate-700 hover:bg-slate-50/80 hover:border-slate-400/50"
                            }`
                          : action.className ||
                            `group relative overflow-hidden px-6 py-3 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                              isDark
                                ? "bg-slate-800/80 backdrop-blur-sm border-slate-600/50 text-slate-200 hover:bg-slate-700/80 hover:border-slate-500"
                                : "bg-white/80 backdrop-blur-sm border-slate-300/50 text-slate-700 hover:bg-slate-50/80 hover:border-slate-400/50"
                            }`
                      }
                    >
                      {action.variant === "primary" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      )}
                      <div
                        className={`${
                          action.variant === "primary" ? "relative" : ""
                        } flex items-center gap-3`}
                      >
                        {action.icon && (
                          <Icon
                            icon={action.icon}
                            className={`w-5 h-5 ${action.iconClass || ""}`}
                          />
                        )}
                        <span className="font-medium">{action.label}</span>
                      </div>
                    </button>
                  ))}
                  {children}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PageHeader;
