require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function updateCategories() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const categories = ['Accessories', 'Hoodies', 'Jeans', 'Men', 'Sneakers', 'T-Shirts'];
    for (const cat of categories) {
      await sql`INSERT INTO "Category" ("name", "updatedAt") VALUES (${cat}, NOW()) ON CONFLICT DO NOTHING`;
    }
    console.log("Categories successfully synced to database.");
  } catch (err) {
    console.error("Error:", err);
  }
}

updateCategories();
