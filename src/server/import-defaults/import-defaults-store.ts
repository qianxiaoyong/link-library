import fs from "node:fs";
import path from "node:path";
import { getLinkLibraryWorkspaceDir } from "@/server/config/workspace-path";
import {
  importDefaultsConfigSchema,
  type ImportDefaultsConfigBody,
} from "@/server/validation/resource-link-schemas";

export const defaultImportDefaultsConfig: ImportDefaultsConfigBody = {
  title: "",
  resourceCategory: "",
  description: "",
  schoolStage: "",
  grade: "",
  semester: "",
  subject: "",
  resourceYear: "",
  textbookEdition: "",
  status: "normal",
  favorite: false,
};

function getConfigDir(): string {
  return getLinkLibraryWorkspaceDir();
}

function getConfigPath(): string {
  return path.join(getConfigDir(), "import-defaults.json");
}

export function getImportDefaultsConfigPath(): string {
  return getConfigPath();
}

export function readImportDefaultsConfig(): ImportDefaultsConfigBody {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return { ...defaultImportDefaultsConfig };
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = importDefaultsConfigSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // fall through to defaults
  }

  return { ...defaultImportDefaultsConfig };
}

export function writeImportDefaultsConfig(
  config: ImportDefaultsConfigBody,
): ImportDefaultsConfigBody {
  const parsed = importDefaultsConfigSchema.parse(config);

  fs.mkdirSync(getConfigDir(), { recursive: true });
  fs.writeFileSync(
    getConfigPath(),
    `${JSON.stringify(parsed, null, 2)}\n`,
    "utf-8",
  );

  return parsed;
}
