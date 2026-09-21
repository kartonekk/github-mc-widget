// Personal config — the GitHub organizations previewed on the homepage.
// The /api/badge/org endpoint itself takes any ?login= and isn't limited to
// this list; a matching entry here just adds a subtitle under the org name.

export interface OrgConfigEntry {
  login: string;
  subtitle?: string;
}

export const ORGS_CONFIG = {
  orgs: [
    { login: "Karton-Modding", subtitle: "My minecraft mods" },
    { login: "Kart-Forks", subtitle: "My forks" },
  ] as [OrgConfigEntry, OrgConfigEntry],
};
