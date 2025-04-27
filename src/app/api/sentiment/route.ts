import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get("ticker")
  
  if (!ticker) {
    return NextResponse.json(
      { error: "Ticker parameter is required" },
      { status: 400 }
    )
  }

  try {
    // Forward the request to the backend API
    const response = await fetch(`${process.env.API_URL}/sentiment/${ticker}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching sentiment data:", error)
    return NextResponse.json({ error: "Failed to fetch sentiment data" }, { status: 500 })
  }
}