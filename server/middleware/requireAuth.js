import { verifyToken } from "../utils/auth.js";

export function requireAuth(request, response, next) {
  const authorizationHeader = request.get("authorization") || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  const token = authorizationHeader.slice(7).trim();

  try {
    const payload = verifyToken(token);

    request.user = {
      id: Number(payload.sub),
      email: payload.email,
      fullName: payload.fullName,
    };

    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired session." });
  }
}