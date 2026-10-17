CREATE TABLE IF NOT EXISTS users (
  id         TEXT    PRIMARY KEY,
  email      TEXT    UNIQUE NOT NULL,
  name       TEXT,
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
