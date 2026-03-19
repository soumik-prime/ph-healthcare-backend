import { IncomingHttpHeaders } from "node:http";

export const buildAuthHeaders = (
  headers: IncomingHttpHeaders,
  options?: {
    includeCookie?: boolean;
  },
): Record<string, string> => {
  const cleanHeaders: Record<string, string> = {};

  const userAgent = headers["user-agent"];
  if (userAgent) {
    cleanHeaders["user-agent"] = Array.isArray(userAgent)
      ? userAgent.join(" ")
      : userAgent;
  }

  const xForwardedFor = headers["x-forwarded-for"];
  const xRealIp = headers["x-real-ip"];
  const cfConnectingIp = headers["cf-connecting-ip"];

  const rawIp =
    (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor) ??
    (Array.isArray(xRealIp) ? xRealIp[0] : xRealIp) ??
    (Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp);

  if (rawIp) {
    cleanHeaders["x-forwarded-for"] = rawIp.split(",")[0].trim();
  }

  if (options?.includeCookie) {
    const cookie = headers.cookie;
    if (cookie) {
      cleanHeaders.cookie = Array.isArray(cookie) ? cookie.join("; ") : cookie;
    }
  }

  return cleanHeaders;
};
