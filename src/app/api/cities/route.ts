import { NextResponse } from "next/server";

type GeoDbCity = {
  id: number;
  city: string;
  region: string;
  countryCode: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();

  if (query.length < 2) {
    return NextResponse.json({ data: [], error: null });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { data: [], error: "RAPIDAPI_KEY is missing. Add key in .env." },
      { status: 200 },
    );
  }

  try {
    const url = new URL("https://wft-geo-db.p.rapidapi.com/v1/geo/cities");
    url.searchParams.set("namePrefix", query);
    url.searchParams.set("countryIds", "IN");
    url.searchParams.set("limit", "7");

    const response = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => ({}))) as { message?: string };
      const providerMessage = (errorPayload.message || "").toLowerCase();

      const userMessage = providerMessage.includes("not subscribed")
        ? "City search service is not active right now. Please choose Other."
        : "City search is unavailable right now. Please choose Other.";

      return NextResponse.json(
        {
          data: [],
          error: userMessage,
        },
        { status: 200 },
      );
    }

    const result = (await response.json()) as { data?: GeoDbCity[] };
    const data = Array.isArray(result.data)
      ? result.data.map((city) => ({
          id: city.id,
          city: city.city,
          region: city.region,
          countryCode: city.countryCode,
          displayName: `${city.city}, ${city.region}`,
        }))
      : [];

    return NextResponse.json({ data, error: null });
  } catch {
    return NextResponse.json(
      { data: [], error: "Could not fetch cities right now. Please use Other." },
      { status: 200 },
    );
  }
}
