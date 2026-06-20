type MarketCardProps = {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
};

export default function MarketCard({
  title,
  value,
  change,
  positive = true,
}: MarketCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>

      <h2 className="mt-2 text-2xl font-bold">{value}</h2>

      <p
        className={`mt-2 text-sm font-semibold ${
          positive ? "text-green-600" : "text-red-600"
        }`}
      >
        {change}
      </p>
    </div>
  );
}