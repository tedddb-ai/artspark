const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "";

/** Build an Amazon search URL for a supply item, with affiliate tag and UTM tracking */
export function amazonSearchUrl(
  item: string,
  campaign?: string
): string {
  const query = encodeURIComponent(item);
  const base = `https://www.amazon.com/s?k=${query}`;
  const tagged = AMAZON_TAG ? `${base}&tag=${AMAZON_TAG}` : base;
  return campaign ? `${tagged}&utm_source=artspark&utm_medium=affiliate&utm_campaign=${encodeURIComponent(campaign)}` : tagged;
}

/** Build an Amazon cart URL that searches for all materials at once */
export function amazonBulkSearchUrl(
  materials: { item: string }[],
  campaign?: string
): string {
  const query = encodeURIComponent(
    materials.map((m) => m.item).join(", ")
  );
  const base = `https://www.amazon.com/s?k=${query}`;
  const tagged = AMAZON_TAG ? `${base}&tag=${AMAZON_TAG}` : base;
  return campaign ? `${tagged}&utm_source=artspark&utm_medium=affiliate&utm_campaign=${encodeURIComponent(campaign)}` : tagged;
}
