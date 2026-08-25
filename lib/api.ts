export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function getHeaders(accessToken?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}
