export const LINK_PLATFORMS = ["baidu", "quark"] as const;

export const LINK_PLATFORM_LABELS = {
  baidu: "百度网盘",
  quark: "夸克网盘",
} as const;

export const RESOURCE_CATEGORIES = ["practice", "paper", "special"] as const;

export const RESOURCE_CATEGORY_LABELS = {
  practice: "练习",
  paper: "试卷",
  special: "专项",
} as const;

export const LINK_STATUSES = ["normal", "invalid"] as const;

export const LINK_STATUS_LABELS = {
  normal: "正常",
  invalid: "已失效",
} as const;
