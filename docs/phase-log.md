# 阶段执行日志

## 阶段 0：项目初始化与架构边界

**状态：** 完成

**完成内容：**

- 创建 Next.js + TypeScript + Tailwind CSS 项目骨架
- 安装 `better-sqlite3`、`zod`、`tsx`、`@types/better-sqlite3`
- 建立目录结构：`src/app/`、`src/server/db/`、`src/shared/`、`scripts/`、`docs/`、`_workspace/link-library/`
- 创建共享常量 `src/shared/constants/link-taxonomy.ts`
- 创建共享类型 `src/shared/types/resource-link.ts`
- 创建架构文档 `docs/architecture.md`
- 配置 npm scripts：`dev`、`build`、`start`、`lint`、`typecheck`、`db:init`、`db:check`
- 最小化默认页面（非正式 UI）

**风险：**

- 无

**下一阶段：**

- 阶段 1：SQLite 数据库初始化与表结构

---

## 阶段 1：SQLite 数据库初始化与表结构

**状态：** 完成

**完成内容：**

- 实现 `src/server/db/link-db.ts` 数据库连接模块（自动创建目录、WAL、外键）
- 实现 `src/server/db/init-link-db.ts` 初始化函数
- 创建 `app_meta` 表并写入 `schema_version=1`、`app_name=学习资料链接库`
- 创建 `resource_links` 核心表
- 创建唯一索引 `idx_resource_links_platform_url`（platform + url 去重）
- 创建 7 个搜索筛选索引
- 创建 `trg_resource_links_updated_at` trigger
- 实现 `scripts/init-db.ts`、`scripts/check-db.ts`

**数据库路径：**

```
_workspace/link-library/link-library.db
```

**创建表：**

- `app_meta`
- `resource_links`

**创建索引：**

- `idx_resource_links_platform_url`（UNIQUE）
- `idx_resource_links_status`
- `idx_resource_links_favorite`
- `idx_resource_links_platform`
- `idx_resource_links_resource_category`
- `idx_resource_links_resource_year`
- `idx_resource_links_subject`
- `idx_resource_links_created_at`

**是否创建 updated_at trigger：**

是。使用 `AFTER UPDATE` trigger 自动维护 `updated_at`。SQLite 默认禁用递归 trigger，trigger 内的 UPDATE 不会再次触发自身，无递归风险；应用层 update 时无需手动写 `updated_at`。

**运行命令结果：**

- `npm run db:init`：成功
- `npm run db:check`：全部通过
- `npm run typecheck`：通过
- `npm run lint`：通过

**风险：**

- `better-sqlite3` 为原生模块，需在本地 Node 环境编译；脚本通过 `tsx` 直接运行，不经过 Next.js 打包

**下一阶段建议：**

- 阶段 2：链接解析器（百度 / 夸克 URL 标准化、提取码、标题等）

---

## 阶段 2：百度 / 夸克链接解析器

**状态：** 完成

**完成内容：**

- 新增 `src/shared/parser/` 解析模块（类型、URL 标准化、百度/夸克分平台解析、总入口）
- 实现 `normalizePanUrl`：百度/夸克链接识别与去 query 标准化
- 实现 `parseBaiduBlock`：标题（分享的文件：）、提取码（显式优先于 pwd）、默认标题 fallback
- 实现 `parseQuarkBlock`：书名号标题提取、提取码默认 null
- 实现 `parseLinkText`：全文扫描链接、按原文顺序解析、单条/批量/混合输入
- 新增 `scripts/test-parser.ts` 与 `npm run parser:test`

**支持的输入类型：**

- 百度单条 / 批量
- 夸克单条 / 批量
- 百度 + 夸克混合输入
- 空输入（返回空结果，不抛异常）

**解析字段：**

- `platform`、`title`、`rawUrl`、`url`、`accessCode`、`sourceText`、`warnings`

**测试结果：**

- 空输入：通过
- 百度单条：通过（title=26秋待整理，accessCode=gr89，url 无 query）
- 百度批量：通过（3 条，titles 正确，accessCode=d7fv）
- 夸克单条：通过（emoji 标题保留，accessCode=null）
- 夸克批量：通过（3 条，emoji 保留）
- 混合输入：通过（baidu=1，quark=1，failureCount=0）
- `npm run parser:test`：全部通过
- `npm run typecheck`：通过
- `npm run lint`：通过
- `npm run build`：通过

**风险：**

- 用户粘贴格式不稳定时，标题/块边界可能识别不准；当前基于链接位置 + 块起始标记启发式匹配
- 未覆盖百度/夸克的其他变体格式（如短链、纯链接无标题）

**下一阶段建议：**

- 阶段 3：Repository 层 + API Route（解析结果写入 SQLite、CRUD）

---

## 阶段 3：Repository + API Route

**状态：** 完成

**完成内容：**

- 新增 `src/shared/api/api-envelope.ts` 统一 API 返回结构
- 新增 `src/server/mappers/resource-link-mapper.ts`（snake_case ↔ camelCase）
- 新增 `src/server/mappers/create-input-mapper.ts`（Zod body → CreateResourceLinkInput）
- 新增 `src/server/validation/resource-link-schemas.ts`（Zod 校验）
- 新增 `src/server/repositories/resource-link-repository.ts`（CRUD + 批量去重写入）
- 新增 `src/server/api/route-utils.ts`（Route 响应 helper）
- 实现 7 个 API Route
- 新增 `scripts/test-api-logic.ts` 与 `npm run api:test`
- 扩展 `CreateResourceLinkInput` / `UpdateResourceLinkInput` 类型

**新增 API：**

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/links` | 列表查询（分页、筛选） |
| POST | `/api/links` | 新增单条 |
| GET | `/api/links/[id]` | 详情 |
| PATCH | `/api/links/[id]` | 编辑 |
| DELETE | `/api/links/[id]` | 硬删除 |
| POST | `/api/import/parse` | 解析粘贴文本（不写库） |
| POST | `/api/import/apply` | 批量写入已确认解析结果 |

**Repository 方法：**

- `listResourceLinks` — 多条件筛选 + LIKE 搜索 + 分页
- `getResourceLinkById`
- `createResourceLink`
- `updateResourceLink`
- `deleteResourceLink`
- `createManyResourceLinksSkipDuplicates`
- `deleteResourceLinksByTitlePrefix`（测试清理用）

**重复链接处理：**

- 单条新增：抛出 `DuplicateLinkError`，API 返回 `409 DUPLICATE_LINK`
- 批量导入：跳过重复项，写入 `skippedDuplicates`，继续处理其余项

**默认查询规则：**

- `status` 默认 `normal`（失效资料不出现在默认列表）
- `status=all` 时不限制状态
- 排序：`favorite DESC, created_at DESC`
- 分页：默认 `limit=50, offset=0`，最大 `limit=200`

**测试结果：**

- `npm run db:check`：通过
- `npm run parser:test`：通过
- `npm run api:test`：9 项全部通过（含重复检测、status 筛选、批量导入去重）
- `npm run typecheck`：通过
- `npm run lint`：通过
- `npm run build`：通过（4 个 API Route 均为 dynamic）

**风险：**

- `q` 搜索使用 LIKE，数据量大时性能有限；第一版未做 FTS
- API 无鉴权，仅限本地个人使用场景
- Route Handler 依赖 Node.js runtime（better-sqlite3 不可 Edge）

**下一阶段建议：**

- 阶段 4：正式 UI（列表页、详情/编辑、粘贴导入确认流程）

---

## 阶段 4A：资料库首页 + 基础 CRUD UI

**状态：** 完成

**完成内容：**

- 新增 `/links` 资料库页面（列表 + 筛选 + 详情面板 + 新增/编辑弹窗）
- 首页 `/` 提供「进入资料库」入口
- 新增 `src/shared/api/links-client.ts` 前端 fetch 封装
- 新增 links 组件：`LinkLibraryPage`、`LinkFilters`、`LinkTable`、`LinkDetailPanel`、`LinkFormDialog`、`LinkStatusBadge`
- 实现搜索、多字段筛选、分页、收藏/状态快捷操作、复制链接/提取码
- 新增 `scripts/test-ui-manual.ts`（HTTP 层模拟 UI 操作流程）

**页面路径：**

- `/` — 入口页
- `/links` — 资料库主页

**调用 API：**

- `GET /api/links`
- `POST /api/links`
- `GET /api/links/[id]`
- `PATCH /api/links/[id]`
- `DELETE /api/links/[id]`

**手动测试结果：**

- 列表默认 `status=normal`：通过
- 新增百度 / 夸克资料：通过
- 重复链接提示：通过（409 DUPLICATE_LINK）
- 搜索 `[TEST]` / `数学`：通过
- 平台 / 分类 / 收藏筛选：通过
- 编辑备注与资料年份：通过
- 收藏：通过
- 标记失效后默认列表隐藏：通过（status=all 可见）
- 删除测试资料：通过

**命令结果：**

- `npm run db:check`：通过
- `npm run parser:test`：通过
- `npm run api:test`：通过
- `npm run typecheck`：通过
- `npm run lint`：通过
- `npm run build`：通过（含 `/links` 静态页）

**风险：**

- 筛选区字段较多，小屏幕需横向滚动表格
- 前端未做 import 相关 API 调用（符合本阶段范围）
- 复制功能依赖浏览器 Clipboard API

**下一阶段建议：**

- 阶段 4B：批量导入 UI（parse 预览 → 确认 → apply）

---

## 阶段 4B：批量导入 UI

**状态：** 完成

**完成内容：**

- `/links` 顶部新增「批量导入」按钮，打开弹窗
- 新增 `LinkImportDialog`：粘贴 → 解析 → 预览 → 批量填充 → 确认导入 → 结果摘要
- 新增 `ImportPreviewTable`：预览列表 + 解析失败项展示
- 新增 `ImportDefaultsForm`：统一批量填充资料分类 / 备注 / 学段等字段
- 扩展 `links-client.ts`：`parseImportText`、`applyImportItems`
- 新增 `scripts/test-ui-import-manual.ts`、`npm run ui:import:test`

**页面入口：**

- `/links` → 「批量导入」按钮 → 弹窗

**调用 API：**

- `POST /api/import/parse` — 解析粘贴文本
- `POST /api/import/apply` — 确认写入（含 defaults）

**预览字段：**

- 序号、平台、标题、标准链接、提取码、警告、移除操作

**批量填充字段：**

- 资料分类、备注、学段、年级、学期、科目、资料年份、状态、是否收藏

**导入结果展示：**

- 成功导入 / 跳过重复 / 失败 数量摘要
- 跳过的重复链接列表（平台、标题、标准链接）
- 导入失败项列表（标题、原因）
- 「完成」刷新列表并提示筛选条件；「继续导入」保留批量填充字段

**手动测试结果：**

- 空输入提示：通过（UI 层拦截 + API 空结果）
- 百度单条 parse + apply：通过
- 夸克批量 3 条 + emoji 标题：通过
- 重复导入跳过：通过（created=0, skippedDuplicates=N）
- 移除预览项后部分导入：通过
- 导入后刷新列表：通过（onComplete → refreshList）

**命令结果：**

- `npm run db:check`：通过
- `npm run parser:test`：通过
- `npm run api:test`：通过
- `npm run typecheck`：通过
- `npm run lint`：通过
- `npm run build`：通过
- `npm run ui:import:test`：5 项通过

**风险：**

- 批量填充为全条目统一设置，不支持逐行不同字段
- 弹窗内容较多，小屏需滚动
- 继续导入时保留批量填充字段，用户需留意是否需要修改

**下一阶段建议：**

- 阶段 5：Excel 导出 / 数据库备份（按需）

---

## 阶段 5：Excel 导出 + 数据库备份

**状态：** 完成

**完成内容：**

- 新增 `GET /api/export/excel`（scope=filtered / all，无分页限制）
- 新增 `POST /api/backup`（WAL checkpoint + 复制主库文件）
- 新增 `src/server/export/export-links-excel.ts`（ExcelJS 生成 xlsx）
- 新增 `src/server/backup/backup-database.ts`
- Repository 新增 `listResourceLinksForExport`（不分页）
- `/links` 顶部新增：导出当前筛选、导出全部资料、备份数据库
- 扩展 `links-client.ts`：`buildExportExcelUrl`、`downloadExportExcel`、`backupDatabase`
- 新增 `scripts/test-export-backup.ts`、`npm run export-backup:test`
- 安装 `exceljs`

**新增 API：**

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/export/excel` | 导出 Excel（scope + 筛选参数） |
| POST | `/api/backup` | 备份 SQLite 数据库 |

**Excel 导出字段：**

序号、标题、平台、资料分类、原始链接、标准链接、提取码、备注、学段、年级、学期、科目、资料年份、状态、是否收藏、原始输入片段、创建时间、更新时间

**数据库备份路径：**

- 源库：`_workspace/link-library/link-library.db`
- 备份目录：`_workspace/link-library/backups/`
- 文件名：`link-library-backup-YYYYMMDD-HHmmss.db`

**备份策略：**

备份前执行 `PRAGMA wal_checkpoint(FULL)`，然后仅复制主 `.db` 文件（不复制 `-wal` / `-shm`）

**手动测试结果：**

- 导出当前筛选（status=normal + subject=数学）：通过
- 导出全部资料（含 normal + invalid）：通过
- Excel 中文表头与字段显示：通过
- 数据库备份文件生成：通过

**命令结果：**

- `npm run db:check`：通过
- `npm run parser:test`：通过
- `npm run api:test`：通过
- `npm run export-backup:test`：3 项通过
- `npm run typecheck`：通过
- `npm run lint`：通过
- `npm run build`：通过

**风险：**

- 数据量极大时一次性导出可能占用较多内存
- 备份仅复制 checkpoint 后的主库，极端并发写入场景下建议停止写入后备份
- Excel 下载文件名 HTTP header 使用 ASCII fallback + UTF-8 filename*

**下一阶段建议：**

- 按需：Electron 桌面封装、自动备份计划、Excel 导入（不在第一版范围）
