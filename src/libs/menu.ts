import { terminal } from "terminal-kit";
import App from "..";

const CreateMenu = () => {
  const items = [
    "Dashboard",
    "Add new torrent",
    "Edit torrent",
    "Settings",
    "Help",
    "Exit",
  ];

  const options = {
    y: terminal.height - 1,
    style: terminal.inverse,
    selectedStyle: terminal.dim.blue.bgGreen,
  };

  terminal.singleLineMenu(items, options, (error, response) => {
    if (error) process.exit();

    switch (response.selectedIndex) {
      case 0:
        App.changePage("dashboard");
        break;
      case 1:
        App.changePage("addTorrent");
        break;
      case 2:
        App.changePage("editTorrent");
        break;
      case 3:
        App.changePage("settings");
        break;
      case 5:
        App.exit();
    }
    App.page.blockUpdate = false;
  });
};

export { CreateMenu };
