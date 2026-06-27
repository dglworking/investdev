'use client';

import { useEffect, useState } from "react";
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from "recharts";
import MarketCard from "@/components/common/MarketCard";
import { getMarketSummary } from "@/features/stocks/service";

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
  positive: boolean;
  rawData: any[];
}

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<{ [key: string]: CardState }>({
    VNINDEX: { value: "...", change: "Đang tải...", positive: true, rawData: [] },
    VN30: { value: "...", change: "Đang tải...", positive: true, rawData: [] },
    HNX: { value: "...", change: "Đang tải...", positive: true, rawData: [] },
    UPCOM: { value: "...", change: "Đang tải...", positive: true, rawData: [] },
  });

  const [selectedIndex, setSelectedIndex] = useState<string>("VNINDEX");

  const processIndexData = (sessions: IndexSession[]): CardState => {
    if (!sessions || sessions.length < 2) {
      return { value: "Không rõ", change: "Thiếu dữ liệu", positive: true, rawData: [] };
    }
    const latest = sessions[sessions.length - 1];
    const prev = sessions[sessions.length - 2];
    const diff = latest.close - prev.close;
    const percent = (diff / prev.close) * 100;
    const sign = diff >= 0 ? "+" : "";
    
    const isPositive = diff >= 0; 

    const formattedData = sessions.map((s, idx) => {
      const prevClose = idx > 0 ? sessions[idx - 1].close : s.open;
      return {
        ...s,
        displayDate: new Date(s.time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        
        volumeColor: s.close >= prevClose ? "#10b981" : "#ef4444"
      };
    });

    return {
      value: latest.close.toFixed(2),
      change: `${sign}${diff.toFixed(2)} (${sign}${percent.toFixed(2)}%)`,
      positive: isPositive,
      rawData: formattedData,
    };
  };

  useEffect(() => {

    async function loadSummary() {

      const raw = await getMarketSummary();

      if (!raw) return;

      setMarketData({
        VNINDEX: processIndexData(raw.VNINDEX),
        VN30: processIndexData(raw.VN30),
        HNX: processIndexData(raw.HNX),
        UPCOM: processIndexData(raw.UPCOM),
      });

    }

    loadSummary();

  }, []);

  const chartData = marketData[selectedIndex]?.rawData || [];
  const latestPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  
  const isMarketUp = chartData.length >= 2 && chartData[chartData.length - 1].close >= chartData[chartData.length - 2].close;
  const mainColor = isMarketUp ? "#10b981" : "#ef4444";

  return (
    <section className="space-y-6">

      {/* Grid danh sách các chỉ số */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {["VNINDEX", "VN30", "HNX", "UPCOM"].map((key) => (
          <div
            key={key}
            onClick={() => setSelectedIndex(key)}
            className={`cursor-pointer transition-all duration-200 ${
              selectedIndex === key ? "ring-2 ring-blue-500 rounded-xl shadow-md" : ""
            }`}
          >
            <MarketCard
              title={key}
              value={marketData[key].value}
              change={marketData[key].change}
              positive={marketData[key].positive} 
            />
          </div>
        ))}
      </div>

      {}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-baseline">
            <div className="flex items-baseline space-x-3">
              <h3 className="text-xl font-bold text-slate-800">{selectedIndex}</h3>
              <span className="text-2xl font-mono font-bold">{latestPrice.toFixed(2)}</span>
              <span className={`text-sm font-semibold ${marketData[selectedIndex].positive ? 'text-green-500' : 'text-red-500'}`}>
                {marketData[selectedIndex].change}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">Đồ thị 30 phiên</span>
          </div>

          <div className="w-full h-80 bg-white pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: -10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={mainColor} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={mainColor} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis 
                  dataKey="displayDate" 
                  tickLine={false} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  dy={10}
                />

                <YAxis 
                  yAxisId="price"
                  orientation="right" 
                  domain={['dataMin - 15', 'dataMax + 15']} 
                  tickLine={false}
                  stroke="#94a3b8"
                  fontSize={11}
                  dx={5}
                />

                <YAxis 
                  yAxisId="volume"
                  orientation="left"
                  hide={true}
                  domain={[0, (dataMax: number) => dataMax * 5]}
                />

                {/* Cấu hình Tooltip an toàn, chống lỗi TypeScript */}
                <Tooltip 
                  formatter={(value: any, name: any): any => {
                    if (name === "close") return [value.toFixed(2), "Giá"];
                    if (name === "volume") return [value.toLocaleString(), "Khối lượng"];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />

                <ReferenceLine yAxisId="price" y={latestPrice} stroke="#64748b" strokeDasharray="3 3" />

                <Area 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="close" 
                  stroke={mainColor} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                />

                {}
                <Bar 
                  yAxisId="volume"
                  dataKey="volume" 
                  radius={[2, 2, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.volumeColor} opacity={0.4} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}