import Epub from "../epub/epub";
import { EVENTS } from "../utils/constants";
const DEV = false;

class EpubWorker {
	constructor() {
		self.addEventListener("message", this.onMessage.bind(this));

		this.epub = undefined;
		this.book = undefined;

	}

	onMessage(event)  {
		let {data} = event;
		if (typeof data === "string") {
			data = JSON.parse(data);
		}

		DEV && console.log("[worker]", data);

		switch (data.method) {
			case "init":
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

				this.epub.on(EVENTS.BOOK.READY, (book, manifest) => {
					this.book = book;
					self.postMessage({eventName: "ready", value: manifest });
				});
				this.epub.on(EVENTS.BOOK.OPEN_FAILED, (error) => {
					self.postMessage({eventName: "failed", error: error.message });
				});
				break;
			case "destroy":
				this.epub && this.epub.destroy();
				this.book && this.book.destroy()
				self.close();
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
}

new EpubWorker();
