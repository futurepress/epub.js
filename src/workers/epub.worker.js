import Epub from "../epub/epub";
import { EVENTS } from "../utils/constants";
import JSZip from "jszip/dist/jszip";
import mime from "../../libs/mime/mime";

const DEV = false;

let CACHES = {
	resources: 'epubjs-resources'
};

class EpubWorker {
	constructor() {
		self.addEventListener("message", this.onMessage.bind(this));

		self.addEventListener('install', this.onInstall.bind(this));
		self.addEventListener('fetch', this.onFetch.bind(this));
		self.addEventListener('activate', this.onActivate.bind(this));

		this.epub = undefined;
	}

	onInstall(event) {
		DEV && console.log('[install] Kicking off service worker registration!');
		event.waitUntil(self.skipWaiting());
	}

	onActivate(event) {
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
	}

	onFetch(event) {
		event.respondWith(
			caches.match(event.request)
				.then((response) => {
					// Cache hit - return the response from the cached version
					if (response) {
						DEV && console.log(
							'[fetch] Returning from Service Worker cache: ',
							event.request.url,
							response.ok
						);
						return response;
					}

					let fromZip = event.request.url.indexOf("epubjs-zip/");
					if (fromZip > -1) {
						return this.loadFromZip(event.request);
					}

					let fromProxy = event.request.url.indexOf("epubjs-proxy/");
					if (fromProxy > -1) {
						return this.loadFromProxy(event.request);
					}

					// Not in cache - return the result from the live server
					DEV && console.log('[fetch] Returning from server: ', event.request.url);
					return fetch(event.request);
				}
			)
		);
	}

	onMessage(event)  {
		let {data} = event;
		if (typeof data === "string") {
			data = JSON.parse(data);
		}

		DEV && console.log("[worker]", data);

		switch (data.method) {
			case "init":
				this.init(data);
				break;
			case "destroy":
				this.epub && this.epub.destroy();
				self.close();
				break;
			case "add":
				this.add(event);
				break;
			case "open":
				if (this.epub) {
					this.epub.open.apply(this.epub, data.args).then((book) => {
						let manifest = book.toJSON();
						this.respond(data.method, manifest, data.promise);
					});
				}
				break;
			default:
				if (this.epub) {
					let r = this.epub[data.method].apply(this.epub, data.args);
					Promise.resolve(r).then((result) => {
						if (typeof result.toJSON === "function") {
							result = result.toJSON();
						}
						this.respond(data.method, result, data.promise);
					})
				}
			}

	}

	respond(method, result, promise, asJson) {
		let response = {
			method: method,
			promise: promise,
			value: result
		};

		if (asJson) {
			response = JSON.stringify(response);
		}

		self.postMessage(response);
	}


	init(data) {
		let options, url;

		if (data.args.length > 1) {
			url = data.args[0];
			options = data.args[1];
		} else {
			options = data.args[0];
		}

		if (typeof(options.cache) === "undefined") {
			options.cache = true;
		}

		if (url) {
			this.epub = new Epub(url, options);
		} else {
			this.epub = new Epub(options);
		}

		this.epub.on(EVENTS.BOOK.READY, (manifest) => {
			self.postMessage({eventName: "ready", value: manifest });
		});
		this.epub.on(EVENTS.BOOK.OPEN_FAILED, (error) => {
			self.postMessage({eventName: "failed", error: error.message });
		});
	}

	add(event) {
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

	loadFromZip(originalRequest) {
		let divider = "epubjs-zip/";
		let start = originalRequest.url.indexOf(divider) + divider.length;
		let chunks = originalRequest.url.substring(start).split("/");
		let cacheName = chunks.shift();
		let url = decodeURIComponent(cacheName);
		let path = decodeURIComponent(chunks.join("/"));
		let mimeType = "text/plain";
		let entry;

		if (this.zip) {
			entry = this.zip.file(path);
			mimeType = mime.lookup(entry.name);

			return entry.async("arraybuffer").then((file) => {
					let zipResponse = new Response(file, {
						"status" : 200,
						"headers": { 'Content-Type': mimeType }
					});
					let zipResponseClone = zipResponse.clone();
					caches.open(cacheName).then((cache) => {
						return cache.put(originalRequest.url, zipResponseClone);
					}).then(() => {
						console.log("from cached zip");
					});
					return zipResponse;
				});

		} else {
			this.zip = new JSZip();
			return fetch(url).then((epubResponse) => {
				return epubResponse.arrayBuffer();
			}).then((buffer) => {
				return this.zip.loadAsync(buffer);
			}).then(() => {
				entry = this.zip.file(path);
				mimeType = mime.lookup(entry.name);
				return entry.async("arraybuffer");
			}).then((file) => {
				let zipResponse = new Response(file, {
					"status" : 200,
					"headers": { 'Content-Type': mimeType }
				});
				let zipResponseClone = zipResponse.clone();
				caches.open(cacheName).then((cache) => {
					return cache.put(originalRequest.url, zipResponseClone);
				}).then(() => {
					console.log("loaded from zip & cached");
				});
				return zipResponse;
			});
		}
	}

	loadFromProxy(originalRequest) {
		let divider = "epubjs-proxy/";
		let start = originalRequest.url.indexOf(divider) + divider.length;
		let chunks = originalRequest.url.substring(start).split("/");

		let cacheName = chunks.shift();
		let url = decodeURIComponent(cacheName);
		let path = decodeURIComponent(chunks.join("/"));
		let mimeType = mime.lookup(chunks[chunks.length - 1]);
		let entry;

		return fetch(url + "/" + path).then((fromProxy) => {
			return fromProxy.arrayBuffer();
		}).then((file) => {
			let proxyResponse = new Response(file, {
				"status" : 200,
				"headers": { 'Content-Type': mimeType }
			});
			let proxyResponseClone = proxyResponse.clone();
			caches.open(cacheName).then((cache) => {
				return cache.put(originalRequest.url, proxyResponseClone);
			});
			return proxyResponse;
		});
	}
}

new EpubWorker();
