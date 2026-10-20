// Personal config — the GitHub organizations previewed on the homepage.
// The /api/badge/org endpoint itself takes any ?login= and isn't limited to
// this list; a matching entry here adds a subtitle and a custom design.

export interface OrgConfigEntry {
  login: string;
  subtitle?: string;
  accent?: string; // hex; defaults to the brand lime
  // "mods": backdrop collaged from the promo art of the configured mods whose
  //         art.repo lives in this org, with their icons in a row.
  // "repos": recently pushed repo names as chips (default).
  showcase?: "mods" | "repos";
}

export const ORGS_CONFIG = {
  orgs: [
    { login: "Kart-Modding", subtitle: "My minecraft mods", accent: "#c5ff4a", showcase: "mods" },
    { login: "Kart-Forks", subtitle: "My forks", accent: "#58a6ff", showcase: "repos" },
  ] as [OrgConfigEntry, OrgConfigEntry],
};
