export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { getLinkDatabase } = await import("@/server/db/link-db");
  const { initLinkDatabase } = await import("@/server/db/init-link-db");

  initLinkDatabase(getLinkDatabase());
}
