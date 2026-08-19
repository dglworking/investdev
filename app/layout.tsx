import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvestDev - Nền tảng Phân tích & Theo dõi Thị trường",
  description: "Cập nhật dữ liệu giá Realtime, Biểu đồ kỹ thuật TradingView và Sổ lệnh crypto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col`}>
        {/* Sticky Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
          <div className="max-w-[1650px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 InvestDev. Nền tảng dữ liệu tài chính.</p>
            <div className="flex items-center space-x-4">
              <span>TradingView Chart - Binance API</span>
              <span>•</span>
              <span>Powered by MrL</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}