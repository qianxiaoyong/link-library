"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  defaultLinkFilterValues,
  type LinkFilterValues,
} from "./LinkFilters";
import { LinkLibraryPage } from "./LinkLibraryPage";
import { decodeLinksDeepLinkParams } from "@/shared/library/deep-link-filters";

function mergeDeepLinkIntoFilterValues(
  searchParams: Pick<URLSearchParams, "get">,
): LinkFilterValues {
  const deepLink = decodeLinksDeepLinkParams(searchParams);

  return {
    ...defaultLinkFilterValues,
    q: deepLink.q ?? "",
    resourceYear: deepLink.resourceYear ?? "",
    semester: deepLink.semester ?? "",
    schoolStage: deepLink.schoolStage ?? "",
    subject: deepLink.subject ?? "",
    textbookEdition: deepLink.textbookEdition ?? "",
    resourceCategory: deepLink.resourceCategory,
  };
}

export function LinksPageContainer() {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const initialFilters = useMemo(
    () => mergeDeepLinkIntoFilterValues(searchParams),
    [searchParams],
  );

  return (
    <LinkLibraryPage
      key={searchKey}
      initialFilters={initialFilters}
    />
  );
}
