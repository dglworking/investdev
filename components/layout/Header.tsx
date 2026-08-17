"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Bell, Search, TrendingUp, Coins, LineChart, Home, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { logout } from "@/features/auth/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Danh sách gợi ý tìm kiếm Crypto phổ biến
const POPULAR_SYMBOLS = [
  { symbol: "BTC", name: "Bitcoin", type: "Crypto" },
  { symbol: "ETH", name: "Ethereum", type: "Crypto" },
  { symbol: "SOL", name: "Solana", type: "Crypto" },
  { symbol: "BNB", name: "Binance Coin", type: "Crypto" },
  { symbol: "XRP", name: "Ripple", type: "Crypto" },
  { symbol: "ADA", name: "Cardano", type: "Crypto" },
  { symbol: "DOGE", name: "Dogecoin", type: "Crypto" },
  { symbol: "ACE", name: "Fusionist", type: "Crypto" },
];

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // State quản lý Ô tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Điều hướng khi người dùng nhấn Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim().toUpperCase();
    if (trimmed) {
      router.push(`/crypto/${trimmed}`);
      setIsDropdownOpen(false);
      setSearchQuery("");
    }
  };

  // Lọc gợi ý theo từ khóa
  const filteredSymbols = POPULAR_SYMBOLS.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Đóng Dropdown khi bấm ra ngoài ô tìm kiếm
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1650px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LEFT: Logo + Menu Nav */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Invest<span className="text-blue-600">Dev</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname === "/"
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50"
                  : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Home size={16} />
              <span>Tổng quan</span>
            </Link>

            <Link
              href="/crypto"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith("/crypto")
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50"
                  : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Coins size={16} />
              <span>Thị trường Crypto</span>
            </Link>

            <Link
              href="/vnstock"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pathname.startsWith("/vnstock") || pathname.startsWith("/stocks")
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50"
                  : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <LineChart size={16} />
              <span>Chứng khoán</span>
            </Link>
          </nav>
        </div>

        {/* RIGHT: Ô tìm kiếm thông minh + Thông báo + User Dropdown */}
        <div className="flex items-center space-x-4">
          
          {/* Ô TÌM KIẾM CÓ GỢI Ý & ĐIỀU HƯỚNG */}
          <div className="relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Nhập mã crypto (BTC, ACE, SOL...)"
                className="w-72 pl-10 pr-8 h-9 bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-1 focus-visible:ring-blue-500 font-medium text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Dropdown Popup Gợi Ý Tìm Kiếm */}
            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Gợi ý mã tìm kiếm
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredSymbols.length > 0 ? (
                    filteredSymbols.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          router.push(`/crypto/${item.symbol}`);
                          setIsDropdownOpen(false);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white uppercase">
                            {item.symbol}
                          </span>
                          <span className="text-xs text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                          {item.type}
                        </span>
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-between"
                    >
                      <span>Xem kết quả cho &quot;{searchQuery.toUpperCase()}&quot;</span>
                      <span>↵ Enter</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Thông báo */}
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={18} />
          </button>

          {/* Thông tin User */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {user ? "Welcome" : "Guest"}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[130px] truncate">
              {user?.email ?? "Chế độ khách"}
            </span>
          </div>

          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-9 w-9 cursor-pointer border border-slate-200 dark:border-slate-700">
                <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                  {user?.email ? user.email.charAt(0).toUpperCase() : "G"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user ? (
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer font-medium"
                >
                  Đăng xuất
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => router.push("/login")}
                  className="cursor-pointer font-medium"
                >
                  Đăng nhập / Đăng ký
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
}