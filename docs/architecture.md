# 学习资料链接库 — 架构说明

## 项目定位

学习资料链接库是一款面向个人本地使用的 Web 应用，用于登记和管理百度网盘、夸克网盘上的学习资料链接。主要覆盖小学、初中、高中阶段资料，支持按标题、年份、学段、年级、学期、科目、资料分类等维度查询。

## 技术栈

- **框架**: Next.js（App Router）
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: SQLite（`better-sqlite3`）
- **校验**: Zod（后续 API / 表单使用）
- **运行环境**: 本地个人使用，全中文 UI

## 第一版做什么

- 本地登记网盘学习资料链接
- SQLite 持久化存储
- 按多维度筛选与查询
- 链接解析（后续阶段）
- 批量导入与 Excel 导出（后续阶段）

## 第一版不做什么

- 登录与多人权限
- 云端部署
- 浏览器插件
- 自动检测链接失效
- AI API 接入
- 自动读取网盘文件清单
- 复杂统计报表
- 回收站
- 字段选项管理
- Electron 封装（仅预留，当前不实现）

## 数据库路径

```
_workspace/link-library/link-library.db
```

数据库文件与工作目录位于项目根目录下的 `_workspace/link-library/`，便于本地备份与后续 Electron 打包时统一挂载。

## 服务端 / 前端边界

| 目录 | 用途 | 可被前端 import |
|------|------|-----------------|
| `src/server/db/` | 数据库连接与初始化 | 否 |
| `src/shared/` | 类型、常量（前后端共享） | 是 |
| `scripts/` | 数据库初始化、检查脚本 | 否（独立运行） |

**规则**:

- 前端组件、Client Component **不得**直接 import `src/server/db/*`。
- 数据库读写仅通过服务端代码（Route Handler、Server Action、脚本）访问。
- `src/shared/` 只放无 Node.js 依赖、可在浏览器安全使用的类型与常量。

## Electron 预留

后期可能将本项目封装为 Electron 桌面应用，届时：

- 数据库路径可迁移至用户数据目录
- Next.js 作为内嵌 Web 视图运行

**当前阶段不引入 Electron，不做任何 Electron 相关实现。**
