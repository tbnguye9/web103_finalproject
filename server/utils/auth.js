import jwt from "jsonwebtoken";

const fallbackSecret = "studybuddyplannersecret";

function getJwtSecret() {
  return process.env.JWT_SECRET || fallbackSecret;
}

export function createToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      fullName: user.full_name,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function serializeUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    createdAt: user.created_at,
  };
}