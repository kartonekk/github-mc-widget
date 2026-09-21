"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [modrinth, setModrinth] = useState("sodium");
  const [curseforge, setCurseforge] = useState("sodium");
  const [category, setCategory] = useState("mc-mods");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [style, setStyle] = useState<"flat" | "flat-square" | "for-the-badge">("flat");
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://your-deployment.vercel.app";

  const params = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ theme, style, ...extra });
    return p.toString();
  };

  const modrinthBadgeUrl = `${origin}/api/badge/modrinth?${params({ project: modrinth })}`;
  const modrinthPageUrl = `https://modrinth.com/project/${modrinth}`;

  const curseforgeBadgeUrl = `${origin}/api/badge/curseforge?${params({ slug: curseforge, category })}`;
  const curseforgePageUrl = `https://www.curseforge.com/minecraft/${category}/${curseforge}`;

  const markdown = useMemo(
    () =>
      `[![Modrinth Downloads](${modrinthBadgeUrl})](${modrinthPageUrl})\n` +
      `[![CurseForge Downloads](${curseforgeBadgeUrl})](${curseforgePageUrl})`,
    [modrinthBadgeUrl, modrinthPageUrl, curseforgeBadgeUrl, curseforgePageUrl]
  );

  const html = useMemo(
    () =>
      `<a href="${modrinthPageUrl}"><img src="${modrinthBadgeUrl}" alt="Modrinth Downloads"></a>\n` +
      `<a href="${curseforgePageUrl}"><img src="${curseforgeBadgeUrl}" alt="CurseForge Downloads"></a>`,
    [modrinthBadgeUrl, modrinthPageUrl, curseforgeBadgeUrl, curseforgePageUrl]
  );

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main>
      <h1>github-mc-widget</h1>
      <p className="subtitle">
        Download-count badges for Modrinth &amp; CurseForge. Each badge is its own image linking
        straight to that platform&apos;s project page — drop both into your GitHub profile README.
      </p>

      <div className="panel">
        <div className="row">
          <div>
            <label htmlFor="modrinth">Modrinth project slug or ID</label>
            <input id="modrinth" value={modrinth} onChange={(e) => setModrinth(e.target.value)} />
          </div>
          <div>
            <label htmlFor="curseforge">CurseForge slug</label>
            <input id="curseforge" value={curseforge} onChange={(e) => setCurseforge(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <div>
            <label htmlFor="category">CurseForge category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="mc-mods">mc-mods</option>
              <option value="modpacks">modpacks</option>
              <option value="texture-packs">texture-packs</option>
              <option value="shaders">shaders</option>
              <option value="worlds">worlds</option>
            </select>
          </div>
          <div>
            <label htmlFor="style">Style</label>
            <select id="style" value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
              <option value="flat">flat</option>
              <option value="flat-square">flat-square</option>
              <option value="for-the-badge">for-the-badge</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <label htmlFor="theme">Theme</label>
            <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
              <option value="dark">dark</option>
              <option value="light">light</option>
            </select>
          </div>
          <div />
        </div>
      </div>

      <div className="panel">
        <label>Preview — click a badge to open its project page</label>
        <div className="preview">
          <a href={modrinthPageUrl} target="_blank" rel="noreferrer">
            <img src={modrinthBadgeUrl} alt="Modrinth Downloads" />
          </a>
          <a href={curseforgePageUrl} target="_blank" rel="noreferrer">
            <img src={curseforgeBadgeUrl} alt="CurseForge Downloads" />
          </a>
        </div>
      </div>

      <div className="panel">
        <label>Markdown (GitHub README)</label>
        <pre>{markdown}</pre>
        <button onClick={() => copy(markdown)}>{copied ? "Copied!" : "Copy Markdown"}</button>
      </div>

      <div className="panel">
        <label>HTML</label>
        <pre>{html}</pre>
        <button onClick={() => copy(html)}>{copied ? "Copied!" : "Copy HTML"}</button>
      </div>

      <div className="panel">
        <label>API reference</label>
        <pre>{`GET /api/badge/modrinth?project=<slug-or-id>[&theme=&style=&color=&label=&logo=false]
GET /api/badge/curseforge?slug=<slug>[&category=mc-mods][&id=<numeric-id>][&theme=&style=&color=&label=&logo=false]
GET /api/badge/combined?modrinth=<slug>&curseforge=<slug>[&category=][&theme=&style=&color=&label=]`}</pre>
      </div>
    </main>
  );
}
