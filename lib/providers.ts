export type ProviderName = "captain" | "sansekai";

export type ProviderConfig = {
  name: ProviderName;
  baseUrl: string;
  token?: string;
};

export function getProviderConfig(name: ProviderName): ProviderConfig {
  if (name === "captain") {
    return {
      name,
      baseUrl: process.env.CAPTAIN_API_URL || "https://captain.sapimu.au",
      token: process.env.CAPTAIN_API_TOKEN,
    };
  }

  return {
    name,
    baseUrl: process.env.SANSEKAI_API_URL || "https://api.sansekai.my.id",
  };
}

export async function providerFetch(name: ProviderName, path: string, init?: RequestInit) {
  const provider = getProviderConfig(name);
  const headers = new Headers(init?.headers);
  headers.set("User-Agent", "Mozilla/5.0 DRACIN/1.0");
  headers.set("Accept", "application/json, text/plain, text/html, */*");

  if (provider.token) {
    headers.set("Authorization", `Bearer ${provider.token}`);
    // Captain's documentation UI now authenticates via an auth_token cookie.
    // Supplying both methods server-side keeps the API token out of the browser
    // while allowing DRACIN to introspect authenticated docs when routes move.
    if (name === "captain") headers.set("Cookie", `auth_token=${encodeURIComponent(provider.token)}`);
  }

  return fetch(`${provider.baseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
