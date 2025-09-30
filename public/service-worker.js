// Service Worker pour SynerJ PWA
// Version: 1.0.0

const CACHE_NAME = 'synerj-cache-v1';
const OFFLINE_URL = '/offline.html';

// Fichiers à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des fichiers statiques');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Force le nouveau Service Worker à devenir actif immédiatement
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation en cours...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prendre le contrôle de toutes les pages immédiatement
  return self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP (chrome-extension://, etc.)
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Ignorer les requêtes vers Supabase (API backend)
  if (request.url.includes('supabase.co')) {
    return;
  }
  
  // Pour les navigations HTML (mode navigate ou requêtes HTML)
  if (request.mode === 'navigate' || 
      request.headers.get('accept')?.includes('text/html')) {
    
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache la réponse
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline : essayer le cache, sinon offline.html
          console.log('[Service Worker] Navigation hors ligne détectée');
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Page HTML depuis le cache');
              return cachedResponse;
            }
            console.log('[Service Worker] Affichage de offline.html');
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }
  
  // Pour les autres ressources (JS, CSS, images, etc.)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache si succès
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Chercher dans le cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Réponse depuis le cache:', request.url);
            return cachedResponse;
          }
          
          // Ressource non disponible
          return new Response('Contenu non disponible hors ligne', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Gestion des messages (pour communication avec l'app)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});