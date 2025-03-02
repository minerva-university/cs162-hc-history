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
    code TEXT NOT NULL, 
    college INTEGER, 
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

CREATE TABLE IF NOT EXISTS assignments_data (
    assignment_id TEXT PRIMARY KEY,
    section_id TEXT,
    section_title TEXT,
    assignment_title TEXT,
    weight INTEGER,
    makeup_assignment TEXT,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
