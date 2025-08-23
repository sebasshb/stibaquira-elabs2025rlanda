// components/MorrisNews.tsx
"use client";

import { useEffect, useState } from "react";

type Post = {
  title: string;
  link: string;
  pubDate?: string;
  image?: string;
  excerpt?: string;
  source?: string;
};

export default function MorrisNews() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/morris-blog", { cache: "no-store" });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || "Error");
        setPosts(j.posts);
      } catch (e: any) {
        setErr(e.message);
      }
    };
    run();
  }, []);

  if (err) {
    return (
      <section className="morris-news">
        <header className="mn-head">
          <h2>Novedades de Morris &amp; Opazo</h2>
          <p>Últimos artículos y casos de éxito</p>
        </header>
        <div className="mn-error">
          🛈 No se pudieron cargar las novedades.{" "}
          <a href="https://blog.morrisopazo.com" target="_blank" rel="noreferrer">Ir al blog</a>.
        </div>
      </section>
    );
  }

  return (
    <section className="morris-news">
      <header className="mn-head">
        <h2>Novedades de Morris &amp; Opazo</h2>
        <p>Últimos artículos y casos de éxito</p>
      </header>

      {!posts ? (
        <div className="mn-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mn-card mn-skeleton">
                <div className="mn-sk-line mn-sk-2-3" />
            <div className="mn-sk-line mn-sk-1-2" />
            </div>
        ))}
        </div>
      ) : (
        <div className="mn-grid">
          {posts.map((p, i) => (
            <a
              key={i}
              className="mn-card"
              href={p.link}
              target="_blank"
              rel="noreferrer"
            >
              <div className="mn-title">{p.title}</div>
              {p.pubDate && (
                <div className="mn-date">
                  {new Date(p.pubDate).toLocaleDateString()}
                </div>
              )}
              <div className="mn-excerpt">Leer más…</div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
