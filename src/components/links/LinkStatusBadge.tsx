import type { LinkStatus } from "@/shared/types/resource-link";
import { getStatusLabel } from "./link-ui-utils";

type LinkStatusBadgeProps = {
  status: LinkStatus;
};

export function LinkStatusBadge({ status }: LinkStatusBadgeProps) {
  const label = getStatusLabel(status);
  const className =
    status === "normal"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-zinc-200 text-zinc-700";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
