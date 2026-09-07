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
    baseUrl: process.env.SANSEKAI_API_URL || "https://api.sansekai.my.id/api",
  };
}

export async function providerFetch(name: ProviderName, path: string, init?: RequestInit) {
  const provider = getProviderConfig(name);
  const endpoint = `${provider.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);
  headers.set("User-Agent", "Mozilla/5.0 DRACIN/1.0");
  headers.set("Accept", "application/json, text/plain, text/html, */*");

  if (provider.token) {
    headers.set("Authorization", `Bearer ${provider.token}`);
    if (name === "captain") headers.set("Cookie", `auth_token=${encodeURIComponent(provider.token)}`);
  }

  const timeoutSignal = AbortSignal.timeout(10_000);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;

  console.log("[DRACIN]", "provider-request", { provider: name, endpoint });

  try {
    const response = await fetch(endpoint, {
      ...init,
      headers,
      signal,
      cache: "no-store",
    });
    console.log("[DRACIN]", "provider-response", { provider: name, endpoint, status: response.status });
    return response;
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
      throw new Error(`Provider ${name} terlalu lama merespons. Silakan coba lagi.`);
    }
    throw error;
  }
}
