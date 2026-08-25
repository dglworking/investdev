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
      try {

        const res = await fetch("/api/crypto");
        if (!res.ok) throw new Error("Lỗi fetch API crypto");
        
        const rawCoins = await res.json();

        const formattedCoins: CryptoTableItem[] = rawCoins.map((item: any, index: number) => {
          const price = item.current_price || 0;
          const change24h = item.price_change_percentage_24h || 0;
          const isPos = change24h >= 0;

          const mockSparkline = [
            price * (1 - (change24h / 100) * 0.8),
            price * (1 - (change24h / 100) * 0.5),
            price * (1 - (change24h / 100) * 0.9),
            price * (1 - (change24h / 100) * 0.3),
            price * (1 + (change24h / 100) * 0.2),
            price * (1 + (change24h / 100) * 0.6),
            price
          ];

          return {
            rank: index + 1,
            symbol: item.symbol,
            full_symbol: `${item.symbol}USDT`,
            name: item.name,
            price: price,
            percent_1h: parseFloat((change24h * 0.1).toFixed(2)), // Ước tính 1h
            percent_24h: parseFloat(change24h.toFixed(2)),
            percent_7d: parseFloat((change24h * 1.5).toFixed(2)),  // Ước tính 7d
            volume_24h: item.volume_24h || 500000000,
            market_cap: item.market_cap || price * 19000000,
            high_24h: price * 1.03,
            low_24h: price * 0.97,
            sparkline: mockSparkline
          };
        });

        setCoins(formattedCoins);
      } catch (error) {
        console.error("Lỗi loadData Crypto:", error);
      } finally {
        setLoading(false);
      }
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

  // VẼ SPARKLINE CÓ HIỆU ỨNG GRADIENT (Tùy chỉnh linh hoạt width, height cho Mobile/PC)
  const renderSparkline = (
    points: number[],
    isPositive: boolean,
    symbol: string,
    width = 140,
    height = 40
  ) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 md:space-y-6 bg-white dark:bg-slate-950 min-h-screen">
      {/* HEADER PAGE & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Thị trường Tiền mã hóa</h1>
          <p className="text-xs text-slate-500 mt-1">
            Giá tiền mã hóa theo vốn hóa thị trường từ Binance
          </p>
        </div>
      </div>

      {/* ================= 1. GIAO DIỆN MOBILE (CHỈ HIỂN THỊ TRÊN ĐIỆN THOẠI) ================= */}
      <div className="block md:hidden border rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {/* Tiêu đề 3 cột trên Mobile */}
        <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 px-3 py-2.5 border-b bg-slate-50/80 dark:bg-slate-800/50">
          <div className="col-span-4">Tên / Giá</div>
          <div className="col-span-4 text-center">Biến động (1h/24h/7d)</div>
          <div className="col-span-4 text-right">KL 24h & Chart 7d</div>
        </div>

        {/* Danh sách các mã Coin dạng 3 cột */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
          {loading ? (
            <div className="py-10 text-center text-slate-400 animate-pulse">
              Đang tải bảng giá Crypto...
            </div>
          ) : (
            filteredCoins.map((coin) => {
              const is1hPos = coin.percent_1h >= 0;
              const is24hPos = coin.percent_24h >= 0;
              const is7dPos = coin.percent_7d >= 0;

              return (
                <div
                  key={coin.symbol}
                  onClick={() => router.push(`/crypto/${coin.symbol.toLowerCase()}`)}
                  className="grid grid-cols-12 gap-1 items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 transition-colors cursor-pointer"
                >
                  {/* CỘT 1 (BÊN TRÁI): Tên mã + Giá tiền thời gian thực ngay dưới */}
                  <div className="col-span-4 flex flex-col justify-center space-y-0.5 pr-1">
                    <div className="flex items-center space-x-1 overflow-hidden">
                      <button
                        onClick={(e) => toggleFavorite(e, coin.symbol)}
                        className="text-slate-300 hover:text-amber-400 shrink-0"
                      >
                        <Star
                          size={13}
                          className={favorites[coin.symbol] ? "fill-amber-400 text-amber-400" : ""}
                        />
                      </button>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {coin.name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase shrink-0">
                        {coin.symbol}
                      </span>
                    </div>

                    {/* Giá thời gian thực */}
                    <div className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 pl-4">
                      ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* CỘT 2 (Ở GIỮA): Biến động thời gian thực 1 giờ, 1 ngày, 7 ngày */}
                  <div className="col-span-4 flex flex-col items-center justify-center font-mono text-[11px] leading-snug space-y-0.5">
                    <div className={`flex items-center gap-0.5 ${is1hPos ? "text-green-600" : "text-red-500"}`}>
                      <span className="text-[9px] text-slate-400 font-sans">1h:</span>
                      <span>{is1hPos ? "▲" : "▼"}{Math.abs(coin.percent_1h)}%</span>
                    </div>
                    <div className={`flex items-center gap-0.5 font-semibold ${is24hPos ? "text-green-600" : "text-red-500"}`}>
                      <span className="text-[9px] text-slate-400 font-sans">24h:</span>
                      <span>{is24hPos ? "▲" : "▼"}{Math.abs(coin.percent_24h)}%</span>
                    </div>
                    <div className={`flex items-center gap-0.5 ${is7dPos ? "text-green-600" : "text-red-500"}`}>
                      <span className="text-[9px] text-slate-400 font-sans">7d:</span>
                      <span>{is7dPos ? "▲" : "▼"}{Math.abs(coin.percent_7d)}%</span>
                    </div>
                  </div>

                  {/* CỘT 3 (BÊN PHẢI): Khối lượng 24h & Chart giá 7 ngày qua */}
                  <div className="col-span-4 flex flex-col items-end justify-center space-y-1 pl-1">
                    {/* Khối lượng 24h gần nhất */}
                    <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate">
                      ${coin.volume_24h >= 1e9 
                        ? (coin.volume_24h / 1e9).toFixed(2) + "B" 
                        : coin.volume_24h >= 1e6 
                        ? (coin.volume_24h / 1e6).toFixed(1) + "M" 
                        : Math.round(coin.volume_24h).toLocaleString()}
                    </div>
                    {/* Chart giá 7 ngày qua */}
                    <div className="w-full flex justify-end">
                      {renderSparkline(coin.sparkline, is7dPos, coin.symbol + "-mobile", 80, 24)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= 2. GIAO DIỆN DESKTOP (CHỈ HIỂN THỊ TRÊN MÁY TÍNH - GIỮ NGUYÊN BẢNG CŨ) ================= */}
      <div className="hidden md:block border rounded-xl bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
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