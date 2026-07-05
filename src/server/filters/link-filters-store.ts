import fs from "node:fs";
import path from "node:path";
import { getLinkLibraryWorkspaceDir } from "@/server/config/workspace-path";
import {
  defaultLinkFiltersConfig,
  linkFiltersConfigSchema,
  type LinkFiltersConfig,
} from "@/server/validation/link-filters-schemas";

function getConfigPath(): string {
  return path.join(getLinkLibraryWorkspaceDir(), "links-filters.json");
}

export function readLinkFiltersConfig(): LinkFiltersConfig {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return { ...defaultLinkFiltersConfig };
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = linkFiltersConfigSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // fall through to defaults
  }

  return { ...defaultLinkFiltersConfig };
}

export function writeLinkFiltersConfig(
  config: LinkFiltersConfig,
): LinkFiltersConfig {
  const parsed = linkFiltersConfigSchema.parse(config);
  const configPath = getConfigPath();

  fs.mkdirSync(getLinkLibraryWorkspaceDir(), { recursive: true });
  fs.writeFileSync(
    configPath,
    `${JSON.stringify(parsed, null, 2)}\n`,
    "utf-8",
  );

  return parsed;
}
