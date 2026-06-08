-- ============================================================
--  SmartPharma Guide — Add Admin User
--  Import this in phpMyAdmin → smartpharma database
-- ============================================================

USE smartpharma;

-- ============================================================
-- Update users table to support admin roles
-- ============================================================
ALTER TABLE users
  MODIFY COLUMN role ENUM('user','admin','content_admin','super_admin') NOT NULL DEFAULT 'user';

-- ============================================================
-- SUPER ADMIN — Full permissions (add/edit/delete everything)
-- Email:    superadmin@smartpharma.com
-- Password: SmartAdmin@2025
-- ============================================================
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'superadmin@smartpharma.com',
  '$2y$12$vqZCLgos4BW7j639bKp1z.bplN3v.KCB4AG.eX1ngtsYYyRIw.HDK',
  'Super Administrator',
  'super_admin',
  1
)
ON DUPLICATE KEY UPDATE
  password_hash = '$2y$12$vqZCLgos4BW7j639bKp1z.bplN3v.KCB4AG.eX1ngtsYYyRIw.HDK',
  role = 'super_admin',
  full_name = 'Super Administrator';

-- ============================================================
-- CONTENT ADMIN — Can add/edit drugs, herbs, articles
-- Email:    content@smartpharma.com
-- Password: Content@2025
-- ============================================================
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'content@smartpharma.com',
  '$2y$12$t5yamrHIwV7hrLk8.TN1DuhTw7tYHpPOsiogfYoyqkAfhjtuBMCeG',
  'Content Administrator',
  'content_admin',
  1
)
ON DUPLICATE KEY UPDATE
  password_hash = '$2y$12$t5yamrHIwV7hrLk8.TN1DuhTw7tYHpPOsiogfYoyqkAfhjtuBMCeG',
  role = 'content_admin',
  full_name = 'Content Administrator';

-- ============================================================
-- DONE!
-- ┌─────────────────────────────────┬──────────────────────┬──────────────────┐
-- │ Email                           │ Password             │ Role             │
-- ├─────────────────────────────────┼──────────────────────┼──────────────────┤
-- │ superadmin@smartpharma.com      │ SmartAdmin@2025      │ Super Admin      │
-- │ content@smartpharma.com         │ Content@2025         │ Content Admin    │
-- │ admin@smartpharma.com           │ Admin1234            │ Admin (existing) │
-- └─────────────────────────────────┴──────────────────────┴──────────────────┘
-- PERMISSIONS:
-- super_admin  → Full CRUD: drugs, herbs, articles, users, categories, settings
-- content_admin→ CRUD: drugs, herbs, articles only (no user management)
-- admin        → Same as content_admin
-- ============================================================
