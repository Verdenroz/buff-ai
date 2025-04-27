import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Extract the key query parameter from the request URL
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  // Validate that key exists
  if (!key) {
    return NextResponse.json(
      { error: "Missing required query parameter 'key'" },
      { status: 400 }
    );
  }

  try {
    // Forward the request to the backend API
    const response = await fetch(
      `${process.env.API_URL}/tts?key=${encodeURIComponent(key)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching TTS audio:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio file" },
      { status: 500 }
    );
  }
}