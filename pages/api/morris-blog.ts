// pages/api/morris-blog.ts
import type { NextApiRequest, NextApiResponse } from "next";

const BLOG_BASE = "https://blog.morrisopazo.com";
const RSS_URL = `${BLOG_BASE}/feed`;

// --- Helpers para sacar imágenes ---
// 1) Del <item> RSS (media:content / enclosure / content:encoded)
function imageFromRssItemXML(itemXML: string): string {
    // <media:content url="...">
    const media = itemXML.match(/<media:content[^>]*url="([^"]+)"/i)?.[1];
    if (media) return media;
  
    // <enclosure url="..." type="image/...">
    const enclosure = itemXML.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image\//i)?.[1];
    if (enclosure) return enclosure;
  
    // <content:encoded> ... <img src="...">
    const content = itemXML.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1] || "";
    const cdata = content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"); // sin "s", usamos [\s\S]*?    
    const img = cdata.match(/<img[^>]*src="([^"]+)"/i)?.[1];
    return img || "";
  }
  
  // 2) De una página HTML (fallback): usa <meta property="og:image">
  async function getOGImage(url: string): Promise<string> {
    try {
      const r = await fetch(url, { headers: { "user-agent": "eLabs-Amp/1.0" } });
      if (!r.ok) return "";
      const html = await r.text();
      const og = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
      if (og) return og;
      const img = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)?.[1];
      return img || "";
    } catch {
      return "";
    }
  }
  
  // 3) Adjunta imágenes a una lista de posts (mejor esfuerzo)
  async function attachImages(posts: any[]) {
    // Si ya traen image, la respetamos; si no, intentamos con og:image
    const tasks = posts.map(async (p) => {
      if (p.image) return p;
      const src = await getOGImage(p.link);
      return { ...p, image: src || "" };
    });
    return Promise.all(tasks);
  }
  

// Cache en memoria (simple) con TTL
let CACHE: { data: any; ts: number } | null = null;
const TTL_MS = 60 * 60 * 1000; // 1 hora

async function tryFetchRSS() {
    const res = await fetch(RSS_URL, { headers: { "user-agent": "eLabs-Amp/1.0" } });
    if (!res.ok) throw new Error("RSS unavailable");
    const xml = await res.text();
  
    const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 8);
    const posts = items.map((m) => {
      const block = m[1];
      const pick = (tag: string) =>
        (block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "")
          .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // ✅ ahora compatible
          .trim();
  
      const image = imageFromRssItemXML(block);
  
      return {
        title: pick("title"),
        link: pick("link"),
        pubDate: pick("pubDate"),
        image,              // 🖼️ ahora intentamos traer imagen
        excerpt: "",
        source: "rss",
      };
    });
  
    if (!posts.length) throw new Error("Empty RSS");
    return posts;
  }
  

async function fetchFromHTML() {
  const res = await fetch(BLOG_BASE, { headers: { "user-agent": "eLabs-Amp/1.0" } });
  if (!res.ok) throw new Error("Blog HTML unavailable");
  const html = await res.text();

  // Heurística simple: capturar <h2>/<h3> con <a href="">
  const cardRegex = /<h[23][^>]*>\s*<a[^h]*href="([^"]+)"[^>]*>(.*?)<\/a>/gim;
  const posts: any[] = [];
  let m;
  while ((m = cardRegex.exec(html)) && posts.length < 8) {
    const link = m[1].startsWith("http") ? m[1] : `${BLOG_BASE}${m[1]}`;
    const title = m[2].replace(/<[^>]+>/g, "").trim();
    if (title && link) {
      posts.push({
        title,
        link,
        pubDate: "",
        image: "",
        excerpt: "",
        source: "html",
      });
    }
  }
  if (!posts.length) throw new Error("No posts from HTML");
  return posts;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Cache
    const now = Date.now();
    if (CACHE && now - CACHE.ts < TTL_MS) {
      res.setHeader("Cache-Control", "public, max-age=300"); // 5 min en edge/CDN
      return res.status(200).json({ ok: true, posts: CACHE.data });
    }

    let posts = await tryFetchRSS().catch(fetchFromHTML);

    // Intento adjuntar imágenes (mejor esfuerzo)
    try {
    posts = await attachImages(posts);
    } catch {}


    CACHE = { data: posts, ts: now };
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json({ ok: true, posts });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || "Internal error" });
  }
}
