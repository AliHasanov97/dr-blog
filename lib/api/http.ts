import { API_BASE_URL, MOCK_LATENCY } from "./config";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Next.js keş davranışı */
  revalidate?: number;
}

/**
 * C# API üçün nazik fetch örtüyü.
 * USE_MOCK=false olduqda service funksiyaları bunu çağıracaq.
 */
export async function http<T>(
  path: string,
  { body, revalidate, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    next: revalidate === undefined ? undefined : { revalidate },
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }
    throw new ApiError(
      `API sorğusu uğursuz oldu: ${response.status}`,
      response.status,
      details,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Mock cavabları üçün köməkçi */
export function mockResponse<T>(data: T): Promise<T> {
  if (MOCK_LATENCY <= 0) return Promise.resolve(data);
  return new Promise((resolve) =>
    setTimeout(() => resolve(data), MOCK_LATENCY),
  );
}
