import Book from "../book/book";

class BookWorker {
  constructor() {
    self.addEventListener("message", this.onMessage.bind(this));
  }

  onMessage(event)  {
    let {data} = event;

    switch (data.method) {
      case "init":
        this.book = new Book(data.args[0], data.args[1]);
        this.book.ready.then((manifest) => {
          self.postMessage({method: "ready", result: manifest});
        })
        break;
      default:
        console.log("msg", data);
    }

  }

}

new BookWorker();
