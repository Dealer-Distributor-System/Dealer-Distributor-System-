const bcrypt = require("bcryptjs");
const { pool } = require("./config/db");

async function resetPassword() {
  try {
    const email = "Kempanna8618@gmail.com";
    const newPassword = "admin123";
    
    console.log(`Resetting password for ${email}...`);
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ Password reset successfully!`);
      console.log(`Email: ${email}`);
      console.log(`New Password: ${newPassword}`);
    } else {
      console.log(`❌ User not found with email: ${email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to reset password:", error.message);
    process.exit(1);
  }
}

resetPassword();
