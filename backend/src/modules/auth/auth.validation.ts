import { AppError } from "../../utils/app-error";

interface RegisterInput {
  email?: unknown;
  password?: unknown;
  name?: unknown;
}

interface LoginInput {
  email?: unknown;
  password?: unknown;
}

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateRegisterBody(input: RegisterInput): RegisterBody {
  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  const password = typeof input.password === "string" ? input.password : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";

  if (!email || !isValidEmail(email)) {
    throw new AppError(400, "A valid email is required");
  }

  if (password.length < 8) {
    throw new AppError(400, "Password must be at least 8 characters long");
  }

  if (!name || name.length < 2) {
    throw new AppError(400, "Name must be at least 2 characters long");
  }

  return { email, password, name };
}

export function validateLoginBody(input: LoginInput): LoginBody {
  const email = typeof input.email === "string" ? normalizeEmail(input.email) : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!email || !isValidEmail(email)) {
    throw new AppError(400, "A valid email is required");
  }

  if (!password) {
    throw new AppError(400, "Password is required");
  }

  return { email, password };
}
