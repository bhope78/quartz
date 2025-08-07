-- schema.sql
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,                       -- ISO timestamp
  url TEXT NOT NULL,
  referrer TEXT,
  ua TEXT,                                -- user-agent
  ip TEXT,                                -- requester IP (be mindful of privacy/law)
  country TEXT,
  method TEXT,
  meta TEXT                               -- JSON string for extra props
);