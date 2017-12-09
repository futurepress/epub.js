import Book from "../book/book";
import { EVENTS } from "../utils/constants";

class BookWorker {
	constructor() {
		self.addEventListener("message", this.onMessage.bind(this));

		this.book = undefined;

	}

	onMessage(event)  {
		let {data} = event;
		if (typeof data === "string") {
			data = JSON.parse(data);
		}

		console.log("[worker]", data);

		switch (data.method) {
			case "init":
				if (data.args.length > 1) {
					this.book = new Book(data.args[0], data.args[1]);
				} else {
					this.book = new Book(data.args[0]);
				}
				this.book.on(EVENTS.BOOK.READY, (manifest) => {
					self.postMessage({eventName: "ready", value: manifest});
				});
				this.book.on(EVENTS.BOOK.OPEN_FAILED, (error) => {
					self.postMessage({eventName: "failed", error: error});
				});
				break;
			case "destroy":
				this.book.destroy();
				self.close();
				break;
			case "spine":
				let result = this.book.spine.toArray();
				this.respond(data.method, result, data.promise);
				break;
			default:
				if (this.book) {
					let result = this.book[data.method].apply(this.book, data.args);
					this.respond(data.method, result, data.promise);
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

new BookWorker();
