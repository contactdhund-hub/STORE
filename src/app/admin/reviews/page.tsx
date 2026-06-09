import { db } from "@/lib/db";
import { ReviewTable } from "./ReviewTable";

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    include: {
      product: {
        select: {
          name: true,
          images: { take: 1 }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and moderate customer reviews across all products.
          </p>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <ReviewTable reviews={reviews as any} />
        </div>
      </div>
    </div>
  );
}
