export function exportToCsv(filename: string, headers: string[], rows: string[][]): void {
  const BOM = "\uFEFF"; // pour Excel français (UTF-8 BOM)
  const csv =
    BOM +
    [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";"))
      .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
