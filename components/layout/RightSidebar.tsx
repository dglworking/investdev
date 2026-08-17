"use client";

import { useEffect, useState } from "react";
import { Newspaper, TrendingUp, RefreshCw, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export default function RightSidebar() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (Array.isArray(data)) setNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-5 hidden xl:block min-h-screen">
      <div className="space-y-6 sticky top-20">

        {/* XU HƯỚNG TÌM KIẾM */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Trending
            </h2>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm space-y-2">
            {[
              { symbol: "BTC / USDT", change: "+3.2%" },
              { symbol: "ETH / USDT", change: "+1.8%" },
              { symbol: "ACE / USDT", change: "+15.4%" },
              { symbol: "VNINDEX", change: "-0.5%" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {item.symbol}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    item.change.startsWith("+")
                      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                      : "text-rose-600 bg-rose-50 dark:bg-rose-950"
                  }`}
                >
                  {item.change}
                </span>
              </div>
            ))}
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
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm space-y-3">
            {loading ? (
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