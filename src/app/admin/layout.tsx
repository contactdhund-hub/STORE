import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { MobileNav } from "./MobileNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }



  return (
    <div className="flex min-h-screen bg-[#f8f9fc] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-slate-200 flex-col h-screen sticky top-0 shrink-0 z-20">
        <div className="p-5 flex items-center gap-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-lg">
            T
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 uppercase">Dhund</span>
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
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex-1 flex items-center">
            <MobileNav />
          </div>
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              View Store
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
