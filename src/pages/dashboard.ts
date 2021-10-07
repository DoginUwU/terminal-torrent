import { terminal } from "terminal-kit";
import Table from "tty-table";
import App from "..";
import {
  formatBytes,
  formatDownloadingTitle,
  formatMilliseconds,
} from "../libs/formatter";
import { CreateMenu } from "../libs/menu";
import Page from "../libs/page";

class Dashboard extends Page {
  list: Table.Table;

  constructor() {
    super("dashboard");
  }

  init() {
    this.draw();
  }

  update() {
    console.clear();
    this.list.forEach(() => {
      this.list.pop();
    });
    this.getTorrents().forEach((torrent) => {
      if (this.list.some((item) => item[0] === torrent[0])) return;
      this.list.push(torrent);
    });
    if (
      this.getTorrents().length === App.settings.getSettings().torrents.length
    )
      terminal(this.list.render());
    else terminal.yellow("Loading... Please wait...");
  }

  getTorrents() {
    const torrents = App.torrents;

    return (
      torrents.map((torrent, index) => {
        return [
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
