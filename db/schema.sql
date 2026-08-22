CREATE TABLE IF NOT EXISTS volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
