"use client";

import {
  ChartCandlestick,
  House,
  Newspaper,
  Star,
  Users,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    title: "Home",
    href: "/",
    icon: House,
  },
  {
    title: "Markets",
    href: "/markets",
    icon: ChartCandlestick,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
  {
    title: "News",
    href: "/news",
    icon: Newspaper,
  },
  {
    title: "Watchlist",
    href: "/watchlist",
    icon: Star,
  },
];

export default function Sidebar() {
  const pathname = usePathname();  
  return (
    <aside className="w-64 border-r bg-white">
      <div className="p-6">

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </p>

        <nav className="space-y-2">

          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-700 transition hover:bg-slate-100"
              >
                <Icon size={18} />

                <span>{item.title}</span>
              </button>
            );
          })}

        </nav>
      </div>
    </aside>
  );
}