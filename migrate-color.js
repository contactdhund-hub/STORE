const { neon } = require('@neondatabase/serverless');

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const res = await sql`ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "color" TEXT`;
    console.log("Success: Added color column to OrderItem", res);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
