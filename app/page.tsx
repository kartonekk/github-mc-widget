"use client";

import { useMemo, useState } from "react";
import { ORGS_CONFIG } from "@/lib/orgs.config";

export default function Home() {
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://your-deployment.vercel.app";
  const profileBadgeUrl = `${origin}/api/badge/profile`;

  const profileMarkdown = useMemo(() => `![Total Downloads](${profileBadgeUrl})`, [profileBadgeUrl]);
  const profileHtml = useMemo(() => `<img src="${profileBadgeUrl}" alt="Total Downloads">`, [profileBadgeUrl]);

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
        project/account age summed across your Modrinth and CurseForge projects, and a public
        repo-count card per GitHub organization. Drop each one in separately.
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

      {ORGS_CONFIG.orgs.map(({ login }) => {
        const badgeUrl = `${origin}/api/badge/org?login=${encodeURIComponent(login)}`;
        const orgPageUrl = `https://github.com/${login}`;
        const markdown = `[![${login}](${badgeUrl})](${orgPageUrl})`;
        const html = `<a href="${orgPageUrl}"><img src="${badgeUrl}" alt="${login}"></a>`;
        return (
          <div className="panel" key={login}>
            <label>Organization card — {login}</label>
            <div className="preview">
              <a href={orgPageUrl} target="_blank" rel="noreferrer">
                <img src={badgeUrl} alt={login} />
              </a>
            </div>
            <pre>{markdown}</pre>
            <button onClick={() => copy(`${login}-md`, markdown)}>
              {copied === `${login}-md` ? "Copied!" : "Copy Markdown"}
            </button>
            <pre>{html}</pre>
            <button onClick={() => copy(`${login}-html`, html)}>
              {copied === `${login}-html` ? "Copied!" : "Copy HTML"}
            </button>
          </div>
        );
      })}

      <div className="panel">
        <label>API reference</label>
        <pre>{`GET /api/badge/profile         (config-driven, see lib/projects.config.ts — no query params)
GET /api/badge/org?login=<org> (any public GitHub org login)`}</pre>
      </div>
    </main>
  );
}
