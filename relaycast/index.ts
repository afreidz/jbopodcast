import chokidar from "chokidar";
import * as icons from "./icons";
import RelaySocket from "./relay";
import { spawn } from "child_process";
import CONFIG_FILE from "./configPath";
import SysTray, { Menu, MenuItem } from "systray";

const relay = new RelaySocket();

relay.on("message", ({ event, message }) => {
  if (event === "server-stop") {
    tray.kill();
  } else if (event === "stream-start") {
    tray.sendAction({
      type: "update-menu",
      menu: { ...defaultMenu, icon: icons.on },
      seq_id: 0,
    });
  } else if (event === "stream-stop") {
    tray.sendAction({
      type: "update-menu",
      menu: { ...defaultMenu, icon: icons.off },
      seq_id: 0,
    });
  }
});

const configureItem: MenuItem = {
  title: "Configure",
  tooltip: "Open relay configuration",
  checked: false,
  enabled: true,
};

const quitItem: MenuItem = {
  title: "Quit",
  tooltip: "Quit the relay app",
  checked: false,
  enabled: true,
};

const defaultMenu: Menu = {
  title: "",
  icon: icons.off,
  tooltip: "Relay socket running",
  items: [configureItem, quitItem],
};

const tray = new SysTray({
  debug: false,
  copyDir: true,
  menu: defaultMenu,
});

tray.onClick(async (action) => {
  if (action.item.title === configureItem.title) {
    spawn("open", [CONFIG_FILE], {
      stdio: "inherit",
    });
  } else if (action.item.title === quitItem.title) {
    tray.kill();
  }
});

chokidar.watch(CONFIG_FILE).on("change", async (event, path) => {
  relay.stop();
  await new Promise((r) => setTimeout(r, 1000));
  relay.start();
});

relay.start();
