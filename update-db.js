const { neon } = require('@neondatabase/serverless');

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const res = await sql`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "inStock" BOOLEAN DEFAULT true`;
    console.log("Success:", res);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
