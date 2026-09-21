"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://your-deployment.vercel.app";
  const profileBadgeUrl = `${origin}/api/badge/profile`;

  const markdown = useMemo(() => `![Total Downloads](${profileBadgeUrl})`, [profileBadgeUrl]);
  const html = useMemo(
    () => `<img src="${profileBadgeUrl}" alt="Total Downloads">`,
    [profileBadgeUrl]
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
        A dashboard-style profile card — total downloads, best project, and account age, summed
        across your Modrinth and CurseForge projects (config-driven, see
        lib/projects.config.ts). Drop it into your GitHub profile README.
      </p>

      <div className="panel">
        <label>Preview</label>
        <div className="preview">
          <img src={profileBadgeUrl} alt="Total Downloads" />
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
        <pre>{`GET /api/badge/profile  (config-driven, see lib/projects.config.ts — no query params)`}</pre>
      </div>
    </main>
  );
}
