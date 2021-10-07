#!/usr/bin/env node
import { EventEmitter } from "stream";
import { terminal } from "terminal-kit";
import WebTorrent, { Torrent } from "webtorrent";
import fs from "fs";
import parseTorrent from "parse-torrent";
import { CreateMenu } from "./libs/menu";
import Page from "./libs/page";
import { addTorrent, editTorrent, dashboard, settings } from "./pages";
import Settings, { SettingsOptions } from "./settings";

type pagesType = "dashboard" | "addTorrent" | "editTorrent" | "settings";

export default class App {
  static page: Page;
  static webtorrent = new WebTorrent();
  static torrents: Array<Torrent> = [];
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
    if (!fs.existsSync(path)) {
      await this.init();
      return;
    }
    await this.init();

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
        return await App.addTorrent(torrent.url, torrent.paused);
      })
    );

    this.handleInputs();
    App.changePage("dashboard");
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

  public static removeTorrent(torrentId: string) {
    this.webtorrent.remove(torrentId);
    this.torrents = this.torrents.filter(
      (torrent) => torrent.magnetURI !== torrentId
    );
    this.updateTorrentSettings();
  }

  public static changePage(name: pagesType, props?: any) {
    terminal.clear();
    terminal.eraseDisplay();
    if (!!this.page) this.page.destroy();

    switch (name) {
      case "addTorrent":
        this.page = new addTorrent(props);
        break;
      case "dashboard":
        this.page = new dashboard();
        break;
      case "editTorrent":
        this.page = new editTorrent();
        break;
      case "settings":
        this.page = new settings();
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

EventEmitter.defaultMaxListeners = 1000;
new App();
