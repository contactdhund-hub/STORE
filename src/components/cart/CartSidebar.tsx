"use client";

import { useCart } from "@/store/useCart";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getStoreSettings } from "@/actions/settings";

export function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity } = useCart();
  const [shippingConfig, setShippingConfig] = useState({ fee: 250, threshold: 2000 });

  useEffect(() => {
    getStoreSettings().then(settings => {
      setShippingConfig({ fee: settings.shippingFee, threshold: settings.freeShippingThreshold });
    }).catch(console.error);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const progressPercentage = Math.min(100, (total / shippingConfig.threshold) * 100);
  const amountAway = shippingConfig.threshold - total;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag size={20} />
            Your Bag ({items.length})
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <ShoppingBag size={48} className="text-gray-300" />
              <p>Your bag is empty.</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 px-6 py-2 bg-black text-white rounded-md font-bold text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-24 h-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[#0a1128] text-sm mb-1 line-clamp-2">{item.name}</h3>
                      {item.size && (
                        <p className="text-xs text-gray-500 mb-2">Size: <span className="font-semibold text-gray-800">{item.size}</span></p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded text-sm w-24 h-8">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="flex-1 flex items-center justify-center hover:bg-gray-50 text-gray-500"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex-1 flex items-center justify-center hover:bg-gray-50 text-gray-500"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-bold text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex flex-col border-t border-gray-100 bg-gray-50">
            {/* Free Shipping Progress */}
            <div className="p-4 bg-white border-b border-gray-100">
              <div className="flex justify-between text-xs font-semibold mb-2">
                {amountAway > 0 ? (
                  <span className="text-gray-600">
                    You&apos;re <span className="text-black">Rs. {amountAway.toLocaleString()}</span> away from <span className="font-bold">Free Shipping!</span>
                  </span>
                ) : (
                  <span className="text-green-600 font-bold">
                    You&apos;ve unlocked Free Shipping! 🎉
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${amountAway > 0 ? 'bg-black' : 'bg-green-500'}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold text-lg text-[#0a1128]">Rs. {total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mb-6 text-center">Shipping & taxes calculated at checkout</p>
              <Link 
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full bg-black text-white py-4 rounded-md font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors shadow-sm block text-center"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
