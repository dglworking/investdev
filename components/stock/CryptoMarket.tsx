"use client";

import { useEffect, useState } from "react";
import { getCryptoMarket } from "@/features/stocks/service";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
};

export default function CryptoMarket() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getCryptoMarket();

      setCoins(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p>Loading crypto market...</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="rounded-2xl border bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-bold uppercase">
            {coin.symbol}
          </h2>

          <p className="mt-2 text-2xl font-bold">
            ${coin.current_price.toLocaleString()}
          </p>

          <p
            className={`mt-2 font-medium ${
              coin.price_change_percentage_24h >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {coin.price_change_percentage_24h.toFixed(2)}%
          </p>
        </div>
      ))}
    </div>
  );
}