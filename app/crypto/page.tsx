"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Search } from "lucide-react";
import { getAllCryptos, type CryptoTableItem } from "@/features/stocks/service";

export default function CryptoListPage() {
  const router = useRouter();
  const [coins, setCoins] = useState<CryptoTableItem[]>([]);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getAllCryptos();
      setCoins(data);
      setLoading(false);
    }
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [symbol]: !prev[symbol] }));
  };

  const filteredCoins = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  // VẼ SPARKLINE CÓ HIỆU ỨNG GRADIENT & ĐƯỜNG CONG
  const renderSparkline = (points: number[], isPositive: boolean, symbol: string) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 140;
    const height = 40;

    const formattedPoints = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 8) - 4;
      return { x, y };
    });

    const linePath = formattedPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    const color = isPositive ? "#16a34a" : "#dc2626";
    const gradId = `sparkline-grad-${symbol}`;

    return (
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-white dark:bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thị trường Tiền mã hóa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Giá tiền mã hóa theo vốn hóa thị trường từ Binance
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm đồng coin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:border-slate-800 focus:outline-none"
          />
        </div>
      </div>

      <div className="border rounded-xl bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b text-[12px] font-semibold text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
              <th className="py-3.5 px-3 w-10 text-center"></th>
              <th className="py-3.5 px-2 w-12">#</th>
              <th className="py-3.5 px-4">Tên</th>
              <th className="py-3.5 px-4 text-right">Giá</th>
              <th className="py-3.5 px-4 text-right">1h %</th>
              <th className="py-3.5 px-4 text-right">24h %</th>
              <th className="py-3.5 px-4 text-right">7d %</th>
              <th className="py-3.5 px-4 text-right">Khối lượng (24h)</th>
              <th className="py-3.5 px-4 text-right">Vốn hóa thị trường</th>
              <th className="py-3.5 px-6 text-center">7 ngày gần nhất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 animate-pulse">
                  Đang tải bảng giá Crypto...
                </td>
              </tr>
            ) : (
              filteredCoins.map((coin) => {
                const is24hPos = coin.percent_24h >= 0;
                const is7dPos = coin.percent_7d >= 0;

                return (
                  <tr
                    key={coin.symbol}
                    onClick={() => router.push(`/crypto/${coin.symbol.toLowerCase()}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-3 text-center">
                      <button
                        onClick={(e) => toggleFavorite(e, coin.symbol)}
                        className="text-slate-300 hover:text-amber-400 transition-colors"
                      >
                        <Star
                          size={16}
                          className={favorites[coin.symbol] ? "fill-amber-400 text-amber-400" : ""}
                        />
                      </button>
                    </td>

                    <td className="py-4 px-2 text-xs font-bold text-slate-400">{coin.rank}</td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                          {coin.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase">
                          {coin.symbol}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className={`py-4 px-4 text-right font-mono text-xs font-semibold ${coin.percent_1h >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {coin.percent_1h >= 0 ? "▲" : "▼"} {Math.abs(coin.percent_1h)}%
                    </td>

                    <td className={`py-4 px-4 text-right font-mono text-xs font-semibold ${is24hPos ? "text-green-600" : "text-red-500"}`}>
                      {is24hPos ? "▲" : "▼"} {Math.abs(coin.percent_24h)}%
                    </td>

                    <td className={`py-4 px-4 text-right font-mono text-xs font-semibold ${is7dPos ? "text-green-600" : "text-red-500"}`}>
                      {is7dPos ? "▲" : "▼"} {Math.abs(coin.percent_7d)}%
                    </td>

                    <td className="py-4 px-4 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                      ${Math.round(coin.volume_24h).toLocaleString("en-US")}
                    </td>

                    <td className="py-4 px-4 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                      ${Math.round(coin.market_cap).toLocaleString("en-US")}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center">
                        {renderSparkline(coin.sparkline, is7dPos, coin.symbol)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}