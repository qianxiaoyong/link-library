import fs from "node:fs";
import path from "node:path";
import { getLinkLibraryWorkspaceDir } from "@/server/config/workspace-path";
import {
  coverageMatrixFiltersConfigSchema,
  defaultCoverageMatrixFiltersConfig,
  type CoverageMatrixFiltersConfig,
} from "@/server/validation/coverage-matrix-filters-schemas";

function getConfigPath(): string {
  return path.join(getLinkLibraryWorkspaceDir(), "matrix-filters.json");
}

export function readCoverageMatrixFiltersConfig(): CoverageMatrixFiltersConfig {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return { ...defaultCoverageMatrixFiltersConfig };
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = coverageMatrixFiltersConfigSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // fall through to defaults
  }

  return { ...defaultCoverageMatrixFiltersConfig };
}

export function writeCoverageMatrixFiltersConfig(
  config: CoverageMatrixFiltersConfig,
): CoverageMatrixFiltersConfig {
  const parsed = coverageMatrixFiltersConfigSchema.parse(config);
  const configPath = getConfigPath();

  fs.mkdirSync(getLinkLibraryWorkspaceDir(), { recursive: true });
  fs.writeFileSync(
    configPath,
    `${JSON.stringify(parsed, null, 2)}\n`,
    "utf-8",
  );

  return parsed;
}
