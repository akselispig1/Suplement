import { NextRequest } from "next/server";

export function checkAdminAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true; // dev mode: open
  const token = req.cookies.get("admin_token")?.value || req.nextUrl.searchParams.get("token");
  return token === secret;
}
