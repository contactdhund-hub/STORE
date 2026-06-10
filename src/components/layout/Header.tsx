"use client";

import Link from 'next/link';
import { useCart } from '@/store/useCart';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { getCategories } from '@/actions/category';

export function Header() {
  const { items, toggleCart } = useCart();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 flex flex-col shadow-sm">
      {/* Top Bar */}
      <div className="w-full flex h-[60px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 -ml-1 text-black hover:bg-gray-100 rounded-md transition-colors md:hidden"
          >
            {/* Hamburger / Close Icon */}
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
          <Link href="/" className="flex items-center">
            {/* Typography mimicking Outfitters logo style */}
            <span className="text-2xl sm:text-3xl font-black tracking-wide uppercase text-black" style={{ fontFamily: 'var(--font-montserrat), sans-serif', display: 'inline-block'}}>DHUND</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex items-center border-b border-black pb-1 mr-4">
            <button type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search" 
              className="text-xs focus:outline-none w-32 placeholder-black uppercase tracking-wider bg-transparent" 
            />
          </form>
          <button className="p-1 text-black hover:bg-gray-100 rounded-full transition-colors md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <Link href="/profile" className="p-1 text-black hover:bg-gray-100 rounded-full transition-colors block" title="My Account">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
          <Link href="/track" className="p-1 text-black hover:bg-gray-100 rounded-full transition-colors hidden sm:block" title="Track Order">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </Link>
          <button 
            onClick={toggleCart}
            className="p-1 text-black hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Bar (Categories) */}
      <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-t border-gray-100 bg-white/95 backdrop-blur-md">
        <Suspense fallback={<div className="h-[45px] w-full" />}>
          <CategoryNav />
        </Suspense>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4 z-50">
          <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider text-black border-b border-gray-100 pb-2">
            Track Order
          </Link>
          <div className="pt-2">
            <Suspense fallback={null}>
              <MobileCategoryNav closeMenu={() => setIsMobileMenuOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </header>
  );
}

function CategoryNav() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'ALL';
  const [categories, setCategories] = useState<string[]>(["ALL", "SKINNY", "SLIM", "LOOSE RELAXED", "STRAIGHT", "BALLOON", "BAGGY", "RELAXED", "CARROT", "SLIM CROPPED", "SKATER"]);

  useEffect(() => {
    getCategories().then((data) => {
      if (data && data.length > 0) {
        setCategories(["ALL", ...data.map(c => c.name)]);
      }
    });
  }, []);

  return (
    <nav className="flex items-center gap-6 px-4 md:px-6 h-[45px] min-w-max">
      {categories.map((cat) => {
        const isActive = currentCategory.toUpperCase() === cat.toUpperCase();
        return (
          <Link 
            key={cat} 
            href={cat === 'ALL' ? '/' : `/?category=${encodeURIComponent(cat)}`}
            className={`text-[11px] font-bold tracking-widest whitespace-nowrap transition-colors uppercase pt-1 ${
              isActive ? "text-black border-b-[2px] border-black pb-[11px]" : "text-gray-500 hover:text-black pb-[13px]"
            }`}
          >
            {cat}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileCategoryNav({ closeMenu }: { closeMenu: () => void }) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'ALL';
  const [categories, setCategories] = useState<string[]>(["ALL", "SKINNY", "SLIM", "LOOSE RELAXED", "STRAIGHT", "BALLOON", "BAGGY", "RELAXED", "CARROT", "SLIM CROPPED", "SKATER"]);

  useEffect(() => {
    getCategories().then((data) => {
      if (data && data.length > 0) {
        setCategories(["ALL", ...data.map(c => c.name)]);
      }
    });
  }, []);

  return (
    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
      <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Categories</h3>
      {categories.map((cat) => {
        const isActive = currentCategory.toUpperCase() === cat.toUpperCase();
        return (
          <Link 
            key={cat} 
            onClick={closeMenu}
            href={cat === 'ALL' ? '/' : `/?category=${encodeURIComponent(cat)}`}
            className={`text-sm font-bold tracking-widest uppercase transition-colors ${
              isActive ? "text-black" : "text-gray-500"
            }`}
          >
            {cat}
          </Link>
        );
      })}
    </div>
  );
}
