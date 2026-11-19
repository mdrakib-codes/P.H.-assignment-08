import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const TOKEN_COOKIE = "token";
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.email || !session.user.name) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "JWT is not configured" },
      { status: 500 },
    );
  }

  const token = jwt.sign(
    { email: session.user.email, name: session.user.name },
    secret,
    {
      algorithm: "HS256",
      expiresIn: SEVEN_DAYS_IN_SECONDS,
    },
  );

  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_COOKIE, token, cookieOptions(SEVEN_DAYS_IN_SECONDS));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_COOKIE, "", cookieOptions(0));
  return response;
}
