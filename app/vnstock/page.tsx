"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ChevronLeft, 
  ChevronRight, 
  LineChart,
  SlidersHorizontal
} from "lucide-react";

// Dữ liệu 60 mã cổ phiếu lớn nhất thị trường Việt Nam
export const VN_STOCKS_DATA = [
  // Page 1 (1-15)
  { symbol: "VCB", name: "Ngân hàng TMCP Ngoại thương VN", price: 57.40, change: -0.60, percent: -1.03, volume: "12.4M", industry: "Ngân hàng", high: 58.20, low: 57.10, marketCap: "318.5T", pe: 14.2, eps: "4,042" },
  { symbol: "HPG", name: "CTCP Tập đoàn Hòa Phát", price: 21.20, change: 0.20, percent: 0.95, volume: "28.6M", industry: "Thép & Vật liệu", high: 21.50, low: 20.90, marketCap: "123.2T", pe: 11.8, eps: "1,796" },
  { symbol: "VIX", name: "CTCP Chứng khoán VIX", price: 13.10, change: -0.05, percent: -0.38, volume: "18.1M", industry: "Chứng khoán", high: 13.35, low: 12.95, marketCap: "18.9T", pe: 15.6, eps: "840" },
  { symbol: "VHM", name: "CTCP Vinhomes", price: 69.10, change: -0.10, percent: -0.14, volume: "8.9M", industry: "Bất động sản", high: 70.00, low: 68.80, marketCap: "300.9T", pe: 9.4, eps: "7,351" },
  { symbol: "SSI", name: "CTCP Chứng khoán SSI", price: 19.40, change: -0.10, percent: -0.51, volume: "15.3M", industry: "Chứng khoán", high: 19.80, low: 19.25, marketCap: "29.2T", pe: 16.1, eps: "1,204" },
  { symbol: "FPT", name: "CTCP FPT", price: 134.50, change: 1.80, percent: 1.36, volume: "6.2M", industry: "Công nghệ", high: 135.20, low: 132.80, marketCap: "198.1T", pe: 24.5, eps: "5,490" },
  { symbol: "MWG", name: "CTCP Đầu tư Thế Giới Di Động", price: 68.20, change: 0.90, percent: 1.34, volume: "11.1M", industry: "Bán lẻ", high: 68.90, low: 67.10, marketCap: "99.8T", pe: 22.1, eps: "3,085" },
  { symbol: "VIC", name: "Tập đoàn Vingroup", price: 42.50, change: -0.30, percent: -0.70, volume: "5.4M", industry: "Bất động sản", high: 43.10, low: 42.20, marketCap: "162.4T", pe: 35.2, eps: "1,207" },
  { symbol: "VNM", name: "CTCP Sữa Việt Nam (Vinamilk)", price: 67.80, change: 0.40, percent: 0.59, volume: "4.8M", industry: "Thực phẩm", high: 68.20, low: 67.20, marketCap: "141.7T", pe: 16.8, eps: "4,035" },
  { symbol: "MSN", name: "CTCP Tập đoàn Masan", price: 74.30, change: -0.80, percent: -1.07, volume: "3.9M", industry: "Thực phẩm", high: 75.50, low: 73.90, marketCap: "106.3T", pe: 42.1, eps: "1,765" },
  { symbol: "TCB", name: "Ngân hàng TMCP Kỹ thương VN", price: 23.85, change: 0.35, percent: 1.49, volume: "19.5M", industry: "Ngân hàng", high: 24.10, low: 23.40, marketCap: "167.9T", pe: 7.8, eps: "3,057" },
  { symbol: "MBB", name: "Ngân hàng TMCP Quân đội", price: 25.10, change: 0.15, percent: 0.60, volume: "22.3M", industry: "Ngân hàng", high: 25.40, low: 24.85, marketCap: "132.8T", pe: 6.2, eps: "4,048" },
  { symbol: "ACB", name: "Ngân hàng TMCP Á Châu", price: 24.60, change: -0.15, percent: -0.61, volume: "10.1M", industry: "Ngân hàng", high: 24.90, low: 24.45, marketCap: "110.0T", pe: 6.9, eps: "3,565" },
  { symbol: "STB", name: "Ngân hàng TMCP Sài Gòn Thương Tín", price: 32.40, change: 0.60, percent: 1.89, volume: "16.8M", industry: "Ngân hàng", high: 32.80, low: 31.75, marketCap: "61.1T", pe: 7.9, eps: "4,101" },
  { symbol: "VPB", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng", price: 18.95, change: 0.05, percent: 0.26, volume: "25.7M", industry: "Ngân hàng", high: 19.20, low: 18.80, marketCap: "150.3T", pe: 11.2, eps: "1,692" },

  // Page 2 (16-30)
  { symbol: "BID", name: "Ngân hàng TMCP Đầu tư & Phát triển VN", price: 49.20, change: -0.40, percent: -0.81, volume: "3.2M", industry: "Ngân hàng", high: 49.80, low: 48.90, marketCap: "280.4T", pe: 11.5, eps: "4,278" },
  { symbol: "CTG", name: "Ngân hàng TMCP Công Thương VN", price: 35.80, change: 0.30, percent: 0.85, volume: "8.7M", industry: "Ngân hàng", high: 36.10, low: 35.30, marketCap: "192.1T", pe: 8.9, eps: "4,022" },
  { symbol: "GAS", name: "Tổng Công ty Khí Việt Nam", price: 78.50, change: -0.50, percent: -0.63, volume: "1.2M", industry: "Dầu khí", high: 79.20, low: 78.10, marketCap: "180.2T", pe: 15.3, eps: "5,130" },
  { symbol: "SAB", name: "Tổng CTCP Bia - Rượu - Nước giải khát SG", price: 56.20, change: 0.10, percent: 0.18, volume: "890K", industry: "Thực phẩm", high: 56.80, low: 55.90, marketCap: "72.1T", pe: 16.5, eps: "3,406" },
  { symbol: "VRE", name: "CTCP Vincom Retail", price: 18.45, change: -0.20, percent: -1.07, volume: "7.1M", industry: "Bất động sản", high: 18.80, low: 18.30, marketCap: "41.9T", pe: 9.8, eps: "1,882" },
  { symbol: "PLX", name: "Tập đoàn Xăng dầu Việt Nam", price: 41.20, change: 0.40, percent: 0.98, volume: "2.5M", industry: "Dầu khí", high: 41.70, low: 40.80, marketCap: "52.3T", pe: 18.2, eps: "2,263" },
  { symbol: "BCM", name: "Tổng Công ty Đầu tư và Phát triển Công nghiệp", price: 68.00, change: 1.20, percent: 1.80, volume: "1.1M", industry: "Bất động sản KCN", high: 68.50, low: 66.80, marketCap: "70.4T", pe: 28.4, eps: "2,394" },
  { symbol: "GVR", name: "Tập đoàn Công nghiệp Cao su VN", price: 34.20, change: 0.80, percent: 2.40, volume: "5.6M", industry: "Bất động sản KCN", high: 34.60, low: 33.20, marketCap: "136.8T", pe: 26.1, eps: "1,310" },
  { symbol: "POW", name: "Tổng Công ty Điện lực Dầu khí VN", price: 12.15, change: -0.10, percent: -0.82, volume: "9.4M", industry: "Năng lượng", high: 12.35, low: 12.05, marketCap: "28.4T", pe: 23.5, eps: "517" },
  { symbol: "HDB", name: "Ngân hàng TMCP Phát triển TP.HCM", price: 26.80, change: 0.45, percent: 1.71, volume: "11.2M", industry: "Ngân hàng", high: 27.10, low: 26.20, marketCap: "78.0T", pe: 6.8, eps: "3,941" },
  { symbol: "VIB", name: "Ngân hàng TMCP Quốc tế Việt Nam", price: 21.30, change: -0.10, percent: -0.47, volume: "6.8M", industry: "Ngân hàng", high: 21.60, low: 21.15, marketCap: "53.9T", pe: 6.5, eps: "3,276" },
  { symbol: "LPB", name: "Ngân hàng TMCP Lộc Phát Việt Nam", price: 31.50, change: 0.70, percent: 2.27, volume: "8.1M", industry: "Ngân hàng", high: 31.90, low: 30.60, marketCap: "80.6T", pe: 8.7, eps: "3,620" },
  { symbol: "TPB", name: "Ngân hàng TMCP Tiên Phong", price: 17.60, change: 0.10, percent: 0.57, volume: "14.2M", industry: "Ngân hàng", high: 17.85, low: 17.40, marketCap: "38.7T", pe: 7.1, eps: "2,478" },
  { symbol: "SSB", name: "Ngân hàng TMCP Đông Nam Á", price: 17.80, change: -0.05, percent: -0.28, volume: "3.1M", industry: "Ngân hàng", high: 18.05, low: 17.70, marketCap: "44.5T", pe: 10.4, eps: "1,711" },
  { symbol: "EIB", name: "Ngân hàng TMCP Xuất Nhập Khẩu VN", price: 19.25, change: 0.35, percent: 1.85, volume: "18.9M", industry: "Ngân hàng", high: 19.50, low: 18.80, marketCap: "33.5T", pe: 13.8, eps: "1,395" },

  // Page 3 (31-45)
  { symbol: "SHB", name: "Ngân hàng TMCP Sài Gòn - Hà Nội", price: 10.85, change: 0.05, percent: 0.46, volume: "24.1M", industry: "Ngân hàng", high: 11.00, low: 10.75, marketCap: "39.7T", pe: 5.8, eps: "1,870" },
  { symbol: "OCB", name: "Ngân hàng TMCP Phương Đông", price: 11.80, change: -0.10, percent: -0.84, volume: "4.5M", industry: "Ngân hàng", high: 12.00, low: 11.75, marketCap: "24.2T", pe: 6.0, eps: "1,966" },
  { symbol: "MSB", name: "Ngân hàng TMCP Hàng Hải Việt Nam", price: 12.45, change: 0.15, percent: 1.22, volume: "7.8M", industry: "Ngân hàng", high: 12.60, low: 12.25, marketCap: "24.9T", pe: 5.4, eps: "2,305" },
  { symbol: "KDH", name: "CTCP Đầu tư và Kinh doanh Nhà Khang Điền", price: 36.50, change: 0.50, percent: 1.39, volume: "3.4M", industry: "Bất động sản", high: 36.90, low: 35.80, marketCap: "29.5T", pe: 32.1, eps: "1,137" },
  { symbol: "NLG", name: "CTCP Đầu tư Nam Long", price: 39.80, change: -0.30, percent: -0.75, volume: "2.9M", industry: "Bất động sản", high: 40.30, low: 39.40, marketCap: "15.3T", pe: 25.6, eps: "1,554" },
  { symbol: "PDR", name: "CTCP Phát triển Bất động sản Phát Đạt", price: 21.80, change: 0.40, percent: 1.87, volume: "12.6M", industry: "Bất động sản", high: 22.10, low: 21.20, marketCap: "19.1T", pe: 28.9, eps: "754" },
  { symbol: "NVL", name: "CTCP Tập đoàn Đầu tư Địa ốc No Va", price: 10.90, change: -0.15, percent: -1.36, volume: "15.8M", industry: "Bất động sản", high: 11.15, low: 10.80, marketCap: "21.2T", pe: 45.0, eps: "242" },
  { symbol: "DXG", name: "CTCP Tập đoàn Đất Xanh", price: 15.20, change: 0.25, percent: 1.67, volume: "14.1M", industry: "Bất động sản", high: 15.45, low: 14.85, marketCap: "11.0T", pe: 38.2, eps: "398" },
  { symbol: "DIG", name: "Tổng CTCP Đầu tư Phát triển Xây dựng", price: 22.40, change: -0.30, percent: -1.32, volume: "16.5M", industry: "Bất động sản", high: 22.90, low: 22.20, marketCap: "13.6T", pe: 64.5, eps: "347" },
  { symbol: "CEO", name: "CTCP Tập đoàn C.E.O", price: 15.60, change: 0.10, percent: 0.65, volume: "8.2M", industry: "Bất động sản", high: 15.90, low: 15.30, marketCap: "8.0T", pe: 41.2, eps: "378" },
  { symbol: "VND", name: "CTCP Chứng khoán VNDIRECT", price: 14.85, change: -0.15, percent: -1.00, volume: "17.4M", industry: "Chứng khoán", high: 15.10, low: 14.70, marketCap: "18.1T", pe: 10.5, eps: "1,414" },
  { symbol: "HCM", name: "CTCP Chứng khoán Thành phố Hồ Chí Minh", price: 28.50, change: 0.60, percent: 2.15, volume: "5.1M", industry: "Chứng khoán", high: 28.80, low: 27.80, marketCap: "20.1T", pe: 18.4, eps: "1,548" },
  { symbol: "SHS", name: "CTCP Chứng khoán Sài Gòn - Hà Nội", price: 12.80, change: 0.00, percent: 0.00, volume: "13.9M", industry: "Chứng khoán", high: 13.00, low: 12.60, marketCap: "10.4T", pe: 9.8, eps: "1,306" },
  { symbol: "DGC", name: "CTCP Tập đoàn Hóa chất Đức Giang", price: 112.00, change: 2.50, percent: 2.28, volume: "3.8M", industry: "Hóa chất", high: 113.20, low: 109.50, marketCap: "42.5T", pe: 13.2, eps: "8,484" },
  { symbol: "DCM", name: "CTCP Phân bón Dầu khí Cà Mau", price: 36.80, change: 0.30, percent: 0.82, volume: "2.7M", industry: "Hóa chất", high: 37.20, low: 36.30, marketCap: "19.5T", pe: 14.1, eps: "2,609" },

  // Page 4 (46-60)
  { symbol: "DPM", name: "Tổng CTCP Phân bón và Hóa chất Dầu khí", price: 34.10, change: -0.20, percent: -0.58, volume: "2.1M", industry: "Hóa chất", high: 34.50, low: 33.80, marketCap: "13.3T", pe: 21.0, eps: "1,623" },
  { symbol: "FRT", name: "CTCP Bán lẻ Kỹ thuật số FPT", price: 178.00, change: 3.50, percent: 2.01, volume: "1.4M", industry: "Bán lẻ", high: 180.00, low: 174.00, marketCap: "24.2T", pe: 85.0, eps: "2,094" },
  { symbol: "KBC", name: "Tổng CTCP Phát triển Đô thị Kinh Bắc", price: 27.20, change: 0.40, percent: 1.49, volume: "6.9M", industry: "Bất động sản KCN", high: 27.60, low: 26.70, marketCap: "20.8T", pe: 19.5, eps: "1,394" },
  { symbol: "IDC", name: "Tổng Công ty IDICO - CTCP", price: 57.50, change: -0.50, percent: -0.86, volume: "1.8M", industry: "Bất động sản KCN", high: 58.30, low: 57.00, marketCap: "18.9T", pe: 10.8, eps: "5,324" },
  { symbol: "VGC", name: "Tổng Công ty Viglacera - CTCP", price: 44.10, change: 0.20, percent: 0.46, volume: "950K", industry: "Vật liệu & KCN", high: 44.80, low: 43.80, marketCap: "19.7T", pe: 17.6, eps: "2,505" },
  { symbol: "REE", name: "CTCP Cơ Điện Lạnh", price: 65.40, change: 0.80, percent: 1.24, volume: "1.3M", industry: "Năng lượng & Điện", high: 66.00, low: 64.50, marketCap: "30.8T", pe: 14.5, eps: "4,510" },
  { symbol: "PC1", name: "CTCP Tập đoàn PC1", price: 28.30, change: -0.30, percent: -1.05, volume: "3.2M", industry: "Xây lắp & Năng lượng", high: 28.80, low: 28.10, marketCap: "8.8T", pe: 24.1, eps: "1,174" },
  { symbol: "PVD", name: "CTCP Khoan và Dịch vụ Khoan Dầu khí", price: 27.80, change: 0.30, percent: 1.09, volume: "5.4M", industry: "Dầu khí", high: 28.20, low: 27.30, marketCap: "15.4T", pe: 22.8, eps: "1,219" },
  { symbol: "PVS", name: "TCT Cổ phần Dịch vụ Kỹ thuật Dầu khí VN", price: 40.20, change: 0.50, percent: 1.26, volume: "4.1M", industry: "Dầu khí", high: 40.70, low: 39.50, marketCap: "19.2T", pe: 18.2, eps: "2,208" },
  { symbol: "ANV", name: "CTCP Nam Việt", price: 30.50, change: -0.40, percent: -1.29, volume: "2.3M", industry: "Thủy sản", high: 31.10, low: 30.20, marketCap: "4.0T", pe: 35.0, eps: "871" },
  { symbol: "VHC", name: "CTCP Vĩnh Hoàn", price: 72.00, change: 1.10, percent: 1.55, volume: "1.7M", industry: "Thủy sản", high: 72.80, low: 70.50, marketCap: "16.1T", pe: 14.2, eps: "5,070" },
  { symbol: "DBC", name: "CTCP Tập đoàn Dabaco Việt Nam", price: 29.10, change: 0.60, percent: 2.11, volume: "7.5M", industry: "Nông nghiệp", high: 29.50, low: 28.30, marketCap: "7.0T", pe: 16.8, eps: "1,732" },
  { symbol: "BAF", name: "CTCP Nông nghiệp BAF Việt Nam", price: 20.45, change: -0.15, percent: -0.73, volume: "3.9M", industry: "Nông nghiệp", high: 20.80, low: 20.20, marketCap: "2.9T", pe: 27.5, eps: "743" },
  { symbol: "HAG", name: "CTCP Hoàng Anh Gia Lai", price: 13.20, change: 0.20, percent: 1.54, volume: "14.8M", industry: "Nông nghiệp", high: 13.45, low: 12.90, marketCap: "13.9T", pe: 12.4, eps: "1,064" },
  { symbol: "HNG", name: "CTCP HAGL Agrico", price: 4.80, change: -0.10, percent: -2.04, volume: "5.2M", industry: "Nông nghiệp", high: 4.95, low: 4.75, marketCap: "5.3T", pe: -15.2, eps: "-315" },
];

export default function VNStockPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const itemsPerPage = 15;

  // Lọc ngành hàng unique
  const industries = useMemo(() => {
    const list = Array.from(new Set(VN_STOCKS_DATA.map((item) => item.industry)));
    return ["All", ...list];
  }, []);

  // Lọc danh sách theo Search & Ngành
  const filteredStocks = useMemo(() => {
    return VN_STOCKS_DATA.filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry =
        selectedIndustry === "All" || stock.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [searchQuery, selectedIndustry]);

  // Tính toán số trang
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage) || 1;
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStocks.slice(start, start + itemsPerPage);
  }, [filteredStocks, currentPage]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <LineChart size={24} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  Thị trường Chứng khoán Việt Nam
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Lưu ý: Đây là web thử nghiệm nên các chỉ số chứng khoán chỉ là giả lập!
                </p>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm mã hoặc tên công ty..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="relative w-full sm:w-48">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <select
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {ind === "All" ? "Tất cả ngành nghề" : ind}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DESKTOP & MOBILE RESPONSIVE DATA DISPLAY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4 pl-6">Mã CK</th>
                  <th className="p-4">Tên doanh nghiệp</th>
                  <th className="p-4">Ngành nghề</th>
                  <th className="p-4 text-right">Giá khớp (x1,000đ)</th>
                  <th className="p-4 text-right">Tăng / Giảm</th>
                  <th className="p-4 text-right">Khối lượng</th>
                  <th className="p-4 text-right">Thấp / Cao 24h</th>
                  <th className="p-4 pr-6 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
                {paginatedStocks.length > 0 ? (
                  paginatedStocks.map((stock) => (
                    <tr 
                      key={stock.symbol} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <Link href={`/vnstock/${stock.symbol}`} className="font-black text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          {stock.symbol}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-900 dark:text-slate-100 font-bold max-w-[220px] truncate">
                        {stock.name}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                          {stock.industry}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white text-sm">
                        {stock.price.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded ${
                          stock.change >= 0 
                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50" 
                            : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50"
                        }`}>
                          {stock.change >= 0 ? <TrendingUp size={13} className="mr-1" /> : <TrendingDown size={13} className="mr-1" />}
                          {stock.change >= 0 ? `+${stock.change.toFixed(2)}` : stock.change.toFixed(2)} ({stock.percent >= 0 ? `+${stock.percent}%` : `${stock.percent}%`})
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-600 dark:text-slate-300">
                        {stock.volume}
                      </td>
                      <td className="p-4 text-right text-slate-400">
                        <span className="text-rose-500 font-bold">{stock.low.toFixed(2)}</span> - <span className="text-emerald-500 font-bold">{stock.high.toFixed(2)}</span>
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <Link
                          href={`/vnstock/${stock.symbol}`}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Không tìm thấy mã chứng khoán phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST CARD VIEW */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedStocks.length > 0 ? (
              paginatedStocks.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/vnstock/${stock.symbol}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-base text-blue-600 dark:text-blue-400">
                        {stock.symbol}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {stock.industry}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                      {stock.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      KL: {stock.volume}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-black text-base text-slate-900 dark:text-white">
                      {stock.price.toFixed(2)}
                    </div>
                    <div className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                      stock.change >= 0 
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50" 
                        : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50"
                    }`}>
                      {stock.change >= 0 ? `+${stock.percent}%` : `${stock.percent}%`}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy mã cổ phiếu.
              </div>
            )}
          </div>

          {/* PAGINATION BAR (Hiển thị 4 trang) */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-xs text-slate-500 font-semibold">
              Hiển thị <span className="font-bold text-slate-900 dark:text-white">{paginatedStocks.length}</span> trên tổng số <span className="font-bold text-slate-900 dark:text-white">{filteredStocks.length}</span> mã
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}