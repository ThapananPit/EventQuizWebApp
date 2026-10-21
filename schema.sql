CREATE TABLE IF NOT EXISTS users (
  id         TEXT    PRIMARY KEY,
  email      TEXT    UNIQUE NOT NULL,
  name       TEXT,
  school     TEXT,
  age        INTEGER,
  referral   TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS scores (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT    NOT NULL REFERENCES users(id),
  path_id         TEXT    NOT NULL,
  score           INTEGER NOT NULL,
  ending          TEXT,
  users_remaining INTEGER,
  created_at      INTEGER DEFAULT (unixepoch())
);

-- Run these once on existing deployments (D1 dashboard or wrangler d1 execute):
-- ALTER TABLE users ADD COLUMN school TEXT;
-- ALTER TABLE users ADD COLUMN age INTEGER;
-- ALTER TABLE users ADD COLUMN referral TEXT;
