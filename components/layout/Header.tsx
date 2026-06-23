"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

import { useRouter } from "next/navigation";
import { logout } from "@/features/auth/session";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();

    router.push("/login");
  };
  const pathname = usePathname();  
  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-white">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6">

        {/* Left */}

        <div className="flex items-center gap-8">

          <Link
            href="/"
            className="text-2xl font-bold text-sky-600"
          >
            Investdev 
          </Link>

          <nav className="hidden lg:flex gap-6 text-sm font-medium text-slate-600">

            <Link
              href="/markets"
              className={pathname === "/markets" ? "text-sky-600 font-semibold" : ""}
            >
              Markets
            </Link>

            <Link
              href="/community"
              className={pathname === "/community" ? "text-sky-600 font-semibold" : ""}
            >
              Community
            </Link>

            <Link
              href="/news"
              className={pathname === "/news" ? "text-sky-600 font-semibold" : ""}
            >
              News
            </Link>

            <Link
              href="/watchlist"
              className={pathname === "/watchlist" ? "text-sky-600 font-semibold" : ""}
            >
              Watchlist
            </Link>

          </nav>

        </div>

        {/* Right */}

        <div className="flex items-center gap-4">

          <div className="relative hidden md:block">

            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <Input
              placeholder="Search..."
              className="w-72 pl-10"
            />

          </div>

          <Bell
            size={20}
            className="cursor-pointer text-slate-600"
          />

          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-medium">
              {user ? "Welcome" : "Guest"}
            </span>

            <span className="text-xs text-slate-500">
              {user?.email ?? "Not signed in"}
            </span>
          </div>

          <DropdownMenu>

            <DropdownMenuTrigger>

              <Avatar className="cursor-pointer">

                <AvatarFallback>
                  {user?.email
                    ? user.email.charAt(0).toUpperCase()
                    : "G"}
                </AvatarFallback>

              </Avatar>

            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              <DropdownMenuItem
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

      </div>
    </header>
  );
}