const { pool } = require("../config/db");

let tableReadyPromise;

const ensureFeedbackTable = async () => {
  if (!tableReadyPromise) {
    tableReadyPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS order_feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL UNIQUE,
        dealer_id INT NOT NULL,
        rating TINYINT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
      )
    `);
  }

  await tableReadyPromise;
};

const getFeedbackByOrderId = async (orderId) => {
  await ensureFeedbackTable();

  const [rows] = await pool.query(
    `SELECT id, order_id, dealer_id, rating, description, created_at, updated_at
     FROM order_feedback
     WHERE order_id = ?`,
    [orderId]
  );

  return rows[0] || null;
};

const createFeedback = async ({ orderId, dealerId, rating, description }) => {
  await ensureFeedbackTable();

  await pool.query(
    `INSERT INTO order_feedback (order_id, dealer_id, rating, description)
     VALUES (?, ?, ?, ?)`,
    [orderId, dealerId, rating, description || null]
  );

  return getFeedbackByOrderId(orderId);
};

module.exports = {
  ensureFeedbackTable,
  getFeedbackByOrderId,
  createFeedback,
};
