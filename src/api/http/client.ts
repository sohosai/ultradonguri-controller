/**
 * HTTP client with JSON support
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "";
  const url = baseURL ? `${baseURL}${path}` : path;

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // For responses with no content (204, etc.), return undefined for void types
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return response.json();
}
