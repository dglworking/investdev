import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import MarketCard from "@/components/common/MarketCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <main className="mx-auto flex max-w-[1600px]">
        <Sidebar />

        <section className="min-h-[calc(100vh-64px)] flex-1 space-y-6 p-6">

          <h1 className="text-3xl font-bold">
            Market Overview
          </h1>

          <div className="grid gap-6 md:grid-cols-3">

            <MarketCard
              title="VNINDEX"
              value="1,325.28"
              change="+12.34 (+0.94%)"
            />

            <MarketCard
              title="HNX"
              value="245.16"
              change="+1.84 (+0.75%)"
            />

            <MarketCard
              title="VN30"
              value="1,412.44"
              change="-5.13 (-0.36%)"
              positive={false}
            />

          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold">
              Community Feed
            </h2>

            <p className="mt-3 text-slate-500">
              Community posts will appear here.
            </p>

          </div>

        </section>

        <RightSidebar />
      </main>
    </div>
  );
}