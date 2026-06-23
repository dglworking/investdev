import MarketCard from "@/components/common/MarketCard";

export default function MarketOverview() {
  return (
    <section className="space-y-6">

      <div>

        <h2 className="text-2xl font-bold">
          🇻🇳 Vietnam Market
        </h2>

        <p className="text-slate-500">
          Vietnam stock market overview
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <MarketCard
          title="VNINDEX"
          value="..."
          change="Loading..."
        />

        <MarketCard
          title="VN30"
          value="..."
          change="Loading..."
        />

        <MarketCard
          title="HNX"
          value="..."
          change="Loading..."
        />

        <MarketCard
          title="UPCOM"
          value="..."
          change="Loading..."
        />

      </div>

    </section>
  );
}