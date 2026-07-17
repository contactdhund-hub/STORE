import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";
import { Heart } from "lucide-react";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch wishlisted products
  const products = await sql`
    SELECT 
      p.*,
      COALESCE(json_agg(DISTINCT jsonb_build_object('url', pi."url")) FILTER (WHERE pi."id" IS NOT NULL), '[]') as images,
      COALESCE(json_agg(DISTINCT ps."name") FILTER (WHERE ps."id" IS NOT NULL), '[]') as sizes,
      COALESCE(json_agg(DISTINCT jsonb_build_object('name', pc."name", 'hex', pc."hex")) FILTER (WHERE pc."id" IS NOT NULL), '[]') as colors
    FROM "Wishlist" w
    JOIN "Product" p ON w."productId" = p."id"
    LEFT JOIN "ProductImage" pi ON pi."productId" = p."id"
    LEFT JOIN "ProductSize" ps ON ps."productId" = p."id"
    LEFT JOIN "ProductColor" pc ON pc."productId" = p."id"
    WHERE w."email" = ${session.user.email}
    GROUP BY p."id", w."createdAt"
    ORDER BY w."createdAt" DESC
  `;

  const mappedProducts = products.map((p: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category,
    images: (p.images || []).map((img: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => img.url),
    sizes: p.sizes || [],
    colors: p.colors || [],
    stockQuantity: p.stockQuantity,
    inStock: (p.stockQuantity ?? 34) > 0
  }));

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 py-12 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
        <Heart size={28} className="text-red-500 fill-red-500" />
        <h1 className="text-2xl font-serif font-medium text-gray-900">My Wishlist</h1>
        <span className="ml-auto text-sm text-gray-500 font-sans">{mappedProducts.length} Items</span>
      </div>

      {mappedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Heart size={32} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md">Browse our collection and tap the heart icon to save items you love for later.</p>
          <Link href="/" className="bg-black text-white px-8 py-3 rounded-md font-bold text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-12 sm:gap-x-6">
          {mappedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
