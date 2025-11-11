import jwt, { type SignOptions } from "jsonwebtoken";
import env from "../config/env.js";

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

const assertSecret = (secret: string | undefined, secretName: string): string => {
  if (!secret) {
    throw new Error(`Missing ${secretName} environment variable`);
  }
  return secret;
};

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = assertSecret(env.JWT_SECRET, "JWT_SECRET");
  const options: SignOptions = {
    expiresIn: (env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = assertSecret(env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET");
  const options: SignOptions = {
    expiresIn: (env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const secret = assertSecret(env.JWT_SECRET, "JWT_SECRET");
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const secret = assertSecret(env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET");
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};
