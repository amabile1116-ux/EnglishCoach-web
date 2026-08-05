"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BookOpen,
  Repeat,
  MessageCircle,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl justify-between px-4 py-2 sm:px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[3rem] w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
