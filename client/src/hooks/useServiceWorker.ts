import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Очищаем старые кеши при загрузке
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        });
      }

      window.addEventListener('load', () => {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            // Отменяем регистрацию всех старых Service Workers
            return Promise.all(
              registrations.map((registration) => registration.unregister())
            );
          })
          .then(() => {
            // Регистрируем новый Service Worker
            return navigator.serviceWorker.register('/sw.js');
          })
          .then((registration) => {
            console.log('Service Worker зарегистрирован:', registration);
          })
          .catch((error) => {
            console.log('Ошибка при регистрации Service Worker:', error);
          });
      });
    }
  }, []);
}
