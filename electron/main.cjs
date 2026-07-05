const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("child_process");
const http = require("http");
const net = require("net");
const path = require("path");
const fs = require("fs");

const PROJECT_ROOT = path.join(__dirname, "..");
const isPackaged = app.isPackaged;
const isDev = process.env.ELECTRON_DEV === "1";

let mainWindow = null;
let serverProcess = null;
let appPort = null;
let logStream = null;

function getStandaloneDir() {
  if (isPackaged) {
    return path.join(process.resourcesPath, "standalone");
  }
  return path.join(PROJECT_ROOT, ".next", "standalone");
}

function getDataDir() {
  if (isDev) {
    return path.join(PROJECT_ROOT, "_workspace", "link-library");
  }
  return path.join(app.getPath("userData"), "link-library");
}

function getLogPath() {
  return path.join(app.getPath("userData"), "logs", "server.log");
}

function initLogging() {
  const logDir = path.dirname(getLogPath());
  fs.mkdirSync(logDir, { recursive: true });
  logStream = fs.createWriteStream(getLogPath(), { flags: "a" });
  logStream.write(`\n\n===== 启动 ${new Date().toISOString()} =====\n`);
}

function writeLog(message) {
  if (logStream) {
    logStream.write(`${message}\n`);
  }
  console.log(message);
}

function showFatalError(title, message) {
  writeLog(`${title}: ${message}`);
  dialog.showErrorBox(title, message);
  app.exit(1);
}

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
    server.on("error", reject);
  });
}

function waitForServer(url, timeoutMs = 120000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      request.on("error", retry);
      request.setTimeout(2000, () => {
        request.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`等待服务启动超时: ${url}`));
        return;
      }
      setTimeout(attempt, 500);
    };

    attempt();
  });
}

function stopServer() {
  if (!serverProcess) {
    return;
  }

  serverProcess.kill("SIGTERM");
  serverProcess = null;
}

function createLoadingWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: "学习资料链接库",
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const loadingHtml = `
    <!doctype html>
    <html lang="zh-CN">
      <head><meta charset="utf-8"><title>学习资料链接库</title></head>
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#444;">
        正在启动本地服务，请稍候...
      </body>
    </html>
  `;
  mainWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml)}`,
  );
}

async function startServer() {
  const dataDir = path.resolve(getDataDir());
  fs.mkdirSync(dataDir, { recursive: true });
  writeLog(`数据目录: ${dataDir}`);

  if (isDev) {
    appPort = 3000;
    serverProcess = spawn("npm", ["run", "dev"], {
      cwd: PROJECT_ROOT,
      shell: true,
      env: {
        ...process.env,
        PORT: String(appPort),
        LINK_LIBRARY_DATA_DIR: dataDir,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    serverProcess.stdout?.on("data", (chunk) => writeLog(chunk.toString()));
    serverProcess.stderr?.on("data", (chunk) => writeLog(chunk.toString()));
    await waitForServer(`http://127.0.0.1:${appPort}/links`);
    return appPort;
  }

  const standaloneDir = getStandaloneDir();
  const serverPath = path.join(standaloneDir, "server.js");

  if (!fs.existsSync(serverPath)) {
    throw new Error(
      `未找到 Next.js standalone 服务，请先运行 npm run electron:prepare。\n${serverPath}`,
    );
  }

  appPort = await findAvailablePort();
  writeLog(`standalone 目录: ${standaloneDir}`);
  writeLog(`服务端口: ${appPort}`);

  serverProcess = spawn(process.execPath, [serverPath], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(appPort),
      HOSTNAME: "127.0.0.1",
      LINK_LIBRARY_DATA_DIR: dataDir,
      NODE_PATH: path.join(standaloneDir, "node_modules"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout?.on("data", (chunk) => writeLog(chunk.toString()));
  serverProcess.stderr?.on("data", (chunk) => writeLog(chunk.toString()));

  serverProcess.on("exit", (code) => {
    writeLog(`内置服务退出，code=${code ?? "null"}`);
    serverProcess = null;
    if (code && code !== 0 && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(
          `<html><body style="font-family:sans-serif;padding:24px;color:#b91c1c">内置服务异常退出（${code}），请查看日志：${getLogPath()}</body></html>`,
        )}`,
      );
    }
  });

  await waitForServer(`http://127.0.0.1:${appPort}/links`);
  return appPort;
}

async function createWindow() {
  createLoadingWindow();

  try {
    const port = await startServer();
    await mainWindow.loadURL(`http://127.0.0.1:${port}/links`);

    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "未知启动错误";
    showFatalError("启动失败", `${message}\n\n日志：${getLogPath()}`);
  }
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    initLogging();
    await createWindow();
  });

  app.on("before-quit", () => {
    stopServer();
    if (logStream) {
      logStream.end();
    }
  });

  app.on("window-all-closed", () => {
    app.quit();
  });
}
