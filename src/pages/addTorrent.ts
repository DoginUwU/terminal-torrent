import { terminal } from "terminal-kit";
import App from "..";
import Page from "../libs/page";

class AddTorrent extends Page {
  constructor() {
    super("addTorrent");
    this.disableGlobalMenu = true;
  }

  init() {
    this.draw();
  }

  draw() {
    terminal.green("Enter your magnet link: ");
    terminal.inputField({}, (err, input) => {
      if (err) process.exit();
      this.addTorrent(input);
      App.changePage("list");
    });
  }

  addTorrent(url: string) {
    if (!url.length) {
      App.changePage("list");
      return;
    }
    App.addTorrent(url)
      .then(() => {
        App.changePage("list");
      })
      .catch(() => {
        terminal.red("Torrent not founded!");
      });
  }

  update() {}
}

export default AddTorrent;
