"use client";

import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-slate-600">
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-[260px] max-w-[80vw] bg-white h-full flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg">
                  T
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800 uppercase">Dhund</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-500 bg-slate-100 rounded-md">
                <X size={20} />
              </button>
            </div>
            
            <SidebarNav />
            
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-9 h-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-sm font-bold">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Admin User</span>
                  <span className="text-xs text-slate-500">admin@fashion.com</span>
                  <span className="text-[10px] font-bold text-blue-600 tracking-wider mt-0.5">ADMIN</span>
                </div>
              </div>
              <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                <LogOut size={18} className="text-slate-400" />
                Logout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
