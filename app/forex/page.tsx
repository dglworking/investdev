"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Globe, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown 
} from "lucide-react";

interface CurrencyItem {
  code: string;
  flag: string;
  rateToVnd: number;
  buyRate: number;
  sellRate: number;
  change24h: number;
}

// Hàm tự động tạo Cờ Quốc Gia từ mã ISO tiền tệ (Không cần hardcode)
function getFlagEmoji(currencyCode: string): string {
  if (currencyCode === "EUR") return "🇪🇺";
  if (currencyCode === "BTC") return "₿";
  if (currencyCode === "XAU") return "🥇";
  if (currencyCode === "XAG") return "🥈";
  
  const countryCode = currencyCode.substring(0, 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) return "🌐";

  return countryCode
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export default function ForexPage() {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"code" | "rateDesc" | "rateAsc">("code");

  // Fetch toàn bộ mã tiền tệ từ Open ER API
  const fetchForexData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();

      if (data && data.rates) {
        const usdRateInVnd = data.rates.VND || 25450;
        
        // Chuyển đổi toàn bộ mã tiền tệ thành danh sách
        const parsedList: CurrencyItem[] = Object.keys(data.rates)
          .filter((code) => code !== "VND")
          .map((code) => {
            const usdToCurrent = data.rates[code];
            const rateToVnd = usdToCurrent > 0 ? usdRateInVnd / usdToCurrent : 0;

            const spread = rateToVnd * 0.003;
            const buyRate = rateToVnd - spread;
            const sellRate = rateToVnd + spread;
            const mockChange = parseFloat((Math.sin(code.charCodeAt(0) + (code.charCodeAt(1) || 0)) * 0.8).toFixed(2));

            return {
              code,
              flag: getFlagEmoji(code),
              rateToVnd,
              buyRate,
              sellRate,
              change24h: mockChange,
            };
          });

        setCurrencies(parsedList);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tỉ giá:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForexData();
  }, []);

  // Lọc và sắp xếp dữ liệu
  const filteredCurrencies = useMemo(() => {
    return currencies
      .filter((item) => item.code.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortOrder === "rateDesc") return b.rateToVnd - a.rateToVnd;
        if (sortOrder === "rateAsc") return a.rateToVnd - b.rateToVnd;
        return a.code.localeCompare(b.code);
      });
  }, [currencies, search, sortOrder]);

  return (
    <div className="max-w-[1650px] mx-auto px-3 sm:px-6 py-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Globe size={16} />
            <span>Dữ liệu ngoại tệ real-time</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Tỉ Giá Ngoại Tệ Toàn Cầu
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nhấp vào để xem chi tiết quy đổi VND
          </p>
        </div>

        <button
          onClick={fetchForexData}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* CONTROLS: SEARCH & SORT */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nhập mã tiền tệ (USD, EUR, JPY...)"
            className="w-full pl-9 pr-4 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full sm:w-48 h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="code">Sắp xếp: Mã (A-Z)</option>
            <option value="rateDesc">Tỉ giá: Cao - Thấp</option>
            <option value="rateAsc">Tỉ giá: Thấp - Cao</option>
          </select>
        </div>
      </div>

      {/* CURRENCY GRID: 3 CỘT TRÊN MOBILE - 6 CỘT TRÊN DESKTOP */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {loading ? (
          Array.from({ length: 24 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800/60 animate-pulse p-3"
            />
          ))
        ) : filteredCurrencies.length > 0 ? (
          filteredCurrencies.map((item) => (
            <Link
              key={item.code}
              href={`/forex/${item.code}`}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 p-2.5 sm:p-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Header Card: Flag & Code */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="text-lg sm:text-2xl leading-none shrink-0">{item.flag}</span>
                  <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.code}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                  VND
                </span>
              </div>

              {/* Price Display */}
              <div className="my-2">
                <div className="text-[10px] text-slate-400 font-medium hidden sm:block">Tỉ giá bán</div>
                <div className="text-xs sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {item.rateToVnd >= 1000
                    ? Math.round(item.rateToVnd).toLocaleString("vi-VN")
                    : item.rateToVnd.toFixed(2)}
                  <span className="text-[10px] font-bold text-slate-400 ml-0.5">đ</span>
                </div>
              </div>

              {/* 24h Change Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span
                  className={`inline-flex items-center text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                    item.change24h >= 0
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
                      : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60"
                  }`}
                >
                  {item.change24h >= 0 ? (
                    <TrendingUp size={10} className="mr-0.5 shrink-0" />
                  ) : (
                    <TrendingDown size={10} className="mr-0.5 shrink-0" />
                  )}
                  {item.change24h >= 0 ? `+${item.change24h}%` : `${item.change24h}%`}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Không tìm thấy đồng tiền nào khớp với từ khóa &quot;{search}&quot;.
          </div>
        )}
      </div>

    </div>
  );
}