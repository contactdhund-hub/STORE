const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const newEmail = "contact.dhund@gmail.com";
    const newPassword = "Dhund!Admin$2026";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    // Insert an admin user since the database is empty
    const res = await sql`
      INSERT INTO "User" ("email", "passwordHash", "role", "updatedAt")
      VALUES (${newEmail}, ${hash}, 'ADMIN', NOW())
      ON CONFLICT ("email") DO UPDATE SET "passwordHash" = ${hash}, "role" = 'ADMIN'
    `;
    console.log("Admin credentials inserted securely.");
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
