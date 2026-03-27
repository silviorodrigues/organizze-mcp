export const JSON_CAP = 50;

export function buildCappedJson(data: unknown): string {
  if (Array.isArray(data) && data.length > JSON_CAP) {
    const capped = data.slice(0, JSON_CAP);
    return (
      "```json\n" +
      JSON.stringify(capped, null, 2) +
      "\n```\n" +
      `_Showing ${JSON_CAP} of ${data.length} items in JSON. Use date_range to narrow results._`
    );
  }
  return "```json\n" + JSON.stringify(data, null, 2) + "\n```";
}

export function resolveCategoryName(
  categoryId: number,
  categoryMap?: Map<number, string> | null
): string {
  if (!categoryMap) return `#${categoryId}`;
  return categoryMap.get(categoryId) ?? `#${categoryId}`;
}

export function resolveAccountName(
  accountId: number | null,
  accountMap?: Map<number, string> | null
): string {
  if (accountId === null) return "Unknown";
  if (!accountMap) return `Account #${accountId}`;
  return accountMap.get(accountId) ?? `Account #${accountId}`;
}
