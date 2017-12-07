class Bridge {
	constructor(workerUrl) {
		this.ready = new Promise((resolve, reject) => {
			this.resolveReady = resolve;
			this.rejectReady = reject;
		})

		this.worker = new Worker(workerUrl);
		// let absoluteUrl = new URL(url, window.location.href).toString();

		this.worker.addEventListener("message", (event) => {
			switch (event.data.method) {
				case "ready":
					this.resolveReady(event.data.result);
					break;
				default:
					console.log("[bridge]", event.data);
			}
		});

	}

  open(url, options) {
    this.worker.postMessage({ method: "init", args: [url, options] });
  }


	destroy() {

	}
}

export default Bridge;
