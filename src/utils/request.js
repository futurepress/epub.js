import {defer, isXml, parse} from "./core.js";
import { extension } from "./url.js";

function request(url, type, options={}) {
	let settings = {
		method: 'GET',
		headers: options.headers,
		credentials: options.credentials
	};

	// If type isn"t set, determine it from the file extension
	if(!type) {
		type = extension(url);
	}

	return fetch(url, settings)
		.then(function(response) {
			let deferred = new defer();
			if(response.ok) {
				return response;
			} else if (response.status === 403) {
				deferred.reject({
					status: this.response.status,
					response: this.response.response,
					message : "Forbidden",
					stack : new Error().stack
				});
				return deferred.promise;
			} else {
				deferred.reject({
					status: response.status,
					message : "Empty Response",
					stack : new Error().stack
				});
				return deferred.promise;
			}
		})
		.then(function(response) {
			if(isXml(type)){
				return response.text();
			} else if(type == "xhtml"){
				return response.text();
			} else if(type == "html" || type == "htm"){
				return response.text();
			} else if(type == "json"){
				return response.json();
			} else if(type == "blob"){
				return response.blob();
			} else if(type == "binary"){
				return response.arrayBuffer();
			} else {
				return response.text();
			}
		})
		.then(function(result) {
			let r;

			if(isXml(type)){
				r = parse(result, "text/xml");
			} else if(type === "xhtml"){
				r = parse(result, "application/xhtml+xml");
			} else if(type === "html" || type === "htm"){
				r = parse(result, "text/html");
			} else if(type === "json"){
				r = result;
			} else if(type === "blob"){
				r = result;
			} else {
				r = result;
			}

			return r;
		});
}

export default request;
