import {extend, defer} from "../utils/core";
import { EVENTS } from "../utils/constants";
import Book from "../book/book";
import Epub from "./epub";

const DEV = false;
/**
 * Book proxy
 */
class Bridge {
	constructor(options) {
		this.waiting = {};

		this.ready = new Promise((resolve, reject) => {
			this.resolveReady = resolve;
			this.rejectReady = reject;
		})

		if (options && options.worker) {
			this.worker = new Worker(options.worker);
			this.worker.addEventListener("message", this.listen.bind(this));

			this.ask("init", [options]);
		}

	}

	ask(method, args) {
		let asking = new defer();
		let promiseId = asking.id;

		if (this.worker) {
			let str = JSON.stringify({
				method: method,
				args: args,
				promise: promiseId
			});

			if(method in this.waiting) {
				this.waiting[promiseId].push(asking);
			} else {
				this.waiting[promiseId] = [asking];
			}

			DEV && console.log("[ask]", str);
			this.worker.postMessage(str);
		} else {
			asking.resolve(this.epub[method].apply(this.epub, args))
		}


		return asking.promise;
	}

	listen(event) {
		let {data} = event;
		if (typeof data === "string") {
			data = JSON.parse(data);
		}

		DEV && console.log("[listen]", data);

		// Promises
		if (data.promise && data.promise in this.waiting) {
			let p = this.waiting[data.promise].shift();
			if (p) {
				p.resolve(data.value);
			}
		}

		// Events
		if (data.eventName) {
			switch (data.eventName) {
				case "ready":
					this.manifest = event.data.value;
					this.book = new Book(this.manifest);
					this.resolveReady(this.book);
					break;
				case "failed":
					this.rejectReady(event.data.error);
					break;
			}
		}
	}

	open(url) {
		return this.ask("open", [url]).then((result) => {
			if (typeof result === "string") {
				this.manifest = JSON.parse(result);
				this.book = new Book(this.manifest);
			} else {
				this.book = result;
			}

			this.resolveReady(this.book);
			return this.book;
		});
	}

	key(identifier) {
		return this.ask("key", [identifier]);
	}

	replacements() {
		return this.ask("replacements").then((manifest) => {
			this.manifest = manifest;
			this.book = new Book(this.manifest);
			return this.book;
		});
	}

	cache() {
		return this.ask("cache").then((manifest) => {
			this.manifest = manifest;
			this.book = new Book(this.manifest);
			return this.book;
		});
	}

	locations() {
		return this.ask("replacements").then((manifest) => {
			this.manifest = manifest;
			this.book = new Book(this.manifest);
			return this.book;
		});
	}

	generateLocations(breakPoint) {
		return this.ask("generateLocations", [breakPoint])
			.then((locations) => {
				if (!this.book) {
					return;
				}
				this.book.locations = locations;
				return locations
			});
	}

	loadLocations(json) {
		let locations;
		if (!this.book) {
			return;
		}

		if (typeof locations === "string") {
			locations = JSON.parse(json);
		} else {
			locations = json;
		}

		this.book.locations = locations;
	}

	destroy() {
		this.ask("destroy");
		this.worker.removeEventListener("message", this.listen);
	}
}

export default Bridge;
