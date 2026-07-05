import { spawn } from "node:child_process";
import fs from "node:fs";

export function openDirectoryInFileManager(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });

  switch (process.platform) {
    case "win32": {
      spawn("explorer.exe", [dirPath], { detached: true, stdio: "ignore" }).unref();
      return;
    }
    case "darwin": {
      spawn("open", [dirPath], { detached: true, stdio: "ignore" }).unref();
      return;
    }
    default: {
      spawn("xdg-open", [dirPath], { detached: true, stdio: "ignore" }).unref();
    }
  }
}
