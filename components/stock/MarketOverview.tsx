'use client';

import { useEffect, useState } from "react";
import MarketCard from "@/components/common/MarketCard";

interface IndexSession {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CardState {
  value: string;
  change: string;
  rawData: IndexSession[]; 
}

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<{ [key: string]: CardState }>({
    VNINDEX: { value: "...", change: "Đang tải...", rawData: [] },
    VN30: { value: "...", change: "Đang tải...", rawData: [] },
    HNX: { value: "...", change: "Đang tải...", rawData: [] },
    UPCOM: { value: "...", change: "Đang tải...", rawData: [] },
  });

  // State theo dõi chỉ số nào đang được người dùng bấm chọn
  const [selectedIndex, setSelectedIndex] = useState<string>("VNINDEX");

  const processIndexData = (sessions: IndexSession[]): CardState => {
    if (!sessions || sessions.length < 2) {
      return { value: "Không rõ", change: "Thiếu dữ liệu", rawData: [] };
    }
    const latest = sessions[sessions.length - 1];
    const prev = sessions[sessions.length - 2];
    const diff = latest.close - prev.close;
    const percent = (diff / prev.close) * 100;
    const sign = diff >= 0 ? "+" : "";

    return {
      value: latest.close.toFixed(2),
      change: `${sign}${diff.toFixed(2)} (${sign}${percent.toFixed(2)}%)`,
      rawData: sessions,
    };
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/vnstock/summary")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const raw = resData.data;
          setMarketData({
            VNINDEX: processIndexData(raw.VNINDEX),
            VN30: processIndexData(raw.VN30),
            HNX: processIndexData(raw.HNX),
            UPCOM: processIndexData(raw.UPCOM),
          });
        }
      })
      .catch((err) => console.error("Lỗi kết nối:", err));
  }, []);

  
  const activeData = marketData[selectedIndex]?.rawData || [];
  const prices = activeData.map((d) => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Tạo chuỗi tọa độ (X,Y) cho biểu đồ phẳng SVG (Khung 500x150)
  const svgPoints = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * 500;
      const y = 150 - ((price - minPrice) / priceRange) * 120 - 15; // padding top/bottom 15px
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = activeData.length >= 2 && activeData[activeData.length - 1].close >= activeData[activeData.length - 2].close;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">🇻🇳 Vietnam Market</h2>
        <p className="text-slate-500">Bấm vào từng chỉ số để xem biểu đồ xu hướng 30 phiên</p>
      </div>

      {}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {["VNINDEX", "VN30", "HNX", "UPCOM"].map((key) => (
          <div
            key={key}
            onClick={() => setSelectedIndex(key)}
            className={`cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${
              selectedIndex === key ? "ring-2 ring-blue-500 rounded-xl shadow-md" : ""
            }`}
          >
            <MarketCard
              title={key}
              value={marketData[key].value}
              change={marketData[key].change}
            />
          </div>
        ))}
      </div>

      {}
      {activeData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">
              Xu hướng đồ thị: <span className="text-blue-600">{selectedIndex}</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">30 phiên gần nhất</span>
          </div>

          <div className="w-full bg-slate-50 p-2 rounded-lg border border-slate-100">
            {}
            <svg viewBox="0 0 500 150" className="w-full h-48 overflow-visible">
              <polyline
                fill="none"
                stroke={isUp ? "#10B981" : "#EF4444"} 
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={svgPoints}
              />
            </svg>
          </div>
        </div>
      )}
    </section>
  );
}