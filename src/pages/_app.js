import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import "../styles/globals.css";
import { sidebarNav } from "@/data/nav";
import { Nunito } from "next/font/google";
import useSidebar from "@/hooks/useSidebar";
import { LoadingProvider } from "@/context/LoadingContext";

import {
  checkForServiceWorkerUpdate,
  activateUpdateNow,
  listenForSWMessages,
  registerServiceWorker,
} from "../utils/serviceWorkerRegistration";


const nunito = Nunito({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

// Helper function to get page label from URL
function getPageLabelFromUrl(url) {
  // Remove query parameters
  const pathWithoutQuery = url.split("?")[0];

  // Flatten all navigation items for easier searching
  const allNavItems = sidebarNav.flatMap((entry) => {
    if (entry.items) {
      return entry.items;
    } else {
      return [entry];
    }
  });

  // Try to find exact match first
  let page = allNavItems.find((item) => item.href === pathWithoutQuery);

  if (page) {
    return page.label;
  }

  // If no exact match, try to match by path segments
  const urlSegments = pathWithoutQuery.split("/").filter((segment) => segment);
  const lastSegment = urlSegments[urlSegments.length - 1];

  // Look for items that end with the last segment
  page = allNavItems.find((item) => {
    if (!item.href) return false;
    const itemSegments = item.href.split("/").filter((segment) => segment);
    return itemSegments[itemSegments.length - 1] === lastSegment;
  });

  if (page) {
    return page.label;
  }

  return null;
}



// Debounce function to prevent multiple toast messages
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function MyApp({ Component, pageProps }) {
  const [mode, setMode] = useState("light");
  const router = useRouter();
  const { isSidebarOpen } = useSidebar();
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  const swToastShownRef = useRef(false);

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mode", newMode);
      // Toggle the dark class on the document
      if (newMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedMode = window.localStorage.getItem("mode");
    if (savedMode) {
      setMode(savedMode);
      // Apply the saved mode to the document
      if (savedMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const systemMode = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setMode(systemMode);
      window.localStorage.setItem("mode", systemMode);
      // Apply the system mode to the document
      if (systemMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const systemMode = e.matches ? "dark" : "light";
      if (!window.localStorage.getItem("mode")) {
        setMode(systemMode);
      }
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Add global error handler for DOM manipulation errors
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleError = (event) => {
      if (
        event.error &&
        event.error.message &&
        event.error.message.includes("insertBefore")
      ) {
        console.warn(
          "Global error handler caught DOM manipulation error:",
          event.error
        );
        event.preventDefault();
        // Optionally show a user-friendly message
        toast.error(
          "A display error occurred. Please refresh the page if the issue persists.",
          {
            duration: 5000,
          }
        );
      }
    };

    const handleUnhandledRejection = (event) => {
      if (
        event.reason &&
        event.reason.message &&
        event.reason.message.includes("insertBefore")
      ) {
        console.warn(
          "Global error handler caught unhandled DOM manipulation error:",
          event.reason
        );
        event.preventDefault();
        // Optionally show a user-friendly message
        toast.error(
          "A display error occurred. Please refresh the page if the issue persists.",
          {
            duration: 5000,
          }
        );
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  // Global loading toast helpers and optional click handler
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.showLoadingToast = (message = "Please wait...") =>
      toast.loading(message, { id: "global-loading" });
    window.hideLoadingToast = () => toast.dismiss("global-loading");

    const handleClick = (e) => {
      const target = e.target.closest("[data-wait-toast]");
      if (!target) return;
      const msg = target.getAttribute("data-wait-toast") || "Please wait...";
      toast.loading(msg, { id: "global-loading" });
      // Auto-dismiss fallback after 10s in case caller forgets to hide
      setTimeout(() => {
        toast.dismiss("global-loading");
      }, 10000);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function handleLayaways() {
      if (router.pathname !== "/pos") {
        router.push({ pathname: "/pos", query: { open: "layaways" } });
      } else {
        window.dispatchEvent(new CustomEvent("open-retrieve-layaways-modal"));
      }
    }
    function handleOrders() {
      if (router.pathname !== "/pos") {
        router.push({ pathname: "/pos", query: { open: "orders" } });
      } else {
        window.dispatchEvent(new CustomEvent("open-retrieve-orders-modal"));
      }
    }
    window.addEventListener("open-retrieve-layaways-modal", handleLayaways);
    window.addEventListener("open-retrieve-orders-modal", handleOrders);
    return () => {
      window.removeEventListener(
        "open-retrieve-layaways-modal",
        handleLayaways
      );
      window.removeEventListener("open-retrieve-orders-modal", handleOrders);
    };
  }, [router]);

  // Prefetch sidebar routes for better performance
  useEffect(() => {
    const navItems = sidebarNav.flatMap((entry) =>
      entry.items ? entry.items : [entry]
    );
    navItems.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  // Global service worker registration
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      registerServiceWorker().catch(() => {});
    }
  }, []);

  // Global service worker update listeners and quick actions
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onUpdateAvailable = () => {
      setSwUpdateAvailable(true);
      if (swToastShownRef.current) return;
      swToastShownRef.current = true;
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="font-medium">New version available</span>
            <button
              onClick={async () => {
                await activateUpdateNow();
                setTimeout(() => window.location.reload(), 200);
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 rounded-md bg-blue-600 text-white"
            >
              Update
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700"
            >
              Later
            </button>
          </div>
        ),
        { duration: Infinity, id: "sw-update-available" }
      );
    };

    window.addEventListener("sw-update-available", onUpdateAvailable);
    const detach = listenForSWMessages((msg) => {
      if (msg && msg.type === "SW_ACTIVATED" && swUpdateAvailable) {
        toast.success("Updated. Reloading...");
      }
    });

    return () => {
      window.removeEventListener("sw-update-available", onUpdateAvailable);
      detach && detach();
    };
  }, [swUpdateAvailable]);

  // Proactively check for SW updates on route changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onRoute = async () => {
      // Ask the browser to check sw.js for updates
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
        }
      } catch {}
      // Also use our helper to surface UI if available
      const status = await checkForServiceWorkerUpdate();
      if (status === "update-available" && !swToastShownRef.current) {
        window.dispatchEvent(new CustomEvent("sw-update-available"));
      }
    };
    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
  }, [router.events]);

  useEffect(() => {
    // Only preload data if user is authenticated and not on auth pages
    if (typeof window !== "undefined") {
      const isAuthPage =
        router.pathname === "/login" ||
        router.pathname === "/reset-password" ||
        router.pathname.startsWith("/auth");

      const hasAuth =
        localStorage.getItem("sla_member_session") === "authenticated";

    }
  }, [router.pathname]);

  const breadcrumbs = (() => {
    const path = router.asPath.split("?")[0];
    const segments = path.split("/").filter((s) => s);
    const crumbs = [{ href: "/", label: "Home" }];

    let currentPath = "";
    const navItems = sidebarNav.flatMap((entry) =>
      entry.items ? entry.items : [entry]
    );

    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      const navItem = navItems.find(
        (item) =>
          item &&
          item.href &&
          (item.href === currentPath || item.href.endsWith(`/${segment}`))
      );
      const label = navItem
        ? navItem.label
        : segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({ href: currentPath, label });
    });

    return crumbs;
  })();

  return (
          <LoadingProvider>
            <div
              className={`${mode === "dark" ? "dark" : ""} ${
                nunito.variable
              } font-sans flex flex-col min-h-screen`}
            >
                  <Component
                    {...pageProps}
                    mode={mode}
                    toggleMode={toggleMode}
                    isSidebarOpen={isSidebarOpen}
                  />

              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  style: {
                    zIndex: 999999,
                  },
                  success: {
                    className:
                      "!bg-green-100 !text-green-800 dark:!bg-green-900/30 dark:!text-green-400",
                  },
                  error: {
                    className:
                      "!bg-red-100 !text-red-800 dark:!bg-red-900/30 dark:!text-red-400",
                  },
                  loading: {
                    className:
                      "!bg-blue-100 !text-blue-800 dark:!bg-blue-900/30 dark:!text-blue-400",
                  },
                }}
              />
            </div>
          </LoadingProvider>
  );
}

export default MyApp;
