import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (code !== process.env.TRIP_ACCESS_CODE) {
    return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("trip-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
