"use client";

import { use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  BarChart3, 
  ShieldAlert,
  Info
} from "lucide-react";
import { VN_STOCKS_DATA } from "../page";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default function VNStockDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol.toUpperCase();

  // Tìm mã cổ phiếu trong bộ dữ liệu
  const stock = VN_STOCKS_DATA.find((s) => s.symbol === symbol) || {
    symbol: symbol,
    name: `Cổ phiếu ${symbol}`,
    price: 25.00,
    change: 0.00,
    percent: 0.00,
    volume: "5.0M",
    industry: "Thị trường Chứng khoán",
    high: 25.50,
    low: 24.80,
    marketCap: "50.0T",
    pe: 12.0,
    eps: "2,500"
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* BACK BUTTON */}
        <div className="flex items-center justify-between">
          <Link
            href="/vnstock"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={18} />
             Quay lại Danh sách Chứng khoán
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Sàn HOSE / HNX
          </span>
        </div>

        {/* HERO CARD: Tên & Giá cổ phiếu */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <span className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-xl">
                  {stock.symbol}
                </span>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    {stock.name}
                  </h1>
                  <span className="text-xs font-semibold text-slate-400">
                    Ngành: {stock.industry}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Giá khớp lệnh hiện tại</div>
              <div className="flex items-baseline md:justify-end gap-3 mt-1">
                <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                  {stock.price.toFixed(2)} <span className="text-base font-bold text-slate-500">x1,000đ</span>
                </span>
                <span
                  className={`inline-flex items-center text-sm font-bold px-2.5 py-1 rounded-lg ${
                    stock.change >= 0
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {stock.change >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                  {stock.change >= 0 ? `+${stock.change.toFixed(2)}` : stock.change.toFixed(2)} ({stock.percent >= 0 ? `+${stock.percent}%` : `${stock.percent}%`})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MOCK CHART & OVERVIEW */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-blue-600" />
                Đồ thị diễn biến giá (30 phiên gần nhất)
              </h2>

              {/* MOCK SVG CHART */}
              <div className="h-64 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 flex flex-col justify-between border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Cao nhất: {stock.high.toFixed(2)}</span>
                  <span>Thấp nhất: {stock.low.toFixed(2)}</span>
                </div>
                
                <div className="w-full h-36 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <path
                      d="M 0 60 Q 50 20, 100 50 T 200 30 T 300 70 T 400 40 T 500 20"
                      fill="none"
                      stroke={stock.change >= 0 ? "#10b981" : "#f43f5e"}
                      strokeWidth="3"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span>30 phiên trước</span>
                  <span>15 phiên trước</span>
                  <span>Phiên hôm nay</span>
                </div>
              </div>
            </div>

            {/* FINANCIAL INDICATORS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Building2 size={18} className="text-emerald-500" />
                Chỉ số tài chính cơ bản
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block font-semibold">P/E</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{stock.pe}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block font-semibold">EPS (VNĐ)</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{stock.eps}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block font-semibold">Vốn hóa</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{stock.marketCap}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block font-semibold">Khối lượng GD</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{stock.volume}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR STATISTICS */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                Thống kê biên độ giá 24h
              </h2>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Giá cao nhất phiên</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stock.high.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Giá thấp nhất phiên</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{stock.low.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Khối lượng trung bình</span>
                <span className="font-bold text-slate-900 dark:text-white">{stock.volume}</span>
              </div>

              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Trạng thái sàn</span>
                <span className="font-bold text-emerald-500">Đang giao dịch</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 text-xs leading-relaxed flex gap-2.5">
              <Info size={18} className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <span>
                Đây chỉ là web thử nghiệm nên chỉ số chứng khoán chỉ là giả lập.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}