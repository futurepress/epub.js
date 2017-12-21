import {extend, defer} from "../utils/core";
import { EVENTS } from "../utils/constants";
import Book from "../book/book";

const DEV = false;
/**
 * Book proxy
 */
class Bridge {
	constructor(url, options) {
		this.waiting = {};

		this.ready = new Promise((resolve, reject) => {
			this.resolveReady = resolve;
			this.rejectReady = reject;
		})

		this.worker = new Worker(options.worker);

		this.worker.addEventListener("message", this.listen.bind(this));

		if (url) {
			this.ask("init", [url, options]);
		} else {
			this.ask("init", [options]);
		}
	}

	ask(method, args) {
		let asking = new defer();
		let promiseId = asking.id;

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
					this.resolveReady(this.book, this.manifest);
					break;
				case "failed":
					this.rejectReady(event.data.error);
					break;
			}
		}
	}

	open(url) {
		return this.ask("open", [url]);
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

	destroy() {
		this.ask("destroy");
		this.worker.removeEventListener("message", this.listen);
	}
}

export default Bridge;
