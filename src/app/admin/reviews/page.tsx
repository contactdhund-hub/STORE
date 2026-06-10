import { sql } from "@/lib/db";
import { ReviewTable } from "./ReviewTable";

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  // Fetch reviews with product info via JOIN
  const reviews = await sql`
    SELECT 
      r.*,
      p."name" as "productName",
      (SELECT pi."url" FROM "ProductImage" pi WHERE pi."productId" = r."productId" LIMIT 1) as "productImage"
    FROM "Review" r
    LEFT JOIN "Product" p ON p."id" = r."productId"
    ORDER BY r."createdAt" DESC
  `;

  // Transform to match the expected format
  const mappedReviews = reviews.map(r => ({
    ...r,
    product: {
      name: r.productName,
      images: r.productImage ? [{ url: r.productImage }] : []
    }
  }));

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
          <ReviewTable reviews={mappedReviews as any} />
        </div>
      </div>
    </div>
  );
}
