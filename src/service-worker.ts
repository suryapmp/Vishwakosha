/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any;
};

// STEP 1 — Add Cache Versioning
// This satisfied the user's specific request for a visible CACHE_NAME
const CACHE_NAME = "vishwakosha-cache-v1";

// Inject manifest - REQUIRED by vite-plugin-pwa in injectManifest mode
// This handles the robust caching of assets built by Vite
precacheAndRoute(self.__WB_MANIFEST);

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline-dictionary.json"
];

// Install event: Cache core files (Manual backup as requested)
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing Version", CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching Core Assets");
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// Activate event: Cleanup old caches (Automatic removal as requested)
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && !cache.startsWith('workbox-precache')) {
            console.log("Service Worker: Clearing Old Cache", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: Network first, then cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, clone and store in cache
        if (event.request.method === "GET") {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request).then((res) => {
          if (res) return res;
          // If the word isn't in cache, user might see an error or placeholder
          return new Response("Offline Content Not Available");
        });
      })
  );
});

// Message listener for skipWaiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
