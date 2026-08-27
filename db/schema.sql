CREATE TABLE IF NOT EXISTS volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id VARCHAR(20) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  age_group ENUM('15-21', '21-30', '30 Above') NOT NULL,
  gender ENUM('Male', 'Female', 'Third Choice'),
  church_name VARCHAR(255) NOT NULL,
  pastor_name VARCHAR(255) NOT NULL,
  church_location VARCHAR(255) NOT NULL,
  volunteer_role ENUM(
    'Registration', 'Ushers', 'Parking', 'Security', 'Hospitality',
    'Prayers & Counselling', 'Production', 'Media', 'Stage',
    'Medical', 'Logistics', 'Leadership'
  ) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_volunteers_role (volunteer_role),
  INDEX idx_volunteers_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS registration_counters (
  registration_type VARCHAR(32) NOT NULL,
  registration_year SMALLINT UNSIGNED NOT NULL,
  next_number INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (registration_type, registration_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS registration_ids (
  registration_id VARCHAR(20) PRIMARY KEY,
  registration_type VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_registration_ids_type (registration_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  area VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  registration_type VARCHAR(32) NOT NULL DEFAULT 'event_attendee',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_registrations_email (email),
  INDEX idx_event_registrations_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(32) NOT NULL,
  provider_order_id VARCHAR(64) NOT NULL UNIQUE,
  provider_payment_id VARCHAR(64) UNIQUE,
  status ENUM('verified') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_donations_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
