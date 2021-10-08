import { terminal } from "terminal-kit";
import Table from "tty-table";
import App from "..";
import {
  formatBytes,
  formatDownloadingTitle,
  formatMilliseconds,
} from "../libs/formatter";
import Page from "../libs/page";

class Dashboard extends Page {
  list: Table.Table;
  torrents: Array<any>

  constructor() {
    super("dashboard");
  }

  init() {
    super.init();
    this.draw();
  }

  update() {
    console.clear();
    this.list.length = 0;
    this.torrents = this.getTorrents();

    if (this.torrents.length === App.settings.getSettings().torrents.length)
      terminal(this.list.render());
    else terminal.yellow("Loading... Please wait...");
  }

  getTorrents() {
    const torrents = App.torrents;

    return (
      torrents.map((torrent, index) => {
        const newTorrent = [
          index.toString(),
          torrent.name,
          formatDownloadingTitle(torrent),
          `${Math.floor(torrent.progress * 100)}%`,
          formatMilliseconds(torrent.timeRemaining),
          formatBytes(torrent.downloaded),
          formatBytes(torrent.uploaded),
          torrent.ratio,
          torrent.numPeers,
        ];
        this.list.push(newTorrent)

        return newTorrent;
      }) || []
    );
  }

  async draw() {
    const header = [
      {
        value: "#",
        width: 5,
      },
      {
        value: "Name",
        width: 35,
      },
      {
        value: "Status",
        width: 15,
      },
      {
        value: "Progress",
        width: 10,
      },
      {
        value: "Time Remaining",
        width: 15,
      },
      {
        value: "Downloaded",
        width: 15,
      },
      {
        value: "Uploaded",
        width: 10,
      },
      {
        value: "Ratio",
        width: 10,
      },
      {
        value: "Seeders",
        width: 10,
      },
    ];

    const options = {
      borderStyle: "solid",
      paddingBottom: 0,
      headerAlign: "center",
      align: "center",
      color: "green",
      truncate: "...",
    };
    // @ts-ignore
    this.list = Table(header, [], options);
  }
}

export default Dashboard;
