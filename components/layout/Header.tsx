"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Search, 
  TrendingUp, 
  Coins, 
  LineChart, 
  Home, 
  X, 
  Sun, 
  Moon, 
  Menu, 
  DollarSign
} from "lucide-react";
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

// Danh sách gợi ý tìm kiếm gồm cả Crypto và Ngoại tệ (Forex)
const POPULAR_SYMBOLS = [
  // Tiền mã hóa (Crypto)
  { symbol: "BTC", name: "Bitcoin", type: "Crypto", category: "crypto" },
  { symbol: "ETH", name: "Ethereum", type: "Crypto", category: "crypto" },
  { symbol: "SOL", name: "Solana", type: "Crypto", category: "crypto" },
  { symbol: "BNB", name: "Binance Coin", type: "Crypto", category: "crypto" },
  { symbol: "ACE", name: "Fusionist", type: "Crypto", category: "crypto" },
  
  // Ngoại tệ (Forex)
  { symbol: "USD", name: "Đô la Mỹ", type: "Forex", category: "forex" },
  { symbol: "EUR", name: "Đồng Euro", type: "Forex", category: "forex" },
  { symbol: "JPY", name: "Yên Nhật", type: "Forex", category: "forex" },
  { symbol: "GBP", name: "Bảng Anh", type: "Forex", category: "forex" },
  { symbol: "AUD", name: "Đô la Úc", type: "Forex", category: "forex" },
  { symbol: "CAD", name: "Đô la Canada", type: "Forex", category: "forex" },
  { symbol: "SGD", name: "Đô la Singapore", type: "Forex", category: "forex" },
  { symbol: "CNY", name: "Nhân dân tệ", type: "Forex", category: "forex" },
  { symbol: "KRW", name: "Won Hàn Quốc", type: "Forex", category: "forex" },
];

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // State quản lý Ô tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // State quản lý Chế độ Sáng / Tối
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Điều hướng thông minh dựa trên loại tài sản (Crypto hoặc Forex)
  const navigateToSymbol = (symbolItem: typeof POPULAR_SYMBOLS[0]) => {
    if (symbolItem.category === "forex") {
      router.push(`/forex/${symbolItem.symbol}`);
    } else {
      router.push(`/crypto/${symbolItem.symbol}`);
    }
    setIsDropdownOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim().toUpperCase();
    if (trimmed) {
      const match = POPULAR_SYMBOLS.find((item) => item.symbol === trimmed);
      if (match) {
        navigateToSymbol(match);
      } else {
        router.push(`/crypto/${trimmed}`);
      }
      setIsDropdownOpen(false);
      setIsMobileSearchOpen(false);
      setSearchQuery("");
    }
  };

  const filteredSymbols = POPULAR_SYMBOLS.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1650px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* LEFT: Logo + Nav */}
        <div className="flex items-center space-x-3 md:space-x-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp size={18} className="md:hidden" />
              <TrendingUp size={20} className="hidden md:block" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Invest<span className="text-blue-600">Dev</span>
            </span>
          </Link>

          {/* Mobile Dropdown Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none">
                <Menu size={14} className="text-blue-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => router.push("/")} className={`cursor-pointer font-medium flex items-center gap-2 ${pathname === "/" ? "text-blue-600 font-bold" : ""}`}>
                  <Home size={16} />
                  <span>Tổng quan</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/crypto")} className={`cursor-pointer font-medium flex items-center gap-2 ${pathname.startsWith("/crypto") ? "text-blue-600 font-bold" : ""}`}>
                  <Coins size={16} className="text-amber-500" />
                  <span>Thị trường Crypto</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/forex")} className={`cursor-pointer font-medium flex items-center gap-2 ${pathname.startsWith("/forex") ? "text-blue-600 font-bold" : ""}`}>
                  <DollarSign size={16} className="text-emerald-500" />
                  <span>Tỉ giá Ngoại tệ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/vnstock")} className={`cursor-pointer font-medium flex items-center gap-2 ${pathname.startsWith("/vnstock") || pathname.startsWith("/stocks") ? "text-blue-600 font-bold" : ""}`}>
                  <LineChart size={16} className="text-blue-500" />
                  <span>Chứng khoán VN</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname === "/" ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50" : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
              <Home size={16} />
              <span>Tổng quan</span>
            </Link>
            <Link href="/crypto" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname.startsWith("/crypto") ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50" : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
              <Coins size={16} />
              <span>Thị trường Crypto</span>
            </Link>
            <Link href="/forex" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname.startsWith("/forex") ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50" : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
              <DollarSign size={16} />
              <span>Tỉ giá</span>
            </Link>
            <Link href="/vnstock" className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname.startsWith("/vnstock") || pathname.startsWith("/stocks") ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50" : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
              <LineChart size={16} />
              <span>Chứng khoán</span>
            </Link>
          </nav>
        </div>

        {/* RIGHT: Search + Controls */}
        <div className="flex items-center space-x-2 md:space-x-3">
          
          {/* PC Search Bar */}
          <div className="relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Tìm mã Crypto, Tiền tệ (BTC, USD...)"
                className="w-72 pl-10 pr-8 h-9 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none focus-visible:ring-1 focus-visible:ring-blue-500 font-medium text-xs"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Suggestions Popup */}
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
                        onClick={() => navigateToSymbol(item)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white uppercase">
                            {item.symbol}
                          </span>
                          <span className="text-xs text-slate-400">{item.name}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          item.category === "forex" 
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                            : "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                        }`}>
                          {item.type}
                        </span>
                      </button>
                    ))
                  ) : (
                    <button onClick={handleSearchSubmit} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-between">
                      <span>Xem kết quả cho &quot;{searchQuery.toUpperCase()}&quot;</span>
                      <span>↵ Enter</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search size={18} />
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* Notification Bell */}
          <button type="button" className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell size={18} />
          </button>

          {/* User Info */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              {user ? "Welcome" : "Guest"}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[130px] truncate">
              {user?.email ?? "Chế độ khách"}
            </span>
          </div>

          {/* Avatar Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-8 w-8 md:h-9 md:w-9 cursor-pointer border border-slate-200 dark:border-slate-700">
                <AvatarFallback className="bg-blue-600 text-white font-bold text-xs md:text-sm">
                  {user?.email ? user.email.charAt(0).toUpperCase() : "G"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user ? (
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer font-medium">
                  Đăng xuất
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => router.push("/login")} className="cursor-pointer font-medium">
                  Đăng nhập / Đăng ký
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900" ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Nhập mã Crypto hoặc Tiền tệ (USD, BTC...)"
              className="w-full pl-9 pr-8 h-9 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none font-medium text-xs"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <X size={14} />
              </button>
            )}
          </form>

          {isDropdownOpen && searchQuery.trim().length > 0 && (
            <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSymbols.length > 0 ? (
                  filteredSymbols.map((item) => (
                    <button
                      key={item.symbol}
                      onClick={() => navigateToSymbol(item)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white uppercase">
                          {item.symbol}
                        </span>
                        <span className="text-xs text-slate-400">{item.name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        item.category === "forex" 
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                          : "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                      }`}>
                        {item.type}
                      </span>
                    </button>
                  ))
                ) : (
                  <button onClick={handleSearchSubmit} className="w-full text-left px-3 py-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Xem kết quả cho &quot;{searchQuery.toUpperCase()}&quot;
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}