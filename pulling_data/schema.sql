CREATE TABLE IF NOT EXISTS outcome_assessments (
    assessment_id INTEGER PRIMARY KEY,
    assignment_id INTEGER,
    comment TEXT,
    created_on TEXT,
    graded_blindly BOOLEAN,
    grader_user_id INTEGER,
    outcome_id INTEGER,
    score REAL,
    type TEXT,
    target_assignment_group_id INTEGER,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the courses table
CREATE TABLE IF NOT EXISTS courses (
    course_id INTEGER PRIMARY KEY, 
    course_title TEXT NOT NULL, 
    course_code TEXT NOT NULL, 
    college_id INTEGER, 
    term_id INTEGER, 
    state TEXT,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the learning_outcomes table
CREATE TABLE IF NOT EXISTS learning_outcomes (
    outcome_id INTEGER PRIMARY KEY,
    course_id INTEGER,  -- Links to courses table
    description TEXT NOT NULL,
    name TEXT NOT NULL,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- Schema for terms table
CREATE TABLE IF NOT EXISTS terms (
    term_id TEXT PRIMARY KEY,
    term_title TEXT,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colleges (
    college_id INTEGER PRIMARY KEY,
    college_code TEXT NOT NULL,
    college_name TEXT NOT NULL,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments_data (
    assignment_id TEXT PRIMARY KEY,
    section_id TEXT,
    section_title TEXT,
    assignment_title TEXT,
    weight INTEGER,
    makeup_assignment TEXT,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outcome_summaries (
    summary_id INTEGER PRIMARY KEY AUTOINCREMENT,
    outcome_name TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add this view to combine outcome_assessments with other tables
CREATE VIEW IF NOT EXISTS assignment_scores AS
SELECT 
    oa.assessment_id,
    oa.assignment_id,
    oa.score,
    oa.comment,
    lo.name as outcome_name,
    ad.assignment_title,
    c.course_title,
    c.course_code,
    t.term_title,
    oa.created_on
FROM outcome_assessments oa
JOIN learning_outcomes lo ON oa.outcome_id = lo.outcome_id
JOIN assignments_data ad ON oa.assignment_id = ad.assignment_id
JOIN courses c ON lo.course_id = c.course_id
JOIN terms t ON c.term_id = t.term_id;
