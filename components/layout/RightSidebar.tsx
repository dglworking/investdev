"use client";

import { useEffect, useState } from "react";
import { Newspaper, RefreshCw, ExternalLink, Globe, DollarSign } from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

interface ForexItem {
  pair: string;
  rate: number;
  change: string;
  isPositive: boolean;
}

export default function RightSidebar() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // State lưu tỉ giá ngoại tệ thời gian thực
  const [forex, setForex] = useState<ForexItem[]>([]);
  const [forexLoading, setForexLoading] = useState(true);

  // LẤY TỈ GIÁ NGOẠI TỆ TỜI GIAN THỰC
  const fetchForex = async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();

      if (data && data.rates) {
        const usdToVnd = data.rates.VND || 25450;
        const eurToVnd = data.rates.EUR ? usdToVnd / data.rates.EUR : 27200;
        const jpyToVnd = data.rates.JPY ? usdToVnd / data.rates.JPY : 165;
        const gbpToVnd = data.rates.GBP ? usdToVnd / data.rates.GBP : 32100;
        const audToVnd = data.rates.AUD ? usdToVnd / data.rates.AUD : 16800;

        setForex([
          { pair: "USD / VND", rate: usdToVnd, change: "+0.12%", isPositive: true },
          { pair: "EUR / VND", rate: eurToVnd, change: "-0.25%", isPositive: false },
          { pair: "JPY / VND", rate: jpyToVnd, change: "+0.05%", isPositive: true },
          { pair: "GBP / VND", rate: gbpToVnd, change: "+0.34%", isPositive: true },
          { pair: "AUD / VND", rate: audToVnd, change: "-0.18%", isPositive: false },
        ]);
      }
    } catch (err) {
      console.error("Lỗi tải tỉ giá:", err);
      // Dữ liệu dự phòng nếu mất kết nối
      setForex([
        { pair: "USD / VND", rate: 25450, change: "+0.12%", isPositive: true },
        { pair: "EUR / VND", rate: 27200, change: "-0.25%", isPositive: false },
        { pair: "JPY / VND", rate: 165.5, change: "+0.05%", isPositive: true },
        { pair: "GBP / VND", rate: 32100, change: "+0.34%", isPositive: true },
        { pair: "AUD / VND", rate: 16800, change: "-0.18%", isPositive: false },
      ]);
    } finally {
      setForexLoading(false);
    }
  };

  // LẤY TIN TỨC THỊ TRƯỜNG
  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (Array.isArray(data)) setNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchForex();

    // Tự động làm mới tỉ giá mỗi 60 giây
    const interval = setInterval(fetchForex, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-full xl:w-80 border-0 xl:border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl xl:rounded-none xl:min-h-screen">
      <div className="space-y-6 sticky top-20">

        {/* PHẦN TỈ GIÁ NGOẠI TỆ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <DollarSign size={18} className="text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tỉ giá
              </h2>
            </div>
            <button
              onClick={fetchForex}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
              title="Cập nhật tỉ giá"
            >
              <RefreshCw size={13} className={forexLoading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm space-y-2">
            {forexLoading ? (
              <div className="space-y-2 py-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="animate-pulse h-6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                ))}
              </div>
            ) : (
              forex.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.pair}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {item.pair.includes("JPY")
                        ? item.rate.toFixed(2)
                        : Math.round(item.rate).toLocaleString("vi-VN")}
                      ₫
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono ${
                      item.isPositive
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60"
                        : "text-rose-600 bg-rose-50 dark:bg-rose-950/60"
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TIN TỨC THỊ TRƯỜNG TỰ ĐỘNG */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Newspaper size={18} className="text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tin tức thị trường
              </h2>
            </div>
            <button
              onClick={fetchNews}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
              title="Cập nhật tin mới"
            >
              <RefreshCw size={14} className={newsLoading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm space-y-3">
            {newsLoading ? (
              /* Skeleton Loading State */
              <div className="space-y-3 py-1">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse space-y-1.5">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : news.length > 0 ? (
              news.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group py-1.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {item.source}
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>
                        {new Date(item.pubDate).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <ExternalLink size={10} />
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
                    {item.title}
                  </p>
                </a>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">
                Không có tin tức mới
              </p>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}