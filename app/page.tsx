"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://your-deployment.vercel.app";
  const profileBadgeUrl = `${origin}/api/badge/profile`;
  const orgsBadgeUrl = `${origin}/api/badge/orgs`;

  const profileMarkdown = useMemo(() => `![Total Downloads](${profileBadgeUrl})`, [profileBadgeUrl]);
  const profileHtml = useMemo(() => `<img src="${profileBadgeUrl}" alt="Total Downloads">`, [profileBadgeUrl]);

  const orgsMarkdown = useMemo(() => `![Organizations](${orgsBadgeUrl})`, [orgsBadgeUrl]);
  const orgsHtml = useMemo(() => `<img src="${orgsBadgeUrl}" alt="Organizations">`, [orgsBadgeUrl]);

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main>
      <h1>github-mc-widget</h1>
      <p className="subtitle">
        Dashboard-style SVG cards for a GitHub profile README — total downloads/best
        project/account age summed across your Modrinth and CurseForge projects, and public repo
        counts for your organizations. Both are config-driven (lib/projects.config.ts,
        lib/orgs.config.ts) — no query params needed.
      </p>

      <div className="panel">
        <label>Profile card — downloads, best project, account age</label>
        <div className="preview">
          <img src={profileBadgeUrl} alt="Total Downloads" />
        </div>
        <pre>{profileMarkdown}</pre>
        <button onClick={() => copy("profile-md", profileMarkdown)}>
          {copied === "profile-md" ? "Copied!" : "Copy Markdown"}
        </button>
        <pre>{profileHtml}</pre>
        <button onClick={() => copy("profile-html", profileHtml)}>
          {copied === "profile-html" ? "Copied!" : "Copy HTML"}
        </button>
      </div>

      <div className="panel">
        <label>Organizations card — public repo count per org</label>
        <div className="preview">
          <img src={orgsBadgeUrl} alt="Organizations" />
        </div>
        <pre>{orgsMarkdown}</pre>
        <button onClick={() => copy("orgs-md", orgsMarkdown)}>
          {copied === "orgs-md" ? "Copied!" : "Copy Markdown"}
        </button>
        <pre>{orgsHtml}</pre>
        <button onClick={() => copy("orgs-html", orgsHtml)}>
          {copied === "orgs-html" ? "Copied!" : "Copy HTML"}
        </button>
      </div>

      <div className="panel">
        <label>API reference</label>
        <pre>{`GET /api/badge/profile  (config-driven, see lib/projects.config.ts — no query params)
GET /api/badge/orgs     (config-driven, see lib/orgs.config.ts — no query params)`}</pre>
      </div>
    </main>
  );
}
