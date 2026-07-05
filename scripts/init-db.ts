import {
  closeLinkDatabase,
  getLinkDatabase,
  getLinkDatabasePath,
} from "../src/server/db/link-db";
import { initLinkDatabase } from "../src/server/db/init-link-db";

function main(): void {
  const db = getLinkDatabase();

  try {
    initLinkDatabase(db);
    console.log("数据库初始化成功。");
    console.log(`数据库路径: ${getLinkDatabasePath()}`);
    console.log("已创建表: app_meta, resource_links");
    console.log(
      "已创建索引: idx_resource_links_platform_url (唯一), idx_resource_links_status, idx_resource_links_favorite, idx_resource_links_platform, idx_resource_links_resource_category, idx_resource_links_resource_year, idx_resource_links_subject, idx_resource_links_created_at",
    );
    console.log("已创建 trigger: trg_resource_links_updated_at");
  } finally {
    closeLinkDatabase();
  }
}

main();
