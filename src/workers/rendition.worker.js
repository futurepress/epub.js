let CACHES = {
  resources: 'epubjs-resources'
};
const DEV = false;

self.addEventListener('install', function(event) {
  DEV && console.log('[install] Kicking off service worker registration!');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return the response from the cached version
        if (response) {
          DEV && console.log(
            '[fetch] Returning from Service Worker cache: ',
            event.request.url,
            response.ok
          );
          return response;
        }

        // Not in cache - return the result from the live server
        DEV && console.log('[fetch] Returning from server: ', event.request.url);
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  // Claim the service work for this client, forcing `controllerchange` event
  DEV && console.log('[activate] Claiming this service worker!');

  event.waitUntil(
    clients.claim().then(function() {
      // After the activation and claiming is complete, send a message to each of the controlled
      // pages letting it know that it's active.
      // This will trigger navigator.serviceWorker.onmessage in each client.
      return self.clients.matchAll().then(function(clients) {
        return Promise.all(clients.map(function(client) {
          return client.postMessage({ msg: 'active' });
        }));
      });
    })
  );

});

self.addEventListener('message', function(event) {
  DEV && console.log('[msg]', event.data);

  if (event.data.method === "add") {
    let resources = event.data.resources;
    let key = event.data.key || CACHES['resources'];
    if (!key in CACHES) {
      CACHES[key] = key;
    }
    // Open the given cache with the keys
    let added = caches.open(CACHES[key]).then((cache) => {
      // Process each item in the resources
      let mapped = resources.map((item) => {
        let href = item.href;
        // Check if the href is already cached
        return cache.match(href).then((response) => {
          if (!response) {
            // If not found, fetch the resource and store it
            let request = new Request(href, {mode: 'no-cors'});
            return fetch(request).then(function(response) {
              if (response.ok) {
                return cache.put(href, response);
              }
            });
         }
        });
      });
      return Promise.all(mapped);
    });

    event.waitUntil(added);
  }

  if (event.data.method === "remove") {

  }

  if (event.data.method === "test") {
    caches.open(event.data.key).then((cache) => {
      console.log(cache);
    });
  }
});
