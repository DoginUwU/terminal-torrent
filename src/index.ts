#!/usr/bin/env node
import { terminal } from "terminal-kit";
import WebTorrent, { Torrent } from "webtorrent";
import { CreateMenu } from "./libs/menu";
import Page from "./libs/page";
import { addTorrent, editTorrent, list } from "./pages";
import Settings, { SettingsOptions } from "./settings";

type pagesType = "list" | "addTorrent" | "editTorrent";

export default class App {
  static page: Page;
  static webtorrent = new WebTorrent();
  static torrents: Array<Torrent> = [];
  static settings = new Settings();

  constructor() {
    console.clear();
    terminal.red("Please, use terminal in fullscreen\n");
    terminal.white("Initializing Terminal Torrent...\n\n");
    terminal.green("Press CTRL+O to open menu\n");
    terminal.green("Press CTRL+C to exit\n");
    setTimeout(() => this.init(), 8000);
  }

  public init() {
    App.settings.init();
    this.handleInputs();

    App.settings.getSettings().torrents.forEach((torrent) => {
      App.addTorrent(torrent.url, torrent.paused);
    });

    App.changePage("list");
    App.webtorrent.on("error", () => {});
  }

  public static addTorrent(url: string, paused?: boolean) {
    return new Promise((resolve, reject) => {
      const path = App.settings.pathDownloads;
      this.webtorrent.add(url, { path }, (torrent) => {
        if (paused) torrent.pause();
        this.torrents.push(torrent);
        this.updateTorrentSettings();

        if (torrent.name) resolve(true);
        else reject(false);
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

  public static removeTorrent(torrentId: string) {
    this.webtorrent.remove(torrentId);
    this.torrents = this.torrents.filter(
      (torrent) => torrent.magnetURI !== torrentId
    );
    this.updateTorrentSettings();
  }

  public static changePage(name: pagesType) {
    terminal.clear();
    terminal.eraseDisplay();
    if (!!this.page) this.page.destroy();

    switch (name) {
      case "addTorrent":
        this.page = new addTorrent();
        break;
      case "list":
        this.page = new list();
        break;
      case "editTorrent":
        this.page = new editTorrent();
        break;
    }

    this.page.init();
  }

  public openGlobalMenu() {
    if (App.page.disableGlobalMenu) return;

    App.page.blockUpdate = true;
    CreateMenu();
  }

  public handleInputs() {
    terminal.grabInput({ mouse: "button" });

    terminal.on("key", (name) => {
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

new App();
