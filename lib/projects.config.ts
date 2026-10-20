// Personal config — edit this to match your own accounts and projects.
// Each entry pairs the same project across platforms (slugs differ between
// Modrinth and CurseForge) so totals/"best project" can be computed
// correctly instead of guessing by name.
//
// The CurseForge side here must match data/curseforge-projects.json (that
// file drives the scraper; this one is what the app reads at runtime).

export interface CurseForgeRef {
  slug: string;
  category: string; // e.g. "mc-mods", "texture-packs", "modpacks"
}

// Where a mod's promotional art lives inside its GitHub repo (read from the
// default branch via raw.githubusercontent.com). Paths are repo-relative.
// Leave banner/icon out to take that image from Modrinth instead.
export interface RepoArt {
  repo: string; // "owner/name"
  branch?: string; // defaults to "master"
  banner?: string; // wide promo art, used as the mod card's backdrop
  bannerFit?: "cover" | "contain"; // contain for art much wider than 1600x560
  icon?: string; // square mod icon
}

export interface ProjectEntry {
  id: string; // used in /api/badge/mod?id=<id>
  title: string;
  tagline?: string;
  accent?: string; // hex; falls back to the Modrinth project color, then the brand lime
  modrinthSlug?: string;
  curseforge?: CurseForgeRef;
  // Without it, art comes from Modrinth: the featured gallery screenshot as the
  // banner and the Modrinth icon (no screenshot → blurred icon as the backdrop).
  art?: RepoArt;
  // Direct image URLs (e.g. a specific Modrinth gallery image); these win over art and Modrinth.
  bannerUrl?: string;
  iconUrl?: string;
}

export const AUTHOR_CONFIG = {
  modrinthUser: "Kartonek",
  displayName: "Kartonekk",
  githubUser: "kartonekk",
  accent: "#c5ff4a",

  projects: [
    {
      id: "head-locator",
      title: "Head Locator",
      tagline: "Real player heads on the locator bar",
      accent: "#62e021",
      modrinthSlug: "headlocator",
      curseforge: { slug: "head-locator", category: "mc-mods" },
      art: {
        repo: "Kart-Modding/HeadTracker",
        banner: "Promotional Images/Infographics/banner.png",
        icon: "src/main/resources/assets/headtracker/icon.png",
      },
    },
    {
      id: "tiny",
      title: "Tiny Players",
      modrinthSlug: "tiny",
      curseforge: { slug: "tiny-players", category: "mc-mods" },
      art: { repo: "Kart-Modding/Tiny", branch: "main" }, // screenshot + icon from Modrinth
    },
    {
      id: "spoty-widget",
      title: "Spoty Widget",
      tagline: "Your Spotify “now playing” in the HUD",
      modrinthSlug: "spoty-widget",
      curseforge: { slug: "spoty-widget", category: "mc-mods" },
      art: { repo: "Kart-Modding/SpotifyMusicMod", branch: "main", banner: "docs/images/banner.png", bannerFit: "contain" }, // icon from Modrinth
    },
    { id: "hmi-tiny-items", title: "[HMI] Tiny Items", modrinthSlug: "hmi-tiny-items", curseforge: { slug: "hmi-tiny-items", category: "texture-packs" } },
    {
      id: "kck",
      title: "Kart's Chaotic Kit",
      modrinthSlug: "kck", // not published on CurseForge
      bannerUrl: "https://cdn.modrinth.com/data/Fp1xKkvp/images/9ca1fb4edf3e1016a88978a6c6a90aaa5bfe432f.png",
      iconUrl: "https://cdn.modrinth.com/data/Fp1xKkvp/1df58c7290e5e63926fee829fb097f62202f06fd_96.webp",
    },
  ] as ProjectEntry[],
};

export function repoFileUrl(art: RepoArt, path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${art.repo}/${art.branch ?? "master"}/${encoded}`;
}
