import { type NextRequest, NextResponse } from "next/server"
import { getFloatProfile } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const floatId = params.id
  const profile = getFloatProfile(floatId)

  if (!profile) {
    return NextResponse.json({ error: "Float profile not found" }, { status: 404 })
  }

  return NextResponse.json({
    floatId,
    profile,
    lastUpdated: new Date().toISOString(),
  })
}
