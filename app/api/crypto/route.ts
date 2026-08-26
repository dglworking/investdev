import { NextRequest, NextResponse } from "next/server";

// Dữ liệu dự phòng
const MOCK_COINS = [
  { id: "btcusdt", symbol: "BTC", name: "Bitcoin", current_price: 65420.5, price_change_percentage_24h: 2.35, volume_24h: 35000000000 },
  { id: "ethusdt", symbol: "ETH", name: "Ethereum", current_price: 3450.2, price_change_percentage_24h: -0.85, volume_24h: 18000000000 },
  { id: "solusdt", symbol: "SOL", name: "Solana", current_price: 148.75, price_change_percentage_24h: 5.12, volume_24h: 4500000000 },
  { id: "bnbusdt", symbol: "BNB", name: "BNB", current_price: 580.1, price_change_percentage_24h: 1.15, volume_24h: 1200000000 },
];

const COIN_NAMES: Record<string, string> = {
  BTCUSDT: "Bitcoin",
  ETHUSDT: "Ethereum",
  SOLUSDT: "Solana",
  BNBUSDT: "BNB",
  XRPUSDT: "XRP",
  ADAUSDT: "Cardano",
  DOGEUSDT: "Dogecoin",
  AVAXUSDT: "Avalanche",
  DOTUSDT: "Polkadot",
  LINKUSDT: "Chainlink",
  NEARUSDT: "NEAR Protocol",
  SUIUSDT: "Sui",
  APTUSDT: "Aptos",
  PEPEUSDT: "Pepe",
  SHIBUSDT: "Shiba Inu",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (symbol) {
    const formattedSymbol = symbol.toUpperCase().endsWith("USDT")
      ? symbol.toUpperCase()
      : `${symbol.toUpperCase()}USDT`;

    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${formattedSymbol}&limit=20`,
        { next: { revalidate: 2 } } // Cache 2s để cập nhật real-time mượt mà
      );

      if (!res.ok) throw new Error("Lỗi fetch orderbook từ Binance");

      const data = await res.json();

      let bidAccum = 0;
      const bids = (data.bids || []).map(([priceStr, amountStr]: [string, string]) => {
        const price = parseFloat(priceStr);
        const amount = parseFloat(amountStr);
        bidAccum += amount;
        return { price, amount, total: bidAccum };
      });

      let askAccum = 0;
      const asks = (data.asks || []).map(([priceStr, amountStr]: [string, string]) => {
        const price = parseFloat(priceStr);
        const amount = parseFloat(amountStr);
        askAccum += amount;
        return { price, amount, total: askAccum };
      });

      const maxTotal = Math.max(
        bids[bids.length - 1]?.total || 1,
        asks[asks.length - 1]?.total || 1
      );

      return NextResponse.json({ bids, asks, maxTotal });
    } catch (error) {
      console.error("Lỗi API Orderbook Binance, trả dữ liệu dự phòng:", error);
      return NextResponse.json({
        bids: Array.from({ length: 10 }, (_, i) => ({ price: 65000 - i * 10, amount: 0.5, total: (i + 1) * 0.5 })),
        asks: Array.from({ length: 10 }, (_, i) => ({ price: 65010 + i * 10, amount: 0.5, total: (i + 1) * 0.5 })),
        maxTotal: 5.0,
      });
    }
  }

  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error("Lỗi fetch từ Binance API");

    const data = await res.json();

    const usdtPairs = data.filter(
      (item: any) =>
        item.symbol.endsWith("USDT") &&
        !item.symbol.includes("UPUSDT") &&
        !item.symbol.includes("DOWNUSDT") &&
        !item.symbol.includes("BEARUSDT") &&
        !item.symbol.includes("BULLUSDT")
    );

    usdtPairs.sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));

    const formattedData = usdtPairs.map((item: any) => {
      const cleanSymbol = item.symbol.replace("USDT", "");
      return {
        id: item.symbol.toLowerCase(),
        symbol: cleanSymbol,
        name: COIN_NAMES[item.symbol] || cleanSymbol,
        current_price: parseFloat(item.lastPrice),
        price_change_percentage_24h: parseFloat(item.priceChangePercent),
        volume_24h: parseFloat(item.quoteVolume),
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Lỗi API Binance toàn thị trường, sử dụng fallback:", error);
    return NextResponse.json(MOCK_COINS);
  }
}