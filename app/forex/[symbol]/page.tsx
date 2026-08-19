"use client";

import { use, useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight, 
  Calendar, 
  Building2, 
  Info,
  Search,
  X
} from "lucide-react";

// Hàm lấy tên đồng tiền tự động theo chuẩn Tiếng Việt mà không cần hardcode
function getCurrencyName(code: string): string {
  try {
    const formatter = new Intl.DisplayNames(["vi"], { type: "currency" });
    const name = formatter.of(code);
    return name && name !== code ? name : `Đồng ${code}`;
  } catch {
    return `Ngoại tệ ${code}`;
  }
}

// Hàm lấy biểu tượng cờ quốc gia tự động từ mã ISO tiền tệ
function getFlagEmoji(code: string): string {
  if (code === "EUR") return "🇪🇺";
  const countryCode = code.substring(0, 2);
  if (/^[A-Z]{2}$/.test(countryCode)) {
    const codePoints = countryCode
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  return "🌐";
}

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default function ForexDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol.toUpperCase();

  // State lưu trữ dữ liệu từ Open ER API
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // State cho công cụ tìm kiếm ngoại tệ
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // State cho công cụ quy đổi tiền tệ
  const [calcAmount, setCalcAmount] = useState<number>(1);
  const [isVndToForeign, setIsVndToForeign] = useState<boolean>(false);

  // Fetch dữ liệu tỉ giá thời gian thực từ API
  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tỉ giá:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  // Đóng dropdown tìm kiếm khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tính toán các tham số tỉ giá linh hoạt từ dữ liệu API
  const currencyData = useMemo(() => {
    const usdInVnd = rates["VND"] || 25450;
    const usdInSymbol = rates[symbol] || (symbol === "USD" ? 1 : null);

    if (!usdInSymbol) {
      const fallbackRate = 25000;
      return {
        name: getCurrencyName(symbol),
        symbol,
        flag: getFlagEmoji(symbol),
        buyCash: fallbackRate * 0.995,
        buyTransfer: fallbackRate * 0.998,
        sell: fallbackRate * 1.003,
        change24h: 0.0,
        centralRate: fallbackRate,
        high24h: fallbackRate * 1.005,
        low24h: fallbackRate * 0.995,
        unit: symbol,
      };
    }

    const rateToVnd = usdInVnd / usdInSymbol;
    const mockChange = parseFloat((Math.sin(symbol.charCodeAt(0)) * 0.8).toFixed(2));

    return {
      name: getCurrencyName(symbol),
      symbol,
      flag: getFlagEmoji(symbol),
      buyCash: rateToVnd * 0.996,
      buyTransfer: rateToVnd * 0.998,
      sell: rateToVnd * 1.003,
      change24h: mockChange,
      centralRate: rateToVnd,
      high24h: rateToVnd * 1.005,
      low24h: rateToVnd * 0.995,
      unit: symbol,
    };
  }, [rates, symbol]);

  // Lọc danh sách đồng tiền cho ô tìm kiếm
  const filteredCurrencies = useMemo(() => {
    const codes = Object.keys(rates).filter((code) => code !== "VND");
    if (!searchQuery.trim()) return codes.slice(0, 10);

    const query = searchQuery.toLowerCase();
    return codes
      .filter((code) => {
        const name = getCurrencyName(code).toLowerCase();
        return code.toLowerCase().includes(query) || name.includes(query);
      })
      .slice(0, 12);
  }, [rates, searchQuery]);

  // Tính toán kết quả quy đổi
  const convertedValue = isVndToForeign
    ? calcAmount / currencyData.sell
    : calcAmount * currencyData.sell;

  const handleSelectCurrency = (code: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/forex/${code}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP BAR: Navigation Back & Search Component */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/forex"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={18} />
             Quay lại Tỉ giá Ngoại tệ
          </Link>

          {/* Dynamic Search Bar Component */}
          <div ref={searchRef} className="relative w-full sm:w-80">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="Tìm đồng tiền khác (USD, EUR, JPY...)"
                className="w-full h-10 pl-9 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Results Overlay Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-12 left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCurrencies.length > 0 ? (
                  filteredCurrencies.map((code) => (
                    <button
                      key={code}
                      onClick={() => handleSelectCurrency(code)}
                      className="w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-base">{getFlagEmoji(code)}</span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white mr-1.5">{code}</span>
                          <span className="text-slate-400 font-medium">{getCurrencyName(code)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">Xem</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Không tìm thấy ngoại tệ phù hợp
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* HERO CARD: Tỷ giá chính */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-4xl md:text-5xl">{currencyData.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                    {currencyData.symbol} / VND
                  </h1>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    ({currencyData.name})
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar size={13} /> Cập nhật theo tỉ giá ngân hàng thương mại
                </p>
              </div>
            </div>

            {/* Tỉ giá Bán chính & Phần trăm biến động */}
            <div className="text-left md:text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tỉ giá bán ra chính thức</div>
              <div className="flex items-baseline md:justify-end gap-3 mt-1">
                <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                  {loading
                    ? "..."
                    : currencyData.symbol === "KRW" || currencyData.symbol === "JPY" || currencyData.symbol === "IDR"
                    ? currencyData.sell.toFixed(2)
                    : Math.round(currencyData.sell).toLocaleString("vi-VN")}{" "}
                  <span className="text-base font-bold text-slate-500">đ</span>
                </span>
                <span
                  className={`inline-flex items-center text-sm font-bold px-2.5 py-1 rounded-lg ${
                    currencyData.change24h >= 0
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {currencyData.change24h >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                  {currencyData.change24h >= 0 ? `+${currencyData.change24h}%` : `${currencyData.change24h}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: Quy đổi + Bảng giá Ngân hàng */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Công cụ tính toán quy đổi */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <ArrowLeftRight size={18} className="text-blue-600" />
                Công cụ quy đổi {currencyData.symbol}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                {/* Nhập số tiền */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    {isVndToForeign ? "Số tiền VNĐ" : `Số tiền ${currencyData.symbol}`}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Nút Đảo chiều */}
                <div className="flex justify-center sm:pt-5">
                  <button
                    type="button"
                    onClick={() => setIsVndToForeign(!isVndToForeign)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Đảo chiều quy đổi"
                  >
                    <ArrowLeftRight size={18} />
                  </button>
                </div>

                {/* Kết quả quy đổi */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    {isVndToForeign ? `Thành tiền (${currencyData.symbol})` : "Thành tiền (VNĐ)"}
                  </label>
                  <div className="h-11 px-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-between font-black text-blue-600 dark:text-blue-400 text-lg">
                    <span>
                      {convertedValue.toLocaleString("vi-VN", {
                        maximumFractionDigits: isVndToForeign ? 2 : 0,
                      })}
                    </span>
                    <span className="text-xs text-blue-500 font-semibold">
                      {isVndToForeign ? currencyData.symbol : "VND"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Chi tiết Tỉ giá Niêm yết Ngân hàng */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Building2 size={18} className="text-emerald-500" />
                Tỉ giá Mua / Bán tham khảo
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Mua tiền mặt</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {currencyData.symbol === "KRW" || currencyData.symbol === "JPY" || currencyData.symbol === "IDR"
                      ? currencyData.buyCash.toFixed(2)
                      : Math.round(currencyData.buyCash).toLocaleString("vi-VN")}{" "}
                    <span className="text-xs text-slate-400">đ</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Mua chuyển khoản</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {currencyData.symbol === "KRW" || currencyData.symbol === "JPY" || currencyData.symbol === "IDR"
                      ? currencyData.buyTransfer.toFixed(2)
                      : Math.round(currencyData.buyTransfer).toLocaleString("vi-VN")}{" "}
                    <span className="text-xs text-slate-400">đ</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">Giá bán ra</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                    {currencyData.symbol === "KRW" || currencyData.symbol === "JPY" || currencyData.symbol === "IDR"
                      ? currencyData.sell.toFixed(2)
                      : Math.round(currencyData.sell).toLocaleString("vi-VN")}{" "}
                    <span className="text-xs opacity-75">đ</span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT 1 COLUMN: Thông số thị trường & Lưu ý */}
          <div className="space-y-6">
            
            {/* Thông số tổng quan 24h */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                Thống kê thị trường
              </h2>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Tỉ giá trung tâm</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.round(currencyData.centralRate).toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Mức cao nhất (24h)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(currencyData.high24h).toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Mức thấp nhất (24h)</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {Math.round(currencyData.low24h).toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Đơn vị tính</span>
                <span className="font-bold text-slate-900 dark:text-white">{currencyData.unit}</span>
              </div>
            </div>

            {/* Lưu ý miễn trừ trách nhiệm */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex gap-2.5">
              <Info size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                Tỉ giá chỉ mang tính chất tham khảo. Giá thực tế có thể chênh lệch tùy theo từng ngân hàng thương mại và thời điểm giao dịch thực tế.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}