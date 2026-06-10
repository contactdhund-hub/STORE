const { neon } = require('@neondatabase/serverless');

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const res = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User'`;
    console.log("Schema:", res);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
