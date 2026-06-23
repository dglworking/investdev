import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import MarketCard from "@/components/common/MarketCard";
import CryptoMarket from "@/components/stock/CryptoMarket";
import MarketOverview from "@/components/stock/MarketOverview";
import WatchlistCard from "@/components/stock/WatchlistCard";
import CommunityFeed from "@/components/community/CommunityFeed";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="mx-auto flex max-w-[1600px]">
        <Sidebar />

        <section className="min-h-[calc(100vh-64px)] flex-1 space-y-6 p-6">

          <h1 className="text-3xl font-bold">
            Chứng khoán Việt Nam
          </h1>
          
          <MarketOverview />
          
          <h1 className="text-3xl font-bold">
            Crypto Market
          </h1>

          <CryptoMarket />

          <WatchlistCard />

          <CommunityFeed />

        </section>

        <RightSidebar />
      </main>
    </div>
  );
}