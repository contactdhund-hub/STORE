"use client";

import { useState } from "react";
import { submitReview } from "@/actions/review";

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: Date;
}

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
}

export function ReviewSection({ productId, reviews }: ReviewSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(5);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  const counts = [5, 4, 3, 2, 1].map(num => ({
    stars: num,
    count: reviews.filter(r => r.rating === num).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === num).length / reviews.length) * 100 : 0
  }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("rating", rating.toString());
    formData.set("productId", productId);

    const res = await submitReview(formData);
    
    setLoading(false);
    
    if (res.success) {
      setSuccess(true);
      setIsFormOpen(false);
    } else {
      setError(res.error || "Failed to submit review.");
    }
  }

  return (
    <div className="mb-24">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Customer Reviews</h2>
        <div className="h-px bg-gray-100 flex-1"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Review Summary */}
        <div className="col-span-1 border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm h-fit">
          <h2 className="text-7xl font-black tracking-tighter text-[#0a1128] mb-2">{averageRating}</h2>
          <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(i => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={i <= Math.round(Number(averageRating)) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={i <= Math.round(Number(averageRating)) ? "1" : "2"} className={i <= Math.round(Number(averageRating)) ? "text-black" : "text-gray-300"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ))}
          </div>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-8">Based on {reviews.length} Customer Reviews</p>
          
          <div className="w-full space-y-3 mb-8">
            {counts.map(({ stars, percentage }) => (
              <div key={stars} className="flex items-center gap-3 text-xs font-bold text-gray-900">
                <span className="w-2">{stars}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-black"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-gray-400 w-8 text-right">{Math.round(percentage)}%</span>
              </div>
            ))}
          </div>

          {!isFormOpen && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="w-full bg-black text-white text-[11px] font-bold tracking-widest py-4 uppercase hover:bg-gray-800 transition-colors rounded-md shadow-sm"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Reviews List / Form Area */}
        <div className="col-span-1 md:col-span-2">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
              Review submitted successfully! Thank you for your feedback.
            </div>
          )}

          {isFormOpen && (
            <form onSubmit={handleSubmit} className="mb-10 bg-[#fcfcfc] p-6 sm:p-8 border border-gray-100 rounded-2xl">
              <h3 className="text-lg font-bold mb-4">Write your review</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Name</label>
                  <input required name="reviewerName" type="text" className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-black transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email (to verify purchase)</label>
                  <input required name="reviewerEmail" type="email" className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-black transition-colors" placeholder="john@example.com" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={rating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth={rating >= star ? "1" : "2"} className={rating >= star ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200 transition-colors"}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Review</label>
                <textarea required name="comment" rows={4} className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:border-black transition-colors resize-none" placeholder="What did you think about this product?"></textarea>
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={loading} className="bg-black text-white px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? "Submitting..." : "Submit Review"}
                </button>
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className="border border-gray-100 bg-[#fcfcfc] rounded-2xl p-12 border-dashed flex flex-col items-center justify-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200 mb-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">No Reviews for this product yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={review.rating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth={review.rating >= star ? "1" : "2"} className={review.rating >= star ? "text-yellow-400" : "text-gray-200"}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-900">{review.reviewerName}</span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-2 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Verified Buyer
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-3">{new Date(review.createdAt).toISOString().split('T')[0]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
