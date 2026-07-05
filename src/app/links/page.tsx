import { Suspense } from "react";
import { LinksPageContainer } from "@/components/links/LinksPageContainer";

function LinksPageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-100 text-sm text-zinc-600">
      加载中...
    </div>
  );
}

export default function LinksPage() {
  return (
    <Suspense fallback={<LinksPageFallback />}>
      <LinksPageContainer />
    </Suspense>
  );
}
