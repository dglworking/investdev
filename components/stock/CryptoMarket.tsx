"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCryptoMarket } from "@/features/stocks/service";
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from "recharts";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
};

interface ChartPoint {
  time: string;
  displayDate: string;
  close: number;
  volume: number;
  volumeColor: string;
}

// Component vẽ Biểu đồ Mini (Sparkline) cho Mobile
function MiniSparkline({ rawData, positive }: { rawData: ChartPoint[]; positive: boolean }) {
  if (!rawData || rawData.length < 2) return <div className="h-6 w-full" />;

  const prices = rawData.map((d) => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const width = 100;
  const height = 28;

  const points = prices
    .map((val, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  const color = positive ? "#10b981" : "#ef4444";
  const lastX = width;
  const lastY = height - ((prices[prices.length - 1] - min) / range) * (height - 6) - 3;

  return (
    <div className="w-full h-7 mt-1">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#e2e8f0" strokeDasharray="2 2" strokeWidth="1" />
        <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={points} />
        <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
      </svg>
    </div>
  );
}

const MOCK_COINS: Coin[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", current_price: 65420.5, price_change_percentage_24h: 2.35 },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", current_price: 3450.2, price_change_percentage_24h: -0.85 },
  { id: "solana", symbol: "SOL", name: "Solana", current_price: 148.75, price_change_percentage_24h: 5.12 },
  { id: "binancecoin", symbol: "BNB", name: "BNB", current_price: 580.1, price_change_percentage_24h: 1.15 },
];

export default function CryptoMarket() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoinId, setSelectedCoinId] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getCryptoMarket();
        // Nếu API trả về mảng dữ liệu hợp lệ
        if (data && Array.isArray(data) && data.length > 0) {
          setCoins(data);
          setSelectedCoinId(data[0].id);
        } else {
          // Nếu API trả về rỗng -> Dùng dữ liệu dự phòng
          setCoins(MOCK_COINS);
          setSelectedCoinId(MOCK_COINS[0].id);
        }
      } catch (error) {
        console.warn("Lỗi tải Crypto Market, sử dụng dữ liệu dự phòng:", error);
        setCoins(MOCK_COINS);
        setSelectedCoinId(MOCK_COINS[0].id);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const generateHistoricalData = (coin: Coin): ChartPoint[] => {
    if (!coin) return [];
    const points: ChartPoint[] = [];
    const basePrice = coin.current_price;
    const change24h = coin.price_change_percentage_24h;

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const wave = Math.sin(i * 0.6) * 1.5 + Math.cos(i * 0.3) * 0.8;
      const trend = (i * (change24h / 12));
      const percentOffset = trend + wave;
      
      const historicalPrice = basePrice * (1 - percentOffset / 100);
      const prevPrice = points.length > 0 ? points[points.length - 1].close : historicalPrice * 0.99;
      
      const volumeBase = coin.symbol.toLowerCase() === 'btc' ? 45000 : coin.symbol.toLowerCase() === 'eth' ? 280000 : 90000;
      const simulatedVolume = volumeBase * (0.7 + Math.random() * 0.6);

      points.push({
        time: date.toISOString(),
        displayDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        close: i === 0 ? basePrice : historicalPrice, 
        volume: simulatedVolume,
        volumeColor: (i === 0 ? change24h >= 0 : historicalPrice >= prevPrice) ? "#10b981" : "#ef4444"
      });
    }
    return points;
  };

  if (loading) {
    return <p className="text-slate-500 font-medium">Đang tải dữ liệu Crypto Market...</p>;
  }

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];
  const chartData = generateHistoricalData(selectedCoin);
  const isCoinUp = selectedCoin ? selectedCoin.price_change_percentage_24h >= 0 : true;
  const mainColor = isCoinUp ? "#10b981" : "#ef4444";

  return (
    <section className="space-y-4 md:space-y-6">

      {/* ================= 1. GIAO DIỆN MOBILE (Dàn 3 Cột) ================= */}
      <div className="block md:hidden space-y-2">
        

        {/* 3 Cột: Lấy 3 Coin đầu tiên trong danh sách (VD: BTC, ETH, SOL) */}
        <div className="grid grid-cols-3 gap-1.5">
          {coins.slice(0, 3).map((coin) => {
            const isSelected = selectedCoinId === coin.id;
            const isPositive = coin.price_change_percentage_24h >= 0;
            const coinData = generateHistoricalData(coin);

            return (
              <div
                key={coin.id}
                onClick={() => setSelectedCoinId(coin.id)}
                className={`bg-white rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected ? "border-blue-500 ring-1 ring-blue-500 shadow-xs" : "border-slate-200"
                }`}
              >
                {/* Header: Icon đồng hồ + Symbol */}
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                  <svg className="w-2.5 h-2.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                    <path strokeLinecap="round" strokeWidth="2" d="M12 7v5l3 2" />
                  </svg>
                  <span className="truncate">{coin.symbol}</span>
                </div>

                {/* Giá hiện tại & % Tăng giảm */}
                <div className="text-center my-0.5">
                  <div className="text-xs font-extrabold text-slate-900 leading-tight truncate">
                    ${coin.current_price < 10 ? coin.current_price.toFixed(2) : coin.current_price.toLocaleString()}
                  </div>
                  <div className={`text-[9px] font-semibold leading-none mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isPositive ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>

                {/* Biểu đồ Mini */}
                <MiniSparkline rawData={coinData} positive={isPositive} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 2. GIAO DIỆN DESKTOP (Chỉ hiện trên PC) ================= */}
      <div className="hidden md:grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {coins.slice(0, 4).map((coin) => {
          const isSelected = selectedCoinId === coin.id;
          const isPositive = coin.price_change_percentage_24h >= 0;

          return (
            <div
              key={coin.id}
              onClick={() => setSelectedCoinId(coin.id)}
              className={`cursor-pointer transition-all duration-200 rounded-2xl border bg-white p-5 shadow-sm ${
                isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold uppercase text-slate-700">
                  {coin.symbol}
                </h2>
                <span className="text-xs text-slate-400 font-medium">{coin.name}</span>
              </div>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>

              <p
                className={`mt-2 text-sm font-semibold ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>

      {/* ================= 3. BIỂU ĐỒ CHI TIẾT DÙNG CHUNG ================= */}
      {selectedCoin && chartData.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-baseline">
            <div className="flex items-baseline space-x-2 md:space-x-3">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 uppercase">{selectedCoin.symbol} / USD</h3>
              <span className="text-xl md:text-2xl font-mono font-bold">
                ${selectedCoin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs md:text-sm font-semibold ${isCoinUp ? 'text-green-500' : 'text-red-500'}`}>
                {isCoinUp ? "+" : ""}{selectedCoin.price_change_percentage_24h.toFixed(2)}% (24h)
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">30 phiên gần nhất</span>
          </div>

          <div className="w-full h-64 md:h-80 bg-white pt-2 md:pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: -10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cryptoGradient" x1="0" y1="0" x2="0" y2="1">
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
                  domain={['dataMin * 0.98', 'dataMax * 1.02']} 
                  tickLine={false}
                  stroke="#94a3b8"
                  fontSize={11}
                  dx={5}
                  tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />

                <YAxis 
                  yAxisId="volume"
                  orientation="left"
                  hide={true}
                  domain={[0, (dataMax: number) => dataMax * 5]}
                />

                <Tooltip 
                  formatter={(value: any, name: any): any => {
                    if (name === "close") {
                      return [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Giá"];
                    }
                    if (name === "volume") {
                      return [Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 }), "Khối lượng"];
                    }
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />

                <ReferenceLine yAxisId="price" y={selectedCoin.current_price} stroke="#64748b" strokeDasharray="3 3" />

                <Area 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="close" 
                  stroke={mainColor} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#cryptoGradient)" 
                />

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

          {/* ================= NÚT XEM TẤT CẢ MÃ CRYPTO ================= */}
          <div className="pt-2 border-t border-slate-100 flex justify-center">
            <Link
              href="/crypto" // Bạn có thể thay đổi đường dẫn trang Crypto tại đây
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 transition-colors shadow-2xs"
            >
              <span>Xem tất cả mã Crypto</span>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}