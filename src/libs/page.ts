abstract class Page {
  name: string;
  interval: any;
  blockUpdate = false;
  disableGlobalMenu = false;

  constructor(name: string) {
    process.stdout.write("\u001b[2J\u001b[0;0H");
    this.name = name;
    this.interval = setInterval(() => {
      if (!this.blockUpdate) this.update();
    }, 500);
  }
  abstract init(): void;
  abstract draw(): void;
  abstract update(): void;
  destroy() {
    clearInterval(this.interval);
  }
}

export default Page;
