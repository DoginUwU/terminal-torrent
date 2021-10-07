import { Torrent } from "webtorrent";

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, "0");

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const formatMilliseconds = (milli: number) => {
  let time = new Date(milli);
  let hours = zeroPad(time.getUTCHours(), 2);
  let minutes = zeroPad(time.getUTCMinutes(), 2);

  return `${hours}:${minutes}`;
};

const formatDownloadingTitle = (torrent: Torrent) => {
  if (torrent.progress === 1) {
    if (torrent.paused) return "Done";

    return "Seeding";
  }

  if (torrent.paused) return "Paused";
  else return "Downloading";
};

export { formatBytes, formatMilliseconds, formatDownloadingTitle };
