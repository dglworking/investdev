"use client";

import { useEffect, useState, useRef, use, memo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, BarChart2 } from "lucide-react";
import {
  getCryptoOrderBook,
  type OrderBookData,
} from "@/features/stocks/service";

// Tích hợp TradingView Widget 
const TradingViewWidget = memo(({ symbol }: { symbol: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "500",
      symbol: `BINANCE:${symbol}USDT`,
      interval: "D",
      timezone: "Asia/Ho_Chi_Minh",
      theme: "light",
      style: "1",
      locale: "vi_VN",
      enable_publishing: false,
      allow_symbol_change: false,
      calendar: false,
      hide_side_toolbar: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container w-full h-[650px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800" ref={containerRef}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
});

TradingViewWidget.displayName = "TradingViewWidget";

export default function CryptoDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const resolvedParams = use(params);
  const rawSymbol = resolvedParams.symbol.toUpperCase();
  const router = useRouter();

  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);

  useEffect(() => {
    async function loadBook() {
      try {
        
        const res = await fetch(`/api/crypto?symbol=${rawSymbol}`);
        if (res.ok) {
          const data = await res.json();
          setOrderBook(data);
        }
      } catch (err) {
        console.error("Lỗi tải sổ lệnh:", err);
      }
    }

    loadBook();
    const timer = setInterval(loadBook, 3000);
    return () => clearInterval(timer);
  }, [rawSymbol]);

  const currentPrice = orderBook?.asks[0]?.price || orderBook?.bids[0]?.price || 0;

  return (
    <div className="p-6 max-w-[1650px] mx-auto space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Nút Quay lại */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Quay lại bảng giá</span>
      </button>

      {/* Grid 2 Cột */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* CỘT TRÁI: BIỂU ĐỒ TRADINGVIEW (3 COLUMNS) */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <BarChart2 className="text-blue-600" size={20} />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase">
                  Biểu đồ kỹ thuật {rawSymbol} / USDT
                </h1>
              </div>
              <span className="text-xs font-semibold text-slate-400">TradingView Candlestick</span>
            </div>

            {/* TradingView Widget */}
            <TradingViewWidget symbol={rawSymbol} />
          </div>
        </div>

        {/* CỘT PHẢI: SỔ LỆNH (1 COLUMN) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Sổ lệnh</h2>
              <RefreshCw size={14} className="text-slate-400 animate-spin" />
            </div>

            {/* Tiêu đề Bảng */}
            <div className="grid grid-cols-3 text-[11px] font-bold text-slate-400 uppercase pb-1">
              <span>Giá (USD)</span>
              <span className="text-right">Số lượng</span>
              <span className="text-right">Tích lũy</span>
            </div>

            {/* 10 Lệnh Bán (Asks - Đỏ) */}
            <div className="space-y-1">
              {orderBook?.asks.slice(0, 10).reverse().map((ask, idx) => {
                const depthWidth = `${Math.min(100, (ask.total / (orderBook.maxTotal || 1)) * 100)}%`;
                return (
                  <div key={idx} className="relative grid grid-cols-3 text-xs font-mono py-1 px-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-red-500/10 rounded-sm"
                      style={{ width: depthWidth }}
                    />
                    <span className="text-red-500 font-semibold z-10">
                      {ask.price < 1 ? ask.price.toFixed(4) : ask.price.toFixed(2)}
                    </span>
                    <span className="text-right text-slate-600 dark:text-slate-300 z-10">
                      {ask.amount.toFixed(3)}
                    </span>
                    <span className="text-right text-slate-400 z-10">{ask.total.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Giá hiện tại */}
            <div className="py-2 my-1 border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center font-mono font-bold text-sm">
              <span className="text-slate-900 dark:text-white">
                ${currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* 10 Lệnh Mua (Bids - Xanh) */}
            <div className="space-y-1">
              {orderBook?.bids.slice(0, 10).map((bid, idx) => {
                const depthWidth = `${Math.min(100, (bid.total / (orderBook.maxTotal || 1)) * 100)}%`;
                return (
                  <div key={idx} className="relative grid grid-cols-3 text-xs font-mono py-1 px-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-green-500/10 rounded-sm"
                      style={{ width: depthWidth }}
                    />
                    <span className="text-green-600 font-semibold z-10">
                      {bid.price < 1 ? bid.price.toFixed(4) : bid.price.toFixed(2)}
                    </span>
                    <span className="text-right text-slate-600 dark:text-slate-300 z-10">
                      {bid.amount.toFixed(3)}
                    </span>
                    <span className="text-right text-slate-400 z-10">{bid.total.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}