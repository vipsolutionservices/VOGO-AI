-- ============================================================================
-- VOGO CHATBOT - COMPLETE DATABASE SCHEMA
-- Phase B: MySQL Database Layer (Production-Ready)
-- ============================================================================

-- Drop existing database if exists (for clean installation)
DROP DATABASE IF EXISTS vogo_chatbot;
CREATE DATABASE vogo_chatbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vogo_chatbot;

-- ============================================================================
-- TABLE 1: NLP_MODEL
-- Stores NLP rules (keywords, regex, intents) - replaces nlp-database.json
-- ============================================================================
CREATE TABLE nlp_model (
    id INT PRIMARY KEY AUTO_INCREMENT,
    language VARCHAR(5) NOT NULL COMMENT 'Language code: en, ro, it, fr, de',
    intent VARCHAR(50) NOT NULL COMMENT 'Intent name: shopping_list_add, agenda_add, etc.',
    keywords TEXT COMMENT 'Comma-separated keywords',
    regex_pattern TEXT COMMENT 'Regular expression pattern',
    response TEXT COMMENT 'Default response text',
    priority INT DEFAULT 10 COMMENT 'Rule priority (higher = checked first)',
    active BOOLEAN DEFAULT TRUE COMMENT 'Whether rule is active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_language (language),
    INDEX idx_intent (intent),
    INDEX idx_active (active),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='NLP rules and patterns';

-- ============================================================================
-- TABLE 2: USERS
-- Stores user information and subscription levels
-- ============================================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscription_level ENUM('standard', 'vip', 'premium') DEFAULT 'standard',
    preferred_language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_subscription (subscription_level),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User accounts and subscription levels';

-- ============================================================================
-- TABLE 3: SESSIONS
-- Tracks user sessions and JWT tokens
-- ============================================================================
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_token VARCHAR(512) NOT NULL,
    jwt_token TEXT COMMENT 'Stored JWT for API calls',
    jwt_expires_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Active user sessions';

-- ============================================================================
-- TABLE 4: CONVERSATIONS
-- Logs all conversations for analytics and debugging
-- ============================================================================
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_id INT,
    message_text TEXT NOT NULL,
    detected_language VARCHAR(5),
    detected_intent VARCHAR(50),
    confidence_score DECIMAL(5,4) COMMENT 'NLP confidence 0.0000 to 1.0000',
    detection_method ENUM('regex', 'keyword', 'nlp', 'fallback') NOT NULL,
    response_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_intent (detected_intent),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Conversation logs and analytics';

-- ============================================================================
-- TABLE 5: SHOPPING_LISTS
-- Stores user shopping list items (Phase B: Local storage, Phase C: API sync)
-- ============================================================================
CREATE TABLE shopping_lists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    is_done BOOLEAN DEFAULT FALSE,
    api_synced BOOLEAN DEFAULT FALSE COMMENT 'Whether synced with remote API',
    remote_item_id INT NULL COMMENT 'ID from remote API after sync',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_done (is_done),
    INDEX idx_api_synced (api_synced)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User shopping lists';

-- ============================================================================
-- TABLE 6: AGENDA_ITEMS
-- Stores user calendar/agenda items (Phase B: Local storage, Phase C: API sync)
-- ============================================================================
CREATE TABLE agenda_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_datetime DATETIME NULL,
    location VARCHAR(255) NULL,
    participants TEXT NULL COMMENT 'Comma-separated participant names',
    notes TEXT,
    is_done BOOLEAN DEFAULT FALSE,
    api_synced BOOLEAN DEFAULT FALSE COMMENT 'Whether synced with remote API',
    remote_event_id INT NULL COMMENT 'ID from remote API after sync',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_event_datetime (event_datetime),
    INDEX idx_is_done (is_done),
    INDEX idx_api_synced (api_synced)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User calendar and agenda';

-- ============================================================================
-- TABLE 7: PRODUCT_CACHE
-- Caches product search results (Phase B: Local mock, Phase C: API cache)
-- ============================================================================
CREATE TABLE product_cache (
    id INT PRIMARY KEY AUTO_INCREMENT,
    search_term VARCHAR(255) NOT NULL,
    location VARCHAR(255) NULL,
    product_type VARCHAR(50) NULL,
    product_title VARCHAR(255) NOT NULL,
    product_link VARCHAR(512) NOT NULL,
    category VARCHAR(100) NULL,
    price DECIMAL(10,2) NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    api_synced BOOLEAN DEFAULT FALSE,
    cache_expires_at TIMESTAMP NULL COMMENT 'When this cache entry expires',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_search_term (search_term),
    INDEX idx_location (location),
    INDEX idx_cache_expires (cache_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cached product search results';

-- ============================================================================
-- TABLE 8: PREDEFINED_QA_CACHE
-- Caches predefined questions from API (reduces API calls)
-- ============================================================================
CREATE TABLE predefined_qa_cache (
    id INT PRIMARY KEY AUTO_INCREMENT,
    qa_id INT NOT NULL COMMENT 'Original ID from API',
    parent_id INT NULL COMMENT 'Parent question ID (for hierarchical questions)',
    question_text TEXT NOT NULL,
    html_text TEXT NULL,
    link VARCHAR(512) NULL,
    position INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    question_type VARCHAR(50) DEFAULT 'label',
    cache_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_qa_id (qa_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cached predefined questions and answers';

-- ============================================================================
-- TABLE 9: API_LOGS
-- Logs all API calls for debugging and monitoring
-- ============================================================================
CREATE TABLE api_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    endpoint VARCHAR(255) NOT NULL,
    http_method ENUM('GET', 'POST', 'PUT', 'DELETE') NOT NULL,
    request_body TEXT NULL,
    response_status INT NULL,
    response_body TEXT NULL,
    response_time_ms INT NULL COMMENT 'Response time in milliseconds',
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_endpoint (endpoint),
    INDEX idx_status (response_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='API call logs';

-- ============================================================================
-- TABLE 10: SYSTEM_CONFIG
-- Stores system configuration (replaces chatbot.ini)
-- ============================================================================
CREATE TABLE system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    is_encrypted BOOLEAN DEFAULT FALSE,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='System configuration settings';

-- ============================================================================
-- INSERT SEED DATA
-- ============================================================================

-- Insert default demo user
INSERT INTO users (username, email, subscription_level, preferred_language) VALUES
('demo_user', 'demo@vogo.family', 'standard', 'en'),
('vip_user', 'vip@vogo.family', 'vip', 'en');

-- Insert NLP rules (migrated from nlp-database.json)
INSERT INTO nlp_model (language, intent, keywords, regex_pattern, response, priority, active) VALUES
-- English rules
('en', 'shopping_list_add', 'shopping list,add to list,save to list,add to cart,buy,purchase', '^.*(add|save|put|buy|purchase|need|get|grab).*(shopping\\s*list|cart|list|groceries|store).*$', 'I''ll add that to your shopping list.', 10, TRUE),
('en', 'shopping_list_show', 'show shopping list,view list,my list,what''s in my cart', '^.*(show|view|display|see|what|check).*(shopping\\s*list|cart|list|groceries).*$', 'Here''s your shopping list.', 10, TRUE),
('en', 'agenda_add', 'calendar,agenda,remind me,schedule,appointment,meeting,i will go,i''m going', '^.*(add|remind|schedule|i will|i''m going|going to).*(calendar|agenda|meeting|tomorrow|today|evening).*$', 'I''ll add that to your calendar.', 10, TRUE),
('en', 'agenda_show', 'show calendar,my agenda,my schedule,what''s on my calendar', '^.*(show|view|display|see|what|check).*(calendar|agenda|schedule|appointments).*$', 'Here''s your agenda.', 10, TRUE),
('en', 'search_product', 'find,search,looking for,i''m looking,where can i find', '^.*(find|search|looking\\s*for|need|want).*(product|item|food).*$', 'Let me search for that.', 8, TRUE),
('en', 'greeting', 'hello,hi,hey,good morning,good evening', '^(hello|hi|hey|good\\s*(morning|evening|afternoon)).*$', 'Hello! How can I help you today?', 5, TRUE),
('en', 'thanks', 'thank you,thanks,appreciate', '^.*(thank|thanks|appreciate).*$', 'You''re welcome! Is there anything else I can help you with?', 5, TRUE),

-- Romanian rules
('ro', 'shopping_list_add', 'lista de cumparaturi,adauga in lista,vreau', '^.*(adauga|adaugă|pune|cumpar).*(lista|cumpărături).*$', 'Voi adăuga asta în lista ta de cumpărături.', 10, TRUE),
('ro', 'shopping_list_show', 'arata lista,vezi lista,lista mea', '^.*(arata|arată|vezi|ce).*(lista|cumpărături).*$', 'Iată lista ta de cumpărături.', 10, TRUE),
('ro', 'agenda_add', 'calendar,agenda,aminteste-mi,programeaza', '^.*(adauga|aminteste|programeaza).*(calendar|agenda|intalnire).*$', 'Voi adăuga asta în calendarul tău.', 10, TRUE),
('ro', 'greeting', 'salut,buna,bună ziua', '^(salut|buna|bună|hey).*$', 'Bună! Cu ce te pot ajuta astăzi?', 5, TRUE);

-- Insert system configuration
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('API_BASE_URL', 'https://test07.vogo.family/wp-json/vogo/v1', 'string', 'Base URL for API endpoints'),
('DEFAULT_LANGUAGE', 'en', 'string', 'Default language for chatbot'),
('JWT_EXPIRY_DAYS', '7', 'number', 'JWT token expiry in days'),
('ENABLE_API_CALLS', 'false', 'boolean', 'Enable real API calls (false = demo mode)'),
('OPENAI_ENABLED', 'false', 'boolean', 'Enable OpenAI for VIP users'),
('DEBUG_MODE', 'true', 'boolean', 'Enable debug logging');

-- Insert mock product data for demo
INSERT INTO product_cache (search_term, location, product_title, product_link, category, price, in_stock) VALUES
('pizza', 'Brașov', 'Blat bio pentru pizza fara gluten', 'https://test07.vogo.family/product/blat-bio-pentru-pizza-fara-gluten/', 'Food', 15.99, TRUE),
('pizza', 'Brașov', 'Ulei pentru pizza si paste cu chili si roșii', 'https://test07.vogo.family/product/ulei-pentru-pizza/', 'Food', 24.50, TRUE),
('milk', NULL, 'Organic Milk', 'https://test07.vogo.family/product/milk/', 'Dairy', 3.99, TRUE),
('bread', NULL, 'Whole Wheat Bread', 'https://test07.vogo.family/product/bread/', 'Bakery', 2.49, TRUE),
('burger', NULL, 'Veggie Burger', 'https://test07.vogo.family/product/burger/', 'Frozen', 6.99, TRUE);

-- ============================================================================
-- USEFUL VIEWS FOR QUERIES
-- ============================================================================

-- View: Active shopping lists by user
CREATE VIEW v_active_shopping_lists AS
SELECT 
    sl.id,
    sl.user_id,
    u.username,
    sl.item_name,
    sl.quantity,
    sl.is_done,
    sl.created_at
FROM shopping_lists sl
JOIN users u ON sl.user_id = u.id
WHERE sl.is_done = FALSE
ORDER BY sl.created_at DESC;

-- View: Upcoming agenda items
CREATE VIEW v_upcoming_agenda AS
SELECT 
    a.id,
    a.user_id,
    u.username,
    a.event_name,
    a.event_datetime,
    a.location,
    a.is_done,
    a.created_at
FROM agenda_items a
JOIN users u ON a.user_id = u.id
WHERE a.is_done = FALSE
  AND (a.event_datetime IS NULL OR a.event_datetime >= NOW())
ORDER BY a.event_datetime ASC;

-- View: Recent conversations
CREATE VIEW v_recent_conversations AS
SELECT 
    c.id,
    c.user_id,
    u.username,
    c.message_text,
    c.detected_intent,
    c.confidence_score,
    c.detection_method,
    c.created_at
FROM conversations c
LEFT JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC
LIMIT 100;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Add shopping list item
DELIMITER //
CREATE PROCEDURE sp_add_shopping_item(
    IN p_user_id INT,
    IN p_item_name VARCHAR(255),
    IN p_quantity INT
)
BEGIN
    INSERT INTO shopping_lists (user_id, item_name, quantity)
    VALUES (p_user_id, p_item_name, p_quantity);
    
    SELECT id, item_name, quantity, created_at
    FROM shopping_lists
    WHERE id = LAST_INSERT_ID();
END //

-- Procedure: Add agenda item
DELIMITER //
CREATE PROCEDURE sp_add_agenda_item(
    IN p_user_id INT,
    IN p_event_name VARCHAR(255),
    IN p_event_datetime DATETIME,
    IN p_location VARCHAR(255),
    IN p_participants TEXT
)
BEGIN
    INSERT INTO agenda_items (user_id, event_name, event_datetime, location, participants)
    VALUES (p_user_id, p_event_name, p_event_datetime, p_location, p_participants);
    
    SELECT id, event_name, event_datetime, location, created_at
    FROM agenda_items
    WHERE id = LAST_INSERT_ID();
END //

-- Procedure: Search products
DELIMITER //
CREATE PROCEDURE sp_search_products(
    IN p_search_term VARCHAR(255),
    IN p_location VARCHAR(255)
)
BEGIN
    SELECT 
        id,
        product_title,
        product_link,
        category,
        price,
        in_stock
    FROM product_cache
    WHERE search_term LIKE CONCAT('%', p_search_term, '%')
      AND (p_location IS NULL OR location = p_location)
      AND (cache_expires_at IS NULL OR cache_expires_at > NOW())
    ORDER BY created_at DESC;
END //

DELIMITER ;

-- ============================================================================
-- DATABASE STATISTICS
-- ============================================================================
SELECT 
    '✅ Database created successfully!' as status,
    DATABASE() as database_name,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()) as total_tables,
    (SELECT COUNT(*) FROM nlp_model) as nlp_rules,
    (SELECT COUNT(*) FROM users) as users_created,
    (SELECT COUNT(*) FROM product_cache) as products_cached;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================