"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, Image as ImageIcon, Settings, Ticket, List as ListIcon, Users } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: ListIcon },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Hero Carousel", href: "/admin/carousel", icon: ImageIcon },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
        
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? "bg-[#0f172a] text-white" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <item.icon size={18} className={isActive ? "text-slate-300" : "text-slate-400"} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
