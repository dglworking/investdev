"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import {
  getStockMarket,
  getCryptoMarket,
  type Coin,
} from "@/features/stocks/service";

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent: number;
}

export default function Sidebar() {
  const [stocks, setStocks] = useState<TickerItem[]>([]);
  const [cryptos, setCryptos] = useState<Coin[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingCryptos, setLoadingCryptos] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const [stocksData, cryptoData] = await Promise.all([
        getStockMarket(),
        getCryptoMarket(),
      ]);

      if (!mounted) return;

      setStocks(stocksData);
      setCryptos(cryptoData);

      setLoadingStocks(false);
      setLoadingCryptos(false);
    }

    loadData();

    const timer = setInterval(loadData, 15000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <aside className="w-72 border-r bg-slate-50 p-4 space-y-6 hidden xl:block min-h-[calc(100vh-64px)] overflow-y-auto">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Các mã hot nhất
        </p>
      </div>

      {/* KHỐI CỔ PHIẾU */}
      <div className="bg-[#1e222d] text-slate-100 p-4 rounded-2xl shadow-lg border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-bold tracking-wide">Cổ phiếu</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
            TOP VOLUME
          </span>
        </div>

        <div className="space-y-3">
          {loadingStocks ? (
            <p className="text-xs text-slate-500 animate-pulse py-2">Đang quét sàn...</p>
          ) : stocks.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Chưa có dữ liệu</p>
          ) : (
            stocks.map((stock) => {
              const isPositive = stock.change >= 0;
              return (
                <Link 
                  key={stock.symbol} 
                  href={`/markets?ticker=${stock.symbol}`}
                  className="flex justify-between items-center group cursor-pointer hover:bg-slate-800/60 p-1.5 rounded-lg transition-all duration-150 block"
                >
                  <div className="space-y-0.5 max-w-[55%]">
                    <h4 className="font-bold text-sm tracking-wide text-white group-hover:text-blue-400 transition-colors uppercase">
                      {stock.symbol}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate font-medium">
                      {stock.name}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-slate-100">
                      {stock.price.toFixed(2)}
                    </span>
                    <div className={`text-[11px] font-semibold flex items-center justify-end space-x-1 ${
                      isPositive ? "text-green-400" : "text-red-400"
                    }`}>
                      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>
                        {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.percent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* KHỐI CRYPTO - GIỮ NGUYÊN BẢN 100% THEO FILE ĐÃ UP */}
      <div className="bg-[#1e222d] text-slate-100 p-4 rounded-2xl shadow-lg border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm font-bold tracking-wide">Tiền số</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
            TOP VOLUME
          </span>
        </div>

        <div className="space-y-3">
          {loadingCryptos ? (
            <p className="text-xs text-slate-500 animate-pulse py-2">Đang kết nối luồng Binance...</p>
          ) : (
            cryptos.map((crypto) => {
              const isPositive =
                crypto.price_change_percentage_24h >= 0;
              return (
                <Link 
                  key={crypto.symbol} 
                  href={`/markets?ticker=${crypto.symbol}`}
                  className="flex justify-between items-center group cursor-pointer hover:bg-slate-800/60 p-1.5 rounded-lg transition-all duration-150 block"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm tracking-wide text-white group-hover:text-yellow-400 transition-colors">
                      ${crypto.symbol}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {crypto.name}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-slate-100">
                      ${crypto.current_price.toLocaleString(undefined, {
                        minimumFractionDigits:
                          crypto.current_price < 1 ? 4 : 2,
                        maximumFractionDigits:
                          crypto.current_price < 1 ? 4 : 2,
                      })}
                    </span>
                    <div className={`text-[11px] font-semibold flex items-center justify-end space-x-1 ${
                      isPositive ? "text-green-400" : "text-red-400"
                    }`}>
                      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>
                        {crypto.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}