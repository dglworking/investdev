"use client";

import { useEffect, useState } from "react";
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

export default function CryptoMarket() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoinId, setSelectedCoinId] = useState<string>("");

  useEffect(() => {
    async function load() {
      const data = await getCryptoMarket();
      setCoins(data);
      if (data && data.length > 0) {
        setSelectedCoinId(data[0].id);
      }
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p className="text-slate-500 font-medium">Đang tải dữ liệu Crypto Market...</p>;
  }

 
  const selectedCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];

 
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

  const chartData = generateHistoricalData(selectedCoin);
  const isCoinUp = selectedCoin ? selectedCoin.price_change_percentage_24h >= 0 : true;
  const mainColor = isCoinUp ? "#10b981" : "#ef4444";

  return (
    <section className="space-y-6">
      {/* Grid danh sách Crypto Card */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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

      {}
      {selectedCoin && chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-baseline">
            <div className="flex items-baseline space-x-3">
              <h3 className="text-xl font-bold text-slate-800 uppercase">{selectedCoin.symbol} / USD</h3>
              <span className="text-2xl font-mono font-bold">
                ${selectedCoin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-semibold ${isCoinUp ? 'text-green-500' : 'text-red-500'}`}>
                {isCoinUp ? "+" : ""}{selectedCoin.price_change_percentage_24h.toFixed(2)}% (24h)
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">Xu hướng 30 phiên gần nhất</span>
          </div>

          <div className="w-full h-80 bg-white pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: -10, left: 0, bottom: 0 }}>
                {}
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

                {/* Trục giá đặt bên phải */}
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

                {/* Trục ẩn neo Volume nằm dưới đáy */}
                <YAxis 
                  yAxisId="volume"
                  orientation="left"
                  hide={true}
                  domain={[0, (dataMax: number) => dataMax * 5]}
                />

                {}
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

                {/* Đường nét đứt ngang mức giá hiện tại */}
                <ReferenceLine yAxisId="price" y={selectedCoin.current_price} stroke="#64748b" strokeDasharray="3 3" />

                {/* Đường vẽ Area cho Giá */}
                <Area 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="close" 
                  stroke={mainColor} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#cryptoGradient)" 
                />

                {/* Cột khối lượng Volume dưới đáy */}
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