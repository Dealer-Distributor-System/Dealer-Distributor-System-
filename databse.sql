-- ============================================================
-- PRINCE PIPING SYSTEM — FINAL DATABASE SCHEMA
-- ============================================================

-- Reset DB
DROP DATABASE IF EXISTS prince_piping_db;
CREATE DATABASE prince_piping_db;
USE prince_piping_db;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('admin','dealer','traveller') NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

-- ============================================================
-- DEALERS
-- ============================================================
CREATE TABLE dealers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL UNIQUE,
    dealer_code     VARCHAR(20) NOT NULL UNIQUE,
    business_name   VARCHAR(150) NOT NULL,
    region          VARCHAR(100),
    address         TEXT,
    gst_number      VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TRAVELLERS
-- ============================================================
CREATE TABLE travellers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL UNIQUE,
    vehicle_type    VARCHAR(50),
    vehicle_number  VARCHAR(20),
    current_status  ENUM('available','on_delivery','off_duty') DEFAULT 'available',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT NOT NULL,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    specifications  TEXT,
    price           DECIMAL(10,2) NOT NULL,
    stock           INT DEFAULT 0,
    image_url       VARCHAR(255),
    is_available    BOOLEAN DEFAULT TRUE,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL,

    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    dealer_id       INT NOT NULL,
    order_number    VARCHAR(30) NOT NULL UNIQUE,
    total_amount    DECIMAL(12,2) DEFAULT 0.00,
    delivery_type   ENUM('pickup', 'delivery') DEFAULT 'pickup',
    delivery_cost   DECIMAL(10,2) DEFAULT 0.00,

    status ENUM(
        'pending','confirmed','rejected',
        'assigned','picked_up','in_transit',
        'delivered','cancelled','failed'
    ) DEFAULT 'pending',

    delivery_address TEXT,
    notes TEXT,
    approved_by INT,
    approved_at DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (dealer_id) REFERENCES dealers(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2),

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================
-- ORDER FEEDBACK
-- ============================================================
CREATE TABLE order_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    dealer_id INT NOT NULL,
    rating TINYINT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

-- ============================================================
-- ENQUIRIES
-- ============================================================
CREATE TABLE enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dealer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    message TEXT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    replied_by INT,
    reply TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (dealer_id) REFERENCES dealers(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (replied_by) REFERENCES users(id)
);

-- ============================================================
-- DELIVERIES
-- ============================================================
CREATE TABLE deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    traveller_id INT,
    assigned_by INT,

    status ENUM(
        'unassigned','assigned',
        'picked_up','in_transit',
        'delivered','failed'
    ) DEFAULT 'unassigned',

    pickup_address TEXT,
    delivery_address TEXT,
    estimated_delivery DATE,
    actual_delivery DATETIME,
    notes TEXT,
    assigned_at DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (traveller_id) REFERENCES users(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- ============================================================
-- DELIVERY TRACKING
-- ============================================================
CREATE TABLE delivery_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL,
    updated_by INT NOT NULL,
    status VARCHAR(100),
    location VARCHAR(255),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,

    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);


CREATE TABLE payments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL UNIQUE,
    dealer_id       INT NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    payment_method  ENUM('upi','bank_transfer','cash','cheque','razorpay') NOT NULL,
    transaction_id  VARCHAR(100),
    payment_proof   VARCHAR(255),      -- file path / URL of uploaded screenshot
    status          ENUM('pending','verified','rejected') DEFAULT 'pending',
    verified_by     INT,               -- admin user id who verified
    verified_at     DATETIME,
    remarks         TEXT,              -- admin can add a note on rejection
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL,

    FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (dealer_id)    REFERENCES dealers(id),
    FOREIGN KEY (verified_by)  REFERENCES users(id)
);



ALTER TABLE orders ADD COLUMN payment_status 
  ENUM('unpaid','paid','verified') DEFAULT 'unpaid' 
  AFTER total_amount;
-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO categories (name, description) VALUES
('Pipes','All pipe types'),
('Fittings','Pipe fittings'),
('Drainage','Drain systems'),
('Borewell','Borewell products'),
('Valves','All valves');

INSERT INTO users (name,email,password,phone,role,is_active)
VALUES ('Admin','admin@pipes.com','$2b$10$TdIqm/YgtoFODaJgGHWzZORYo0v8Z0KMWteDJ.WfTAa.ecDDb.BFe','9999999999','admin',TRUE);

select * from users;
INSERT INTO users (name,email,password,phone,role,is_active)
VALUES ('Dealer User','dealer@pipes.com','$2b$10$TdIqm/YgtoFODaJgGHWzZORYo0v8Z0KMWteDJ.WfTAa.ecDDb.BFe','8888888888','dealer',TRUE);

INSERT INTO dealers (user_id, dealer_code, business_name, region, address, gst_number)
VALUES (2, 'DLR-001', 'ABC Traders', 'Coimbatore', 'Tamil Nadu', 'GST12345');

INSERT INTO users (name,email,password,phone,role,is_active)
VALUES ('Demo Traveller','traveller@pipes.com','$2b$10$TdIqm/YgtoFODaJgGHWzZORYo0v8Z0KMWteDJ.WfTAa.ecDDb.BFe','7777777777','traveller',TRUE);
INSERT INTO travellers (user_id, vehicle_type, vehicle_number)
VALUES (3, 'Truck', 'TN-38-AB-1234');



-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_orders_dealer ON orders(dealer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_feedback_dealer ON order_feedback(dealer_id);
CREATE INDEX idx_delivery_traveller ON deliveries(traveller_id);
CREATE INDEX idx_enquiry_dealer ON enquiries(dealer_id);

UPDATE users 
SET is_active = TRUE 
WHERE email = 'kadabikempu603@gmail.com';

UPDATE users 
SET is_active = TRUE 
WHERE email = 'nivruttipatil8618@gmail.com';

INSERT INTO products (
    category_id,
    name,
    description,
    specifications,
    price,
    stock,
    image_url,
    is_available
) VALUES (
    1,
    'UPVC Pipe',
    'High quality pipe for plumbing',
    'Sizes: 20mm-160mm',
    1200.00,
    100,
    'https://example.com/pipe.jpg',
    TRUE
);

select * from users;

select * from products;
select * from deliveries;
