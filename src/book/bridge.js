import {extend, defer} from "../utils/core";
import { EVENTS } from "../utils/constants";

import Spine from "../book/spine";

/**
 * Book proxy, always responds with promise

 * Promises:
 *  - opened
 *  - ready
 *
 * Objects:
 *  - manifest
 *  - spine
 *  - locations
 *  - navigation
 *  - pagelist
 *  - resources
 *
 * Methods:
 *  - open ✓
 *  - load X (private)
 *  - resolve X (private)
 *  - canonical ?
 *  - section (needs to respond with object?)
 *  - setRequestCredentials X (just set in the options)
 *  - setRequestHeaders X (just set in the options)
 *  - coverUrl (remove this?)
 *  - getRange (not gonna work => mabye move to rendition?)
 *  - key
 *  - toObject
 *  - toJSON
 *  - destroy
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

		console.log("[ask]", str);
		this.worker.postMessage(str);

		return asking.promise;
	}

	listen(event) {
		let {data} = event;
		if (typeof data === "string") {
			data = JSON.parse(data);
		}

		console.log("[listen]", data);

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
					this.resolveReady(event.data.value);
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

	spine() {
		return this.ask("spine");
	}

	destroy() {
		this.ask("destroy");
		this.worker.removeEventListener("message", this.listen);
	}
}

export default Bridge;
