const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standaloneDir, "public");

if (!fs.existsSync(standaloneDir)) {
  console.error("未找到 .next/standalone，请先运行 npm run build。");
  process.exit(1);
}

function copyDirectory(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });

  if (process.platform === "win32") {
    fs.mkdirSync(destination, { recursive: true });
    try {
      execSync(
        `robocopy "${source}" "${destination}" /MIR /NFL /NDL /NJH /NJS /NC /NS`,
        { stdio: "inherit", shell: true },
      );
    } catch (error) {
      const exitCode = error.status;
      if (typeof exitCode === "number" && exitCode >= 8) {
        throw error;
      }
    }
    return;
  }

  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true, force: true });
  }
  fs.cpSync(source, destination, { recursive: true });
}

function removeDevWorkspaceCopy() {
  const workspaceDir = path.join(standaloneDir, "_workspace");
  if (fs.existsSync(workspaceDir)) {
    fs.rmSync(workspaceDir, { recursive: true, force: true });
    console.log("已移除 standalone 中的开发 _workspace 目录。");
  }
}

function removeNestedPackagingArtifacts() {
  const releaseDir = path.join(standaloneDir, "release");
  if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
    console.log("已移除 standalone 中误打包的 release 目录。");
  }
}

function patchAbsolutePaths() {
  const variants = new Set([
    root,
    root.replace(/\\/g, "/"),
    root.replace(/\\/g, "\\\\"),
  ]);

  const files = [
    path.join(standaloneDir, "server.js"),
    path.join(standaloneDir, ".next", "required-server-files.json"),
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;

    let content = fs.readFileSync(file, "utf8");
    for (const variant of variants) {
      content = content.split(variant).join(".");
    }
    fs.writeFileSync(file, content, "utf8");
  }

  console.log("已修正 standalone 中的绝对路径引用。");
}

function findBetterSqliteAlias() {
  const chunksDir = path.join(standaloneDir, ".next", "server", "chunks");
  if (!fs.existsSync(chunksDir)) return null;

  for (const file of fs.readdirSync(chunksDir)) {
    if (!file.endsWith(".js")) continue;
    const content = fs.readFileSync(path.join(chunksDir, file), "utf8");
    const match = content.match(/better-sqlite3-[a-f0-9]{16}/);
    if (match) return match[0];
  }

  return null;
}

function ensureBetterSqliteAlias() {
  const aliasName = findBetterSqliteAlias();
  if (!aliasName) {
    console.warn("未找到 better-sqlite3 别名模块，跳过 alias 创建。");
    return null;
  }

  const aliasDir = path.join(standaloneDir, "node_modules", aliasName);
  fs.mkdirSync(aliasDir, { recursive: true });
  fs.writeFileSync(
    path.join(aliasDir, "package.json"),
    JSON.stringify(
      {
        name: aliasName,
        main: "../better-sqlite3/lib/index.js",
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`已创建 ${aliasName} 模块别名。`);
  return aliasName;
}

function patchBetterSqliteRequires() {
  const chunksDir = path.join(standaloneDir, ".next", "server", "chunks");
  if (!fs.existsSync(chunksDir)) return;

  let patchedFiles = 0;
  for (const file of fs.readdirSync(chunksDir)) {
    if (!file.endsWith(".js")) continue;

    const filePath = path.join(chunksDir, file);
    let content = fs.readFileSync(filePath, "utf8");
    if (!content.includes("better-sqlite3-")) continue;

    content = content.replace(/better-sqlite3-[a-f0-9]{16}/g, "better-sqlite3");
    fs.writeFileSync(filePath, content, "utf8");
    patchedFiles += 1;
  }

  console.log(`已将 ${patchedFiles} 个 server chunk 中的 better-sqlite3 引用改为本地模块。`);
}

fs.mkdirSync(path.join(standaloneDir, ".next"), { recursive: true });
copyDirectory(staticSrc, staticDest);

if (fs.existsSync(publicSrc)) {
  copyDirectory(publicSrc, publicDest);
}

removeDevWorkspaceCopy();
removeNestedPackagingArtifacts();
patchAbsolutePaths();
ensureBetterSqliteAlias();
patchBetterSqliteRequires();

console.log("Electron standalone 资源已准备完成。");
console.log(`目录: ${standaloneDir}`);
