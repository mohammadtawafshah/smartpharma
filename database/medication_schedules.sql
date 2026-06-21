CREATE TABLE IF NOT EXISTS medication_schedules (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  item_type       ENUM('drug','herb') NOT NULL,
  drug_id         INT NULL,
  herb_id         INT NULL,
  item_name       VARCHAR(255) NOT NULL,
  reminder_times  JSON NOT NULL,
  frequency_days  INT NOT NULL DEFAULT 1,
  start_date      DATE NOT NULL,
  end_date        DATE NULL,
  notes           TEXT NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
