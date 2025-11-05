import { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const LoadingContext = createContext({});

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [activeToasts, setActiveToasts] = useState([]);

  const startLoading = useCallback((message = 'Please wait...') => {
    setLoadingCount(prev => {
      const newCount = prev + 1;
      if (newCount === 1) {
        // Only show toast on first loading state
        const toastId = toast.loading(message, {
          duration: 10000, // 10 seconds max duration
          position: 'top-right',
          style: {
            minWidth: '200px',
          },
        });
        setActiveToasts(prev => [...prev, toastId]);
      }
      return newCount;
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        // Dismiss all active loading toasts
        activeToasts.forEach(toastId => {
          toast.dismiss(toastId);
        });
        setActiveToasts([]);
      }
      return newCount;
    });
  }, [activeToasts]);

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading: loadingCount > 0 }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext;
