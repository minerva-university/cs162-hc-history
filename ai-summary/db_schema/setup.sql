-- setup.sql: Creates all required tables

-- Table 1: Assignment + Outcome summaries (default mode)
CREATE TABLE IF NOT EXISTS ai_summaries (
    summary_id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id TEXT NOT NULL,
    outcome_id INTEGER NOT NULL,
    summary_text TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments_data(assignment_id),
    FOREIGN KEY (outcome_id) REFERENCES learning_outcomes(outcome_id)
);

-- Table 2: Grouped by Assignment ID
CREATE TABLE IF NOT EXISTS assignment_summaries (
    summary_id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id TEXT NOT NULL UNIQUE,
    summary_text TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Grouped by Outcome Name
CREATE TABLE IF NOT EXISTS outcome_summaries (
    summary_id INTEGER PRIMARY KEY AUTOINCREMENT,
    outcome_name TEXT NOT NULL UNIQUE,
    summary_text TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);