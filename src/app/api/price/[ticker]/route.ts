import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { ticker: string } }) {
  const { ticker } = await params
  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period")

  try {
    // Forward the request to the backend API
    const response = await fetch(`${process.env.API_URL}/price/${ticker}?period=${period}`, {
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
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}
