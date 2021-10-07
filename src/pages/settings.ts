import { terminal } from "terminal-kit";
import fs from "fs";
import App from "..";
import Page from "../libs/page";
import { SettingsOptions } from "../settings";

class Settings extends Page {
  constructor() {
    super("settings");
    this.disableGlobalMenu = true;
  }

  init() {
    this.draw();
  }

  draw() {
    const items = ["Change download path", "Go back"];

    terminal.singleColumnMenu(items, (error, response) => {
      if (error) process.exit();

      switch (response.selectedIndex) {
        case 0:
          this.changeDownloadPath();
          break;
        default:
          App.changePage("dashboard");
      }
    });
  }

  changeDownloadPath() {
    terminal.green(`Enter path (${App.settings.pathDownloads}): `);
    terminal.inputField({}, (err, input) => {
      if (err) process.exit();
      fs.readdir(input, (err) => {
        if (err) {
          terminal.red(`\n${err}\n\n`);
          this.draw();
        } else {
          App.settings.updateSettings({
            pathDownloads: input,
          } as SettingsOptions);
          App.changePage("dashboard");
        }
      });
    });
  }

  update() {}
}

export default Settings;
