import { NextResponse } from "next/server";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [row] = await db.select({ total: count() }).from(submissions);
    return NextResponse.json({
      status: "healthy",
      submissions: row?.total ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
