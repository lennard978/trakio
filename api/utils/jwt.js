import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";
const JWT_ISSUER = "trakio";
const JWT_AUDIENCE = "trakio-app";

/* ------------------------------------------------------------------ */
/* Sign JWT                                                           */
/* ------------------------------------------------------------------ */

export function signToken(payload) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("JWT payload must be an object");
  }

  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

/* ------------------------------------------------------------------ */
/* Verify JWT                                                         */
/* ------------------------------------------------------------------ */

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) return null;

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTolerance: 10, // seconds
    });

    // Normalize payload
    return {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (err) {
    // Token expired / invalid / tampered
    return null;
  }
}
