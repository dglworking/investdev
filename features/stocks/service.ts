import { API } from "./api";

/* ============================
   STOCK
============================ */

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



/* ============================
   CRYPTO
============================ */

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

/* ============================
   STOCK API
============================ */

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

/* ============================
   CRYPTO API
============================ */

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

export interface MarketSummary {
  VNINDEX: any[];
  VN30: any[];
  HNX: any[];
  UPCOM: any[];
}

export async function getMarketSummary(): Promise<MarketSummary | null> {
  try {
    const res = await fetch(
      `${API.summary}`,
      {
        cache: "no-store",
      }
    );

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