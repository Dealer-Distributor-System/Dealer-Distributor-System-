const { pool } = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const { q, role, status } = req.query;
    let sql = "SELECT id, name, email, role, is_active, created_at FROM users";
    const whereClauses = [];
    const params = [];

    if (q) {
      whereClauses.push("(name LIKE ? OR email LIKE ?)");
      const searchTerm = `%${q.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    if (role) {
      whereClauses.push("role = ?");
      params.push(role);
    }

    if (status !== undefined && status !== "") {
      whereClauses.push("is_active = ?");
      params.push(status === "active" ? 1 : 0);
    }

    if (whereClauses.length > 0) {
      sql += " WHERE " + whereClauses.join(" AND ");
    }

    sql += " ORDER BY created_at DESC";

    const [users] = await pool.query(sql, params);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Get all users error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTravellers = async (req, res) => {
  try {
    const [travellers] = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'traveller' AND is_active = 1"
    );
    return res.status(200).json({ success: true, data: travellers });
  } catch (error) {
    console.error("Get travellers error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE users SET is_active = 1 WHERE id = ?", [id]);
    return res.status(200).json({ success: true, message: "User activated successfully" });
  } catch (error) {
    console.error("Activate user error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE users SET is_active = 0 WHERE id = ?", [id]);
    return res.status(200).json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    console.error("Deactivate user error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // Security: Only user themselves or admin can update
    if (role !== 'admin' && userId != id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await pool.query(
      "UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?",
      [name, phone || null, id]
    );

    return res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getAllUsers, activateUser, deactivateUser, getTravellers, updateUserProfile };
