import { terminal } from "terminal-kit";
import { Torrent } from "webtorrent";
import App, { ExtendedTorrent } from "..";
import Page from "../libs/page";

class EditTorrent extends Page {
  constructor() {
    super("editTorrent");
    this.disableGlobalMenu = true;
  }

  init() {
    if (!App.torrents.length) App.changePage("dashboard");
    else this.draw();
  }

  draw() {
    const drawMenu = this.drawMenu.bind(this);
    terminal.green("Select torrent: ");
    terminal.singleColumnMenu(
      App.torrents.map((t) => t.name),
      function (error, response) {
        if (error) process.exit();

        drawMenu(App.torrents[response.selectedIndex]);
      }
    );
  }

  drawMenu(torrent: ExtendedTorrent) {
    const addPeer = this.addPeer.bind(this);
    const pauseTitle = torrent.destroyed ? "Resume" : "Pause";
    console.clear();
    const items = [pauseTitle, "Remove torrent", "Add peer", "Go back"];

    this.drawInformations(torrent);

    terminal.singleColumnMenu(items, async (error, response) => {
      if (error) process.exit();

      switch (response.selectedIndex) {
        case 0:
          if (torrent.destroyed) {
            console.clear();
            terminal.green("Resuming torrent...");
            await App.addTorrent(torrent.magnetURI, false);
          } else App.destroyTorrent(torrent);

          App.updateTorrentSettings();
          App.changePage("dashboard");
          break;
        case 1:
          App.removeTorrent(torrent.magnetURI);
          App.changePage("dashboard");
          break;
        case 2:
          addPeer(torrent);
          break;
        default:
          App.changePage("dashboard");
          break;
      }
    });
  }

  drawInformations(torrent: Torrent) {
    terminal.green(`Selected torrent: ${torrent.name}\n\n`);
  }

  addPeer(torrent: Torrent) {
    console.clear();
    terminal.green("Enter your peer url: ");
    terminal.inputField({}, (err, input) => {
      if (err) process.exit();

      torrent.addPeer(input);
      this.drawMenu(torrent);
    });
  }

  update() {}
}

export default EditTorrent;
