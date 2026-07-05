const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const moduleDir = path.join(
  root,
  ".next",
  "standalone",
  "node_modules",
  "better-sqlite3",
);
const nativeBinary = path.join(moduleDir, "build", "Release", "better_sqlite3.node");

if (!fs.existsSync(moduleDir)) {
  console.error("未找到 standalone 中的 better-sqlite3，请先运行 npm run build。");
  process.exit(1);
}

const electronVersion = JSON.parse(
  fs.readFileSync(path.join(root, "node_modules/electron/package.json"), "utf8"),
).version;

console.log(`正在为 Electron ${electronVersion} 安装 better-sqlite3 预编译二进制...`);

const beforeStat = fs.existsSync(nativeBinary)
  ? fs.statSync(nativeBinary)
  : null;

execSync(
  `npx prebuild-install --runtime electron --target ${electronVersion} --arch x64 --force`,
  {
    cwd: moduleDir,
    stdio: "inherit",
    shell: true,
  },
);

if (!fs.existsSync(nativeBinary)) {
  console.error("better-sqlite3 原生模块未生成。");
  process.exit(1);
}

const afterStat = fs.statSync(nativeBinary);
if (beforeStat && beforeStat.mtimeMs === afterStat.mtimeMs) {
  console.warn("警告：better_sqlite3.node 时间戳未变化，请确认 Electron 二进制已更新。");
}

console.log("better-sqlite3 Electron 二进制已就绪。");
