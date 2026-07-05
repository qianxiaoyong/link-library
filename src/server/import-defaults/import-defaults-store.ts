import fs from "node:fs";
import path from "node:path";
import { getLinkLibraryWorkspaceDir } from "@/server/config/workspace-path";
import {
  importDefaultsConfigSchema,
  type ImportDefaultsConfigBody,
} from "@/server/validation/resource-link-schemas";

const CONFIG_DIR = getLinkLibraryWorkspaceDir();
const CONFIG_PATH = path.join(CONFIG_DIR, "import-defaults.json");

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

export function getImportDefaultsConfigPath(): string {
  return CONFIG_PATH;
}

export function readImportDefaultsConfig(): ImportDefaultsConfigBody {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { ...defaultImportDefaultsConfig };
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
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

  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(
    CONFIG_PATH,
    `${JSON.stringify(parsed, null, 2)}\n`,
    "utf-8",
  );

  return parsed;
}
