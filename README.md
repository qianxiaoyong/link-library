# 学习资料链接库

本项目是一个本地运行的学习资料网盘链接管理工具，用于登记和查询百度网盘、夸克网盘学习资料链接。

## 功能特性

- 百度网盘 / 夸克网盘链接登记
- 单条新增、编辑、删除
- 批量粘贴解析
- 自动提取标题、链接、提取码
- 支持资料年份、科目、年级、资料分类等字段
- 支持搜索和筛选
- 支持批量编辑
- 支持 Excel 导出
- 支持 SQLite 数据库备份
- 本地运行，不依赖云服务
- 不接 AI API，不自动访问网盘链接

## 技术栈

- Next.js
- TypeScript
- React
- SQLite
- better-sqlite3
- Tailwind CSS
- ExcelJS

## 本地运行

```bash
npm install
npm run db:init
npm run dev
