import EventEmitter from "event-emitter";
import {defer, isXml, parse} from "./utils/core";
import defaultRequest from "./utils/request";
import mime from "../libs/mime/mime";
import Path from "./utils/path";

const encodeURIComponent = typeof(window) !== "undefined" ?
																window.encodeURIComponent : false;

class Storage {
	constructor(storageMethod, requestMethod) {
		this.storageMethod = storageMethod || "localforage";
		this.onlineRequest = requestMethod || defaultRequest;

		this.urlCache = {};
		this.offline = false;

		this.checkRequirements(this.storageMethod);

	}

	checkRequirements(storageMethod) {
		try {
			if (storageMethod === "localforage" &&
					typeof(localForage) === "undefined") {
				this.store = require("localforage");
			} else if (storageMethod === "localforage") {
				this.store = localforage;
			} else {
				this.store = storageMethod;
			}
		} catch (e) {
			throw new Error("${storageMethod} not loaded");
		}
	}

	put(resources, resolver) {
		var promises = [];
		resources.forEach((asset) => {
			let absolute = resolver(asset);
			let encodedUrl = encodeURIComponent(absolute);

			let stored = this.onlineRequest(absolute, "binary").then((binary) => {
				return this.store.setItem(encodedUrl, binary);
			});
			promises.push(stored);
		});

		let allStored = Promise.all(promises);

		allStored.then(() => this.emit("stored"));

		return allStored;
	}

	token(url, value){
		let encodedUrl = encodeURIComponent(url);
		let response;

		if (value) {
			response = this.store.setItem(encodedUrl, value)
		} else {
			response = this.store.getItem(encodedUrl)
		}

		return response.then(function (result) {
				if (result === null) {
					return false;
				} else {
					return true;
				}
			});
	}

	request(url, type) {
		let encodedUrl = encodeURIComponent(url);

		if (this.offline) {
			return this.retrieve(url, type);
		} else {
			return this.onlineRequest(url, type)
				.then((value) => {
					if (this.offline) {
						this.offline = false;
						this.emit("offline", false);
					}
					return value;
				}).catch((response) => {
					if (response && response.status === 0) {
						this.offline = true;
						this.emit("offline", true);
						console.log("offline");
						return this.retrieve(url, type);
					}
				});
		}
	}

	retrieve(url, type) {
		var deferred = new defer();
		var response;
		var path = new Path(url);

		// If type isn't set, determine it from the file extension
		if(!type) {
			type = path.extension;
		}

		if(type == "blob"){
			response = this.getBlob(url);
		} else {
			response = this.getText(url);
		}

		if (response) {
			response.then(function (r) {
				let result = this.handleResponse(r, type);
				deferred.resolve(result);
			}.bind(this));
		} else {
			deferred.reject({
				message : "File not found in storage: " + url,
				stack : new Error().stack
			});
		}
		return deferred.promise;
	}

	handleResponse(response, type){
		var r;

		if(type == "json") {
			r = JSON.parse(response);
		}
		else
		if(isXml(type)) {
			r = parse(response, "text/xml");
		}
		else
		if(type == "xhtml") {
			r = parse(response, "application/xhtml+xml");
		}
		else
		if(type == "html" || type == "htm") {
			r = parse(response, "text/html");
		 } else {
			 r = response;
		 }

		return r;
	}

	getText(url, mimeType){
		var deferred = new defer();
		var encodedUrl = encodeURIComponent(url);
		var entry = this.store.getItem(encodedUrl);
		console.log("getting", encodedUrl);
		mimeType = mimeType || mime.lookup(url);

		entry.then((data) => {
			if (data) {
				let blob = new Blob([data], {type : mimeType});
				let reader = new FileReader();
				reader.addEventListener("loadend", function() {
					deferred.resolve(reader.result);
				});
				reader.readAsText(blob, mimeType);
			} else {
				deferred.reject({
					message : "File not found in storage: " + url,
					stack : new Error().stack
				});
			}
		}).catch((err) => {
			deferred.reject(err);
		});

		return deferred.promise;
	}

	getBlob(url, mimeType){
		var deferred = new defer();
		var encodedUrl = encodeURIComponent(url);
		var entry = this.store.getItem(encodedUrl);

		mimeType = mimeType || mime.lookup(url);

		entry.then(function(data) {
			if (data) {
				let blob = new Blob([data], {type : mimeType});
				deferred.resolve(blob);
			} else {
				deferred.reject({
					message : "File not found in storage: " + url,
					stack : new Error().stack
				});
			}
		}).catch((err) => {
			deferred.reject(err);
		});

		return deferred.promise;
	}

	/**
	 * Get a base64 encoded result from Archive by Url
	 * @param  {string} url
	 * @param  {[string]} mimeType
	 * @return {string} base64 encoded
	 */
	getBase64(url, mimeType){
		return this.getBlob(url, mimeType)
			.then((blob) => {
				let deferred = new defer();
				let reader = new FileReader();
				reader.onloadend = function() {
					deferred.resolve(reader.result);
				}
				reader.readAsDataURL(blob);
				return deferred.promise;
			});
	}

	createUrl(url, options){
		var deferred = new defer();
		var _URL = window.URL || window.webkitURL || window.mozURL;
		var tempUrl;
		var response;
		var useBase64 = options && options.base64;

		if(url in this.urlCache) {
			deferred.resolve(this.urlCache[url]);
			return deferred.promise;
		}

		if (useBase64) {
			response = this.getBase64(url);

			if (response) {
				response.then(function(tempUrl) {

					this.urlCache[url] = tempUrl;
					deferred.resolve(tempUrl);

				}.bind(this));

			}

		} else {

			response = this.getBlob(url);

			if (response) {
				response.then(function(blob) {

					tempUrl = _URL.createObjectURL(blob);
					this.urlCache[url] = tempUrl;
					deferred.resolve(tempUrl);

				}.bind(this));

			}
		}


		if (!response) {
			deferred.reject({
				message : "File not found in storage: " + url,
				stack : new Error().stack
			});
		}

		return deferred.promise;
	}

	/**
	 * Revoke Temp Url for a stored item
	 * @param  {string} url url of the item in the store
	 */
	revokeUrl(url){
		var _URL = window.URL || window.webkitURL || window.mozURL;
		var fromCache = this.urlCache[url];
		if(fromCache) _URL.revokeObjectURL(fromCache);
	}

}

EventEmitter(Storage.prototype);

export default Storage
