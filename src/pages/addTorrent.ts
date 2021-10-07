import { terminal } from "terminal-kit";
import App from "..";
import { sleep } from "../libs/others";
import Page from "../libs/page";

class AddTorrent extends Page {
  uri?: string;

  constructor(uri?: string) {
    super("addTorrent");
    this.disableGlobalMenu = true;
    this.uri = uri;
  }

  init() {
    this.draw();
  }

  draw() {
    terminal.green("Enter your magnet link: ");
    terminal.inputField(
      {
        default: this.uri,
      },
      (err, input) => {
        if (err) process.exit();
        console.clear();
        this.addTorrent(input);
      }
    );
  }

  async addTorrent(url: string) {
    if (!url.length) {
      App.changePage("dashboard");
      return;
    }
    await Promise.resolve(App.addTorrent(url))
      .then(() => {
        App.changePage("dashboard");
      })
      .catch(async () => {
        terminal.red("Torrent not founded... returning to dashboard");
        await sleep(5000);
        App.changePage("dashboard");
      });
  }

  update() {}
}

export default AddTorrent;
