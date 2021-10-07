import { terminal } from "terminal-kit";
import { Torrent } from "webtorrent";
import App from "..";
import Page from "../libs/page";

class EditTorrent extends Page {
  constructor() {
    super("editTorrent");
    this.disableGlobalMenu = true;
  }

  init() {
    if (!App.torrents.length) App.changePage("dashboard");
    this.draw();
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

  drawMenu(torrent: Torrent) {
    const addPeer = this.addPeer.bind(this);
    const pauseTitle = torrent.paused ? "Resume" : "Pause";
    console.clear();
    const items = [pauseTitle, "Remove torrent", "Add peer", "Go back"];

    this.drawInformations(torrent);

    terminal.singleColumnMenu(items, (error, response) => {
      if (error) process.exit();

      switch (response.selectedIndex) {
        case 0:
          if (torrent.paused) torrent.resume();
          else torrent.pause();
          App.updateTorrentSettings();
          this.drawMenu(torrent);
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
