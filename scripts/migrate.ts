import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env file.');
}

const sql = neon(databaseUrl);

async function main() {
  console.log('Starting migration...');

  try {
    // 1. Add originalPrice and stockQuantity to Product table
    console.log('Altering Product table...');
    await sql`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "stockQuantity" INTEGER NOT NULL DEFAULT 34;
    `;
    console.log('Product table altered successfully.');

    // 2. Create Wishlist table
    console.log('Creating Wishlist table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "Wishlist" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "email" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    
    // Add unique constraint so a user can't wishlist the same item multiple times
    try {
      await sql`CREATE UNIQUE INDEX "Wishlist_email_productId_key" ON "Wishlist"("email", "productId");`;
    } catch (e: any) {
      if (e.message && e.message.includes('already exists')) {
        console.log('Unique index on Wishlist already exists.');
      } else {
        console.error('Index creation issue (might already exist):', e.message);
      }
    }

    console.log('Wishlist table created successfully.');
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
