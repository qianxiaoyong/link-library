function encodeContentDispositionFileName(fileName: string): string {
  const encoded = encodeURIComponent(fileName);
  return `attachment; filename="export.xlsx"; filename*=UTF-8''${encoded}`;
}

export function buildExcelDownloadHeaders(fileName: string): HeadersInit {
  return {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": encodeContentDispositionFileName(fileName),
  };
}
