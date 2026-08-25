import { NextResponse } from "next/server";

// Dữ liệu dự phòng phòng trường hợp mạng sự cố
const MOCK_COINS = [
  { id: "btcusdt", symbol: "BTC", name: "Bitcoin", current_price: 65420.5, price_change_percentage_24h: 2.35, volume_24h: 35000000000 },
  { id: "ethusdt", symbol: "ETH", name: "Ethereum", current_price: 3450.2, price_change_percentage_24h: -0.85, volume_24h: 18000000000 },
  { id: "solusdt", symbol: "SOL", name: "Solana", current_price: 148.75, price_change_percentage_24h: 5.12, volume_24h: 4500000000 },
  { id: "bnbusdt", symbol: "BNB", name: "BNB", current_price: 580.1, price_change_percentage_24h: 1.15, volume_24h: 1200000000 },
];

// Mapping tên hiển thị cho các đồng phổ biến
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
  LTCUSDT: "Litecoin",
  BCHUSDT: "Bitcoin Cash",
  UNIUSDT: "Uniswap",
  TRXUSDT: "TRON",
  NEARUSDT: "NEAR",
};

export async function GET() {
  try {
    // 1. Gọi API Binance không truyền tham số symbols để lấy TẤT CẢ mã giao dịch trên sàn
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
      next: { revalidate: 30 }, // Cache 30 giây trên Edge Network của Vercel
    });

    if (!res.ok) throw new Error("Lỗi fetch từ Binance API");

    const data = await res.json();

    // 2. Lọc chỉ lấy các cặp đuôi USDT, loại bỏ các token đòn bẩy (UP/DOWN/BEAR/BULL)
    const usdtPairs = data.filter(
      (item: any) =>
        item.symbol.endsWith("USDT") &&
        !item.symbol.includes("UPUSDT") &&
        !item.symbol.includes("DOWNUSDT") &&
        !item.symbol.includes("BEARUSDT") &&
        !item.symbol.includes("BULLUSDT")
    );

    // 3. Sắp xếp danh sách theo khối lượng giao dịch 24h (quoteVolume) từ cao xuống thấp
    usdtPairs.sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));

    // 4. Định dạng dữ liệu trả về cho Frontend
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