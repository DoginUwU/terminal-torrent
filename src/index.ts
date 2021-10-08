#!/usr/bin/env node
import { terminal } from "terminal-kit";
import WebTorrent, { Torrent } from "webtorrent";
import fs, {promises as fsPromise} from "fs";
import parseTorrent from "parse-torrent";
import { CreateMenu } from "./libs/menu";
import Page from "./libs/page";
import Settings, { SettingsOptions } from "./settings";
import path from "path";
import { limitProcessMemory } from "./utils/memory_limiter";

type pagesType = "dashboard" | "addTorrent" | "editTorrent" | "settings";

export interface ExtendedTorrent extends Torrent {
  destroyed?: boolean;
}

export default class App {
  static pages: Array<Page> = [];
  static page: Page;
  static webtorrent = new WebTorrent({ utp: false, maxConns: 40, tracker: {
    wrtc: false
  } });
  static torrents: Array<ExtendedTorrent> = [];
  static settings = new Settings();

  constructor() {
    const args = process.argv.slice(2);
    console.clear();
    if (!args[0]) {
      terminal.red("Please, use terminal in fullscreen\n");
      terminal.white("Initializing Terminal Torrent...\n\n");
      terminal.green("Press CTRL+O to open menu\n");
      terminal.green("Press CTRL+C to exit\n");
      setTimeout(() => this.init(), 5000);
    } else {
      this.fileAssociation(args[0]);
    }
  }

  async fileAssociation(path: string) {
    await this.init();
    if (!fs.existsSync(path)) return;

    const infoHash = parseTorrent(fs.readFileSync(path)).infoHash;

    const uri = parseTorrent.toMagnetURI({
      infoHash,
    });
    App.changePage("addTorrent", uri);
  }

  public async init() {
    App.settings.init();

    await Promise.all(
      App.settings.getSettings().torrents.map(async (torrent) => {
        return await App.addTorrent(torrent.url);
      })
    );

    const files = await fsPromise.readdir(path.join(__dirname, "pages"))
    await Promise.all(files.map(async (file) => {
      const Page = await import(`./pages/${file}`);
      const page = new Page.default;
      App.pages.push(page);
    }));

    this.handleInputs();
    App.changePage("dashboard");
    App.webtorrent.on("error", () => {});
  }

  public static addTorrent(url: string) {
    return new Promise((resolve, reject) => {
      const path = App.settings.pathDownloads;
      this.webtorrent.add(url, { path }, (torrent) => {
        this.torrents = this.torrents.filter((t) => t.magnetURI !== torrent.magnetURI);
        this.torrents.push(torrent);
        this.updateTorrentSettings();

        resolve(true);
      });
      this.webtorrent.on("error", () => {
        reject(false);
      });
    });
  }

  static updateTorrentSettings() {
    const torrents = this.torrents.map((torrent) => {
      return {
        url: torrent.magnetURI,
        path: `${torrent.path}\\${torrent.name}`,
        paused: torrent.paused,
      };
    });

    this.settings.updateSettings({
      torrents,
    } as SettingsOptions);
  }

  public static destroyTorrent(torrent: Torrent) {
    this.webtorrent.remove(torrent.magnetURI);
    this.torrents = this.torrents.map((t) => {
      if (t.magnetURI === torrent.magnetURI) t.destroyed = true;

      return t;
    });
  }

  public static removeTorrent(torrentId: string) {
    try {
      this.webtorrent.remove(torrentId);
    } catch (error) {}
    this.torrents = this.torrents.filter(
      (torrent) => torrent.magnetURI !== torrentId
    );
    this.updateTorrentSettings();
  }

  public static changePage(name: pagesType, props?: any) {
    if (!!this.page) this.page.destroy();

    this.page = this.pages.find((page) => page.name === name);

    this.page.init(props);
  }

  public openGlobalMenu() {
    if (App.page.disableGlobalMenu) return;

    App.page.blockUpdate = true;
    CreateMenu();
  }

  public handleInputs() {
    terminal.grabInput({ mouse: "button" });

    terminal.on("key", (name: string) => {
      switch (name) {
        case "CTRL_O":
        case "CTRL_Q":
          this.openGlobalMenu();
          break;
        case "CTRL_C":
          App.exit();
          break;
      }
    });
  }

  static exit() {
    this.updateTorrentSettings();
    console.clear();
    process.exit();
  }
}

limitProcessMemory(3000, 1e+9, () => new App(), () => App.exit())
