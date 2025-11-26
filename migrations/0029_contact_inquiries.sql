-- Contact Inquiries Table for Cloudflare D1
-- Stores user inquiries with multi-language support and spam protection

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Inquiry Details  
  category TEXT NOT NULL DEFAULT 'general',  -- general, support, feedback, business, press, other
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- User Context
  user_id INTEGER,  -- Optional: link to registered user
  language TEXT DEFAULT 'ja',  -- Language used when submitting
  
  -- Status Management
  status TEXT DEFAULT 'new',  -- new, read, in_progress, replied, closed, spam
  priority TEXT DEFAULT 'normal',  -- low, normal, high, urgent
  
  -- Admin Notes
  admin_notes TEXT,
  assigned_to INTEGER,  -- Admin user ID
  
  -- Spam Protection
  ip_address TEXT,
  user_agent TEXT,
  honeypot_triggered INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  replied_at DATETIME,
  closed_at DATETIME,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_category ON contact_inquiries(category);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_priority ON contact_inquiries(priority);

-- Contact Inquiry Replies Table
CREATE TABLE IF NOT EXISTS contact_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_internal INTEGER DEFAULT 0,  -- Internal note vs sent to user
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (inquiry_id) REFERENCES contact_inquiries(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_replies_inquiry ON contact_replies(inquiry_id);

-- Rate Limiting Table for Spam Protection
CREATE TABLE IF NOT EXISTS contact_rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT NOT NULL,  -- IP address or email
  identifier_type TEXT NOT NULL,  -- 'ip' or 'email'
  count INTEGER DEFAULT 1,
  window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(identifier, identifier_type)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON contact_rate_limits(identifier, identifier_type);
