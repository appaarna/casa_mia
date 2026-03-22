import type { JwtPayload } from "jsonwebtoken";

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  type: "access" | "refresh";
}
