// pages/api/morris-blog.ts
import type { NextApiRequest, NextApiResponse } from "next";

const BLOG_BASE = "https://blog.morrisopazo.com";
const RSS_URL = `${BLOG_BASE}/feed`;

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
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
        .trim();

    return {
      title: pick("title"),
      link: pick("link"),
      pubDate: pick("pubDate"),
      image: "",
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

    const posts = await tryFetchRSS().catch(fetchFromHTML);

    CACHE = { data: posts, ts: now };
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json({ ok: true, posts });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || "Internal error" });
  }
}
