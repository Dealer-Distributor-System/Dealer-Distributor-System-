// controllers/travellerController.js

const { pool } = require("../config/db");

const getTravellers = async (req, res) => {
  try {
    const [travellers] = await pool.query(
      `SELECT u.id, u.name, u.email, IFNULL(t.current_status, 'available') as current_status 
       FROM users u 
       LEFT JOIN travellers t ON u.id = t.user_id 
       WHERE u.role = 'traveller' AND u.is_active = 1`
    );
    return res.status(200).json({ success: true, data: travellers });
  } catch (error) {
    console.error("Error fetching travellers:", error.message);
    return res.status(500).json({ success: false, message: "Server error while fetching travellers" });
  }
};

module.exports = { getTravellers };
