const bcrypt = require("bcryptjs");
const { pool } = require("./config/db");

async function resetMultiplePasswords() {
  try {
    const users = [
      { email: "Kempanna8618@gmail.com", password: "admin123" },
      { email: "nivruttipatil8618@gmail.com", password: "dealer123" },
      { email: "Rahul8618@gmail.com", password: "driver123" }
    ];
    
    for (const user of users) {
      console.log(`Resetting password for ${user.email}...`);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      
      const [result] = await pool.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPassword, user.email]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ ${user.email} reset to: ${user.password}`);
      } else {
        console.log(`❌ ${user.email} not found.`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetMultiplePasswords();
