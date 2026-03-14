const BROWSER_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

export interface ExtractResult {
  imageUrl: string | null;
  caption?: string;
  error?: string;
}

function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/(p|reel|reels|tv)\//i.test(url);
}

function parseInstagramUrl(url: string): { type: string; shortcode: string } | null {
  const match = url.match(/instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (!match) return null;
  const type = match[1].toLowerCase() === "reels" ? "reel" : match[1].toLowerCase();
  return { type, shortcode: match[2] };
}

/** Extract caption text from Instagram embed HTML */
function extractCaption(html: string): string | undefined {
  // The embed page typically has the caption in a few places:

  // 1. In the og:description meta tag
  const ogDesc =
    html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:description["']/i);
  if (ogDesc?.[1] && ogDesc[1].length > 10) {
    return decodeHtmlEntities(ogDesc[1]);
  }

  // 2. In the caption div (class="Caption" or similar)
  const captionMatch =
    html.match(/class="Caption"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i) ||
    html.match(/class="[^"]*caption[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (captionMatch?.[1]) {
    const text = captionMatch[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 10) return decodeHtmlEntities(text);
  }

  // 3. In JSON-LD or embedded data
  const jsonLdMatch = html.match(/"caption"\s*:\s*"([^"]+)"/i);
  if (jsonLdMatch?.[1]) {
    return decodeHtmlEntities(jsonLdMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'));
  }

  // 4. og:title often has a summary
  const ogTitle =
    html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:title["']/i);
  if (ogTitle?.[1] && ogTitle[1].length > 15) {
    return decodeHtmlEntities(ogTitle[1]);
  }

  return undefined;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

/** Extract image URL from Instagram embed HTML */
function extractImageUrl(html: string): string | null {
  // og:image
  const ogMatch =
    html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
  if (ogMatch) return ogMatch[1];

  // Embed markup image
  const imgMatch =
    html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i) ||
    html.match(/src="(https:\/\/[^"]*cdninstagram\.com[^"]+)"/i) ||
    html.match(/src="(https:\/\/scontent[^"]+)"/i);
  if (imgMatch) return imgMatch[1].replace(/&amp;/g, "&");

  // Background image
  const bgMatch = html.match(/background-image:\s*url\(["']?(https:\/\/[^"')]+)["']?\)/i);
  if (bgMatch) return bgMatch[1].replace(/&amp;/g, "&");

  // Any CDN URL
  const cdnMatch = html.match(/(https:\/\/(?:scontent|instagram)[^"'\s\\]+\.(?:jpg|jpeg|png|webp)[^"'\s\\]*)/i);
  if (cdnMatch) return cdnMatch[1].replace(/\\u0026/g, "&").replace(/&amp;/g, "&");

  return null;
}

async function extractFromInstagram(url: string): Promise<ExtractResult> {
  const parsed = parseInstagramUrl(url);
  if (!parsed) {
    return { imageUrl: null, error: "Could not parse Instagram URL" };
  }

  // Strategy 1: Embed page — has both image and caption
  try {
    const embedUrl = `https://www.instagram.com/${parsed.type}/${parsed.shortcode}/embed/`;
    const res = await fetchWithTimeout(embedUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (res.ok) {
      const html = await res.text();
      const imageUrl = extractImageUrl(html);
      const caption = extractCaption(html);

      if (imageUrl) {
        return { imageUrl, caption };
      }
    }
  } catch (e) {
    console.error("Instagram embed fetch failed:", e);
  }

  // Strategy 2: /media/ redirect (posts only, no caption)
  if (parsed.type === "p") {
    try {
      const mediaUrl = `https://www.instagram.com/p/${parsed.shortcode}/media/?size=l`;
      const res = await fetchWithTimeout(mediaUrl, {
        headers: { "User-Agent": BROWSER_UA },
        redirect: "manual",
      });
      const location = res.headers.get("location");
      if (location && location.includes("cdninstagram")) {
        return { imageUrl: location };
      }
    } catch {
      // media redirect failed
    }
  }

  // Strategy 3: Direct page fetch
  try {
    const cleanUrl = `https://www.instagram.com/${parsed.type}/${parsed.shortcode}/`;
    const res = await fetchWithTimeout(cleanUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (res.ok) {
      const html = await res.text();
      const imageUrl = extractImageUrl(html);
      const caption = extractCaption(html);
      if (imageUrl) return { imageUrl, caption };
    }
  } catch {
    // direct fetch failed
  }

  return {
    imageUrl: null,
    error: "Couldn't extract this Instagram post. Try screenshotting it and uploading instead.",
  };
}

async function extractFromGenericUrl(url: string): Promise<ExtractResult> {
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return { imageUrl: null, error: `Failed to fetch URL: ${response.status}` };
    }

    const html = await response.text();

    // Extract description as caption context
    const descMatch =
      html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:description["']/i) ||
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const caption = descMatch?.[1] ? decodeHtmlEntities(descMatch[1]) : undefined;

    const ogMatch =
      html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
    if (ogMatch) return { imageUrl: ogMatch[1], caption };

    const twitterMatch =
      html.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']twitter:image["']/i);
    if (twitterMatch) return { imageUrl: twitterMatch[1], caption };

    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*/gi);
    for (const match of imgMatches) {
      const src = match[1];
      if (
        src.match(/\.(jpg|jpeg|png|webp)/i) &&
        !src.includes("icon") &&
        !src.includes("logo") &&
        !src.includes("avatar")
      ) {
        const resolved = src.startsWith("http") ? src : new URL(src, url).href;
        return { imageUrl: resolved, caption };
      }
    }

    return { imageUrl: null, error: "No image found at this URL." };
  } catch (err) {
    return {
      imageUrl: null,
      error: `Failed to extract image: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

export async function extractImageFromUrl(url: string): Promise<ExtractResult> {
  if (isInstagramUrl(url)) {
    return extractFromInstagram(url);
  }
  return extractFromGenericUrl(url);
}

export async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ base64: string; mediaType: string } | null> {
  try {
    const response = await fetchWithTimeout(imageUrl, {
      headers: { "User-Agent": BROWSER_UA },
    });
    if (!response.ok) return null;

    const contentType = (response.headers.get("content-type") || "").split(";")[0];
    if (!contentType.startsWith("image/")) {
      console.error("fetchImageAsBase64: not an image, got", contentType);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return { base64, mediaType: contentType || "image/jpeg" };
  } catch {
    return null;
  }
}
