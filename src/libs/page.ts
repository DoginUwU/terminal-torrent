import { terminal } from "terminal-kit";

abstract class Page {
  name: string;
  interval: NodeJS.Timer;
  initialized = false;
  blockUpdate = false;
  disableGlobalMenu = false;

  constructor(name: string) {
    this.name = name;
  }
  public init(props?: any) {
    this.initialized = true;
    this.blockUpdate = false;
    console.clear();
    terminal.yellow("Loading... Please wait...");

    this.interval = setInterval(() => {
      if (!this.blockUpdate && this.initialized) this.update();
    }, 1500);
  }
  abstract draw(): void;
  abstract update(): void;
  destroy() {
    clearInterval(this.interval);
    this.interval.unref();
  }
}

export default Page;
