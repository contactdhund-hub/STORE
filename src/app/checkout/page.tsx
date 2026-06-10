"use client";

import { useCart } from "@/store/useCart";
import Link from "next/link";
import { ChevronLeft, Ticket, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createOrder } from "@/actions/order";
import { getStoreSettings } from "@/actions/settings";
import { validateCoupon } from "@/actions/coupon";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [shippingConfig, setShippingConfig] = useState({ fee: 250, threshold: 2000 });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, type: string, value: number} | null>(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    getStoreSettings().then(settings => {
      setShippingConfig({ fee: settings.shippingFee, threshold: settings.freeShippingThreshold });
    }).catch(console.error);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > shippingConfig.threshold ? 0 : shippingConfig.fee;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = Math.round(subtotal * (appliedCoupon.value / 100));
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  
  const finalTotal = subtotal + shipping - discountAmount;

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    
    const res = await validateCoupon(couponCode);
    if (res.valid && res.coupon) {
      setAppliedCoupon({
        code: res.coupon.code,
        type: res.coupon.discountType,
        value: res.coupon.discountValue
      });
      setCouponCode("");
    } else {
      setCouponError(res.error || "Invalid coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      address: formData.get("address"),
      apartment: formData.get("apartment"),
      city: formData.get("city"),
      postalCode: formData.get("postalCode"),
      phone: formData.get("phone"),
      totalAmount: finalTotal,
      couponCode: appliedCoupon?.code || null,
      discountAmount: discountAmount > 0 ? discountAmount : null,
      items: items,
    };

    const result = await createOrder(data);
    
    if (result.success) {
      setCreatedOrderId(result.orderId || "");
      setIsSubmitted(true);
      clearCart();
    } else {
      alert(result.error || "Something went wrong. Please try again.");
    }
    
    setIsPending(false);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-2 max-w-md">
          Thank you for your purchase. We&apos;ve received your order and will email you the receipt and tracking details shortly.
        </p>
        <div className="bg-gray-50 border border-gray-200 px-6 py-4 rounded-md mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Order Number</p>
          <p className="text-xl font-black text-[#0a1128]">{createdOrderId}</p>
        </div>
        <Link 
          href="/"
          className="bg-black text-white px-8 py-3 rounded-md font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4">Your Bag is Empty</h1>
        <p className="text-gray-600 mb-8">You haven&apos;t added any items to checkout yet.</p>
        <Link 
          href="/"
          className="bg-black text-white px-8 py-3 rounded-md font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10 md:py-16">
      <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition-colors mb-8">
        <ChevronLeft size={16} className="mr-1" />
        Return to Shop
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Column: Forms */}
        <div className="flex-1 w-full">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Contact Info */}
            <section>
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" name="email" required className="w-full border border-gray-300 rounded-md p-3 focus:ring-black focus:border-black transition-colors" placeholder="you@example.com" />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" name="firstName" required className="w-full border border-gray-300 rounded-md p-3 focus:ring-black focus:border-black transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" name="lastName" required className="w-full border border-gray-300 rounded-md p-3 focus:ring-black focus:border-black transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" name="address" required className="w-full border border-gray-300 rounded-md p-3 focus:ring-black focus:border-black transition-colors" placeholder="123 Main St" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, suite, etc. (optional)</label>
                  <input type="text" name="apartment" className="w-full border border-gray-300 rounded-md p-3 focus:ring-black focus:border-black transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" required className="w-full border border-gray-300 rounded-md p-3 focus:ring-black focus:border-black transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input type="text" name="postalCode" required className="w-full border border-gray-300 rounded-md p-3 focus:ring-black focus:border-black transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" required className="w-full border border-gray-300 rounded-md p-3 focus:ring-black focus:border-black transition-colors" />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                Payment
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-[5px] border-black bg-white"></div>
                  <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
                </div>
                <p className="text-sm text-gray-500 ml-7">Pay with cash upon delivery.</p>
              </div>
            </section>

            <button disabled={isPending} type="submit" className="w-full bg-black text-white py-4 rounded-md font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors shadow-sm text-lg disabled:opacity-50">
              {isPending ? "Processing..." : "Complete Order"}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[450px] bg-gray-50 border border-gray-100 rounded-xl p-6 lg:p-8 sticky top-24">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-16 h-20 bg-white rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-sm text-[#0a1128] line-clamp-1">{item.name}</h3>
                  {item.size && <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>}
                </div>
                <div className="pt-1 text-right font-semibold text-sm">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Input */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code" 
                className="w-full border border-gray-300 rounded-md p-2 uppercase focus:ring-black focus:border-black transition-colors" 
              />
              <button 
                type="button" 
                onClick={handleApplyCoupon}
                className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md font-medium transition-colors"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
            
            {appliedCoupon && (
              <div className="mt-3 bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-md flex justify-between items-center text-sm">
                <span className="font-bold flex items-center gap-1.5"><Ticket size={14}/> {appliedCoupon.code}</span>
                <button type="button" onClick={handleRemoveCoupon} className="text-gray-500 hover:text-red-500"><X size={14}/></button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span className="font-semibold">-Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold">{shipping === 0 ? "Free" : `Rs. ${shipping}`}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-end">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-black text-[#0a1128]">Rs. {finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
