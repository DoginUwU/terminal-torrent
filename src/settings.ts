import path from "path";
import os from "os";
import fs from "fs";

export interface SettingsOptions {
  pathDownloads: string;
  torrents: {
    url: string;
    path: string;
    paused?: boolean;
  }[];
}

class Settings {
  public pathSettings = "";
  public pathDownloads = "";

  constructor() {}

  init() {
    this.pathSettings = path.join(os.homedir(), "Documents", "TerminalTorrent");

    if (!fs.existsSync(this.pathSettings)) {
      fs.mkdirSync(this.pathSettings);
      fs.writeFileSync(
        path.join(this.pathSettings, "settings.json"),
        JSON.stringify({
          pathDownloads: path.join(os.homedir(), "Downloads"),
          torrents: [],
        } as SettingsOptions)
      );
    }

    this.pathDownloads = this.getSettings().pathDownloads;
  }

  getSettings(): SettingsOptions {
    return JSON.parse(
      fs.readFileSync(path.join(this.pathSettings, "settings.json")).toString()
    );
  }

  updateSettings(settings: SettingsOptions) {
    const settingsFile = JSON.parse(
      fs.readFileSync(path.join(this.pathSettings, "settings.json")).toString()
    );
    fs.writeFileSync(
      path.join(this.pathSettings, "settings.json"),
      JSON.stringify({ ...settingsFile, ...settings })
    );
    this.pathDownloads = this.getSettings().pathDownloads;
  }
}

export default Settings;
