export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  percent: number;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}