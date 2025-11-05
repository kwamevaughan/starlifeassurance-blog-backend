// Service Worker Registration Utility
export const registerServiceWorker = async () => {
  // Only register in browser environment
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported or not in browser environment');
    return null;
  }

  // Disable service worker in development to prevent refresh loops
  if (process.env.NODE_ENV === 'development') {
    console.log('Service Worker disabled in development mode');
    return null;
  }

  try {
    const swUrl = `/sw.js`;

    // Check existing registration and whether scriptURL matches our desired URL
    const existingRegistration = await navigator.serviceWorker.getRegistration();
    const existingUrl = existingRegistration?.active?.scriptURL || existingRegistration?.installing?.scriptURL || existingRegistration?.waiting?.scriptURL || '';

    if (existingRegistration && existingUrl.includes('/sw.js') && existingUrl.endsWith(swUrl)) {
      console.log('Service Worker already registered with current version');
      // Trigger an update check
      try { await existingRegistration.update(); } catch (_) {}
      return existingRegistration;
    }

    // Either not registered yet, or URL changed → register the new one
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/'
    });

    console.log('Service Worker registered successfully:', registration);

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('Service Worker update found');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Only prompt if there is a waiting worker
          const hasWaiting = !!registration.waiting;
          if (hasWaiting) {
            // Dedupe within the same session across reloads
            if (!sessionStorage.getItem('sw_update_prompted')) {
              window.dispatchEvent(new CustomEvent('sw-update-available'));
              sessionStorage.setItem('sw_update_prompted', '1');
            }
          }
        }
      });
    });

    // Handle service worker errors
    registration.addEventListener('error', (error) => {
      console.error('Service Worker registration failed:', error);
    });

    // When controller changes (new SW took control), clear prompt guard
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      try { sessionStorage.removeItem('sw_update_prompted'); } catch {}
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Unregister service worker (for development)
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

// Listen for messages from the service worker
export const listenForSWMessages = (handler) => {
  if (!('serviceWorker' in navigator)) return () => {};
  const messageHandler = (event) => handler(event.data);
  navigator.serviceWorker.addEventListener('message', messageHandler);
  return () => navigator.serviceWorker.removeEventListener('message', messageHandler);
};

// Ask the waiting service worker to activate immediately
export const activateUpdateNow = async () => {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const waiting = registration && registration.waiting;
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Failed to activate update now:', e);
    return false;
  }
};

// Manually check for updates
export const checkForServiceWorkerUpdate = async () => {
  if (typeof window === 'undefined') return 'not-supported';
  if (!('serviceWorker' in navigator)) return 'not-supported';
  if (process.env.NODE_ENV === 'development') return 'disabled-in-dev';
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return 'no-registration';

    await registration.update();

    if (registration.waiting) return 'update-available';
    if (registration.installing) {
      return await new Promise((resolve) => {
        const installing = registration.installing;
        const onChange = () => {
          if (registration.waiting) {
            installing.removeEventListener('statechange', onChange);
            resolve('update-available');
          } else if (installing.state === 'installed') {
            installing.removeEventListener('statechange', onChange);
            resolve('update-available');
          }
        };
        installing.addEventListener('statechange', onChange);
        setTimeout(() => {
          installing.removeEventListener('statechange', onChange);
          resolve('no-update');
        }, 3000);
      });
    }

    return 'no-update';
  } catch (e) {
    console.warn('Failed to check for SW update:', e);
    return 'error';
  }
};

// Check if service worker is supported
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

// Get service worker registration
export const getServiceWorkerRegistration = async () => {
  if ('serviceWorker' in navigator) {
    try {
      return await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Failed to get Service Worker registration:', error);
      return null;
    }
  }
  return null;
};

// Request background sync
export const requestBackgroundSync = async (tag = 'sync-orders') => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('Background sync requested:', tag);
      return true;
    } catch (error) {
      console.error('Background sync request failed:', error);
      return false;
    }
  } else {
    console.log('Background sync not supported');
    return false;
  }
};

// Request push notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }
  return false;
};

// Send push notification
export const sendPushNotification = async (title, body, data = {}) => {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (Notification.permission === 'granted') {
        await registration.showNotification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data
        });
        return true;
      } else {
        console.log('Notification permission not granted');
        return false;
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }
  return false;
};

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  listenForSWMessages,
  activateUpdateNow,
  checkForServiceWorkerUpdate,
  isServiceWorkerSupported,
  getServiceWorkerRegistration,
  requestBackgroundSync,
  requestNotificationPermission,
  sendPushNotification
}; 