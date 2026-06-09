"use client";

import { useState } from "react";
import { Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { deleteReview } from "@/actions/review";

export function ReviewTable({ reviews }: { reviews: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this review?")) {
      setLoadingId(id);
      await deleteReview(id);
      setLoadingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        No reviews have been submitted yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-medium">Product</th>
            <th className="px-6 py-4 font-medium">Reviewer</th>
            <th className="px-6 py-4 font-medium">Rating</th>
            <th className="px-6 py-4 font-medium">Comment</th>
            <th className="px-6 py-4 font-medium">Date</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reviews.map((review) => {
            const productImg = review.product.images[0]?.url || "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop";
            
            return (
              <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImg} alt={review.product.name} className="w-full h-full object-cover" />
                    </div>
                    <Link href={`/product/${review.productId}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1">
                      {review.product.name}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{review.reviewerName}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{review.reviewerEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={review.rating >= i ? "currentColor" : "none"} stroke="currentColor" strokeWidth={review.rating >= i ? "1" : "2"} className={review.rating >= i ? "text-yellow-400" : "text-gray-300"}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-600 max-w-xs truncate" title={review.comment}>
                    {review.comment}
                  </p>
                </td>
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  {new Date(review.createdAt).toISOString().split('T')[0]}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(review.id)}
                    disabled={loadingId === review.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Delete Review"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
