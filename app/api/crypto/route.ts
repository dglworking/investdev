import { NextResponse } from "next/server";
import { fetchCryptoMarkets } from "@/features/stocks/provider";

export async function GET() {
  try {
    const data = await fetchCryptoMarkets();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        message: "Failed to load crypto market.",
      },
      {
        status: 500,
      }
    );
  }
}