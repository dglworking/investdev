import { NextResponse } from "next/server";

// Dữ liệu dự phòng phòng trường hợp mạng sự cố
const MOCK_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", current_price: 65420.5, price_change_percentage_24h: 2.35 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", current_price: 3450.2, price_change_percentage_24h: -0.85 },
  { id: "solana", symbol: "SOL", name: "Solana", current_price: 148.75, price_change_percentage_24h: 5.12 },
  { id: "binancecoin", symbol: "BNB", name: "BNB", current_price: 580.1, price_change_percentage_24h: 1.15 },
];

const COIN_NAMES: Record<string, string> = {
  BTCUSDT: "Bitcoin",
  ETHUSDT: "Ethereum",
  SOLUSDT: "Solana",
  BNBUSDT: "BNB",
};

export async function GET() {
  try {
    const symbols = JSON.stringify(["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"]);
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
      {
        next: { revalidate: 30 }, // Lưu cache 30 giây trên Edge Network của Vercel
      }
    );

    if (!res.ok) throw new Error("Lỗi fetch từ Binance API");

    const data = await res.json();

    
    const formattedData = data.map((item: any) => ({
      id: item.symbol.toLowerCase(),
      symbol: item.symbol.replace("USDT", ""),
      name: COIN_NAMES[item.symbol] || item.symbol,
      current_price: parseFloat(item.lastPrice),
      price_change_percentage_24h: parseFloat(item.priceChangePercent),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Lỗi API Binance, sử dụng fallback:", error);
    return NextResponse.json(MOCK_COINS);
  }
}