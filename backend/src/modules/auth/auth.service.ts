import jwt from "jsonwebtoken";
import { AppError } from "../../utils/app-error";
import { hashPassword, verifyPassword } from "../../utils/password";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/tokens";
import {
  createUser,
  findActiveRefreshToken,
  findUserByEmail,
  findUserById,
  insertRefreshToken,
  revokeRefreshTokenByHash
} from "./auth.repository";
import type { LoginBody, RegisterBody } from "./auth.validation";

interface AuthTokens {
  accessToken: string;
}

interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AuthResult extends AuthTokens {
  user: AuthUser;
  refreshToken: string;
}

function computeRefreshExpiry(): Date {
  const now = Date.now();
  const ttl = 30 * 24 * 60 * 60 * 1000;
  return new Date(now + ttl);
}

async function buildAuthResult(user: AuthUser): Promise<AuthResult> {
  const accessToken = signAccessToken({ sub: String(user.id), email: user.email });
  const refreshToken = signRefreshToken({ sub: String(user.id), email: user.email });

  await insertRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: computeRefreshExpiry()
  });

  return {
    user,
    accessToken,
    refreshToken
  };
}

export async function register(input: RegisterBody): Promise<AuthResult> {
  const existingUser = await findUserByEmail(input.email);
  if (existingUser) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);
  
  // Enforce apa@email.com as the sole admin credential automatically
  const role = input.email.toLowerCase() === 'apa@email.com' ? 'ADMIN' : 'USER';
  
  const userId = await createUser({
    email: input.email,
    passwordHash,
    name: input.name,
    role
  });

  return buildAuthResult({
    id: userId,
    email: input.email,
    name: input.name,
    role
  });
}

export async function login(input: LoginBody): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(input.password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  return buildAuthResult({
    id: Number(user.id),
    email: user.email,
    name: user.name,
    role: user.role
  });
}

export async function refresh(refreshToken: string): Promise<AuthResult> {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    throw error;
  }

  if (payload.type !== "refresh") {
    throw new AppError(401, "Invalid refresh token");
  }

  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError(401, "Invalid refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const tokenRecord = await findActiveRefreshToken({ userId, tokenHash });
  if (!tokenRecord) {
    throw new AppError(401, "Invalid or revoked refresh token");
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(401, "User no longer exists");
  }

  await revokeRefreshTokenByHash({ userId, tokenHash });

  return buildAuthResult({
    id: Number(user.id),
    email: user.email,
    name: user.name,
    role: user.role
  });
}

export async function logout(refreshToken?: string): Promise<void> {
  if (!refreshToken) {
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return;
    }

    await revokeRefreshTokenByHash({
      userId,
      tokenHash: hashToken(refreshToken)
    });
  } catch {
    return;
  }
}
