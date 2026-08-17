import { API } from "./api";

/* chứng khoán */

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent: number;
}

interface StockResponse {
  success: boolean;
  data: TickerItem[];
}

export interface MarketSummary {
  VNINDEX: any[];
  VN30: any[];
  HNX: any[];
  UPCOM: any[];
}

/* crypto */

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface CryptoApiItem {
  symbol: string;
  name: string;
  price: number;
  percent: number;
}

interface CryptoResponse {
  success: boolean;
  data: CryptoApiItem[];
}

export interface CryptoItem {
  symbol: string;
  full_symbol: string;
  price: number;
  change: number;
  percent: number;
  high: number;
  low: number;
  volume: number;
}

// Kiểu dữ liệu cho Bảng danh sách Crypto
export interface CryptoTableItem {
  rank: number;
  symbol: string;
  full_symbol: string;
  name: string;
  price: number;
  percent_1h: number;
  percent_24h: number;
  percent_7d: number;
  volume_24h: number;
  market_cap: number;
  high_24h: number;
  low_24h: number;
  sparkline: number[];
}

export interface ChartPoint {
  timestamp: number;
  price: number;
}

// Kiểu dữ liệu nến cho Biểu đồ chi tiết
export interface ChartCandle {
  timestamp: number;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

/* stock api */

export async function getStockMarket(): Promise<TickerItem[]> {
  try {
    const res = await fetch(API.stock, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`${API.stock} -> ${res.status}`);
      return [];
    }

    const json: StockResponse = await res.json();

    if (!json.success) {
      return [];
    }

    return json.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getMarketSummary(): Promise<MarketSummary | null> {
  try {
    const res = await fetch(API.summary, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`${API.summary} -> ${res.status}`);
      return null;
    }

    const json = await res.json();

    if (!json.success) {
      return null;
    }

    return json.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/* crypto api */

export async function getCryptoMarket(): Promise<Coin[]> {
  try {
    const res = await fetch(API.crypto, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`${API.crypto} -> ${res.status}`);
      return [];
    }

    const json: CryptoResponse = await res.json();

    if (!json.success) {
      return [];
    }

    return json.data.map((item) => ({
      id: item.symbol.toLowerCase(),
      symbol: item.symbol,
      name: item.name,
      current_price: item.price,
      price_change_percentage_24h: item.percent,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getAllCryptos(): Promise<CryptoTableItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/crypto/all`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getCryptoChart(
  symbol: string,
  interval: string = "1m"
): Promise<ChartCandle[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/crypto/chart?symbol=${symbol}&interval=${interval}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* sổ lệnh crypto */

export interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookItem[];
  asks: OrderBookItem[];
  maxTotal: number;
}

export async function getCryptoOrderBook(symbol: string): Promise<OrderBookData | null> {
  try {
    const formattedSymbol = symbol.toUpperCase().endsWith("USDT")
      ? symbol.toUpperCase()
      : `${symbol.toUpperCase()}USDT`;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/crypto/orderbook?symbol=${formattedSymbol}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;

    let bidAccum = 0;
    const bids: OrderBookItem[] = (json.bids || []).map(([price, amount]: [number, number]) => {
      bidAccum += amount;
      return { price, amount, total: bidAccum };
    });

    let askAccum = 0;
    const asks: OrderBookItem[] = (json.asks || []).map(([price, amount]: [number, number]) => {
      askAccum += amount;
      return { price, amount, total: askAccum };
    });

    const maxTotal = Math.max(
      bids[bids.length - 1]?.total || 1,
      asks[asks.length - 1]?.total || 1
    );

    return { bids, asks, maxTotal };
  } catch (err) {
    console.error(err);
    return null;
  }
}