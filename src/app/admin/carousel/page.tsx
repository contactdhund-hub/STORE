import { sql } from "@/lib/db";
import { CarouselManager } from "./CarouselManager";

export const dynamic = 'force-dynamic';

export default async function AdminCarouselPage() {
  const slides = await sql`
    SELECT * FROM "HeroSlide" ORDER BY "order" ASC
  `;

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hero Carousel</h1>
          <p className="text-muted-foreground mt-2">
            Manage the sliding images on the homepage.
          </p>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <CarouselManager initialSlides={slides as any /* eslint-disable-line @typescript-eslint/no-explicit-any */} />
        </div>
      </div>
    </div>
  );
}
