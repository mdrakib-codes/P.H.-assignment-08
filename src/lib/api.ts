export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions {
  method?: ApiMethod;
  body?: unknown;
  headers?: HeadersInit;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

export async function api<T = unknown>(
  path: string,
  { method = "GET", body, headers: customHeaders }: ApiOptions = {},
): Promise<T | null> {
  const headers = new Headers(customHeaders);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`/api/server${path}`, {
    method,
    headers,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const responseText = await response.text();
  let data: unknown = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText) as unknown;
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, response.statusText || "Request failed"),
      response.status,
    );
  }

  return data as T | null;
}
