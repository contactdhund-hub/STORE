const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const newEmail = "dhund.brand@gmail.com";
    const newPassword = "Dhund!Admin$2026";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    // We update any admin user (assuming there's only 1)
    const res = await sql`
      UPDATE "User" 
      SET "email" = ${newEmail}, "passwordHash" = ${hash} 
      WHERE "role" = 'ADMIN'
    `;
    console.log("Admin credentials updated securely.");
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
