DROP VIEW IF EXISTS assignment_scores;

CREATE VIEW assignment_scores AS 
SELECT 
    oa.assessment_id AS assessment_id, 
    oa.score AS score,
    oa.comment AS comment,
    lo.name AS outcome_name, 
    lo.outcome_id AS outcome_id, 
    ad.assignment_title AS assignment_title, 
    ad.assignment_id AS assignment_id, 
    ad.section_id AS section_id,
    c.course_title AS course_title, 
    c.course_code AS course_code,
    co.college_code AS college_code,
    co.college_name AS college_name,
    c.college_id AS college_id,  
    t.term_title AS term_title,
    c.term_id AS term_id, 
    c.state AS course_state,
    oa.created_on AS created_on
FROM outcome_assessments oa
JOIN assignments_data ad ON oa.assignment_id = ad.assignment_id
JOIN learning_outcomes lo ON oa.outcome_id = lo.outcome_id
JOIN courses c ON lo.course_id = c.course_id
JOIN terms t ON c.term_id = t.term_id
JOIN colleges co on c.college_id = co.college_id
WHERE oa.type = 'assignment';

DROP VIEW IF EXISTS all_scores;

CREATE VIEW all_scores AS 
SELECT 
    oa.assessment_id AS assessment_id, 
    oa.score AS score,
    oa.comment AS comment,
    lo.name AS outcome_name, 
    lo.outcome_id AS outcome_id, 
    oa.type AS type,
    ad.section_id AS section_id,
    c.course_id AS course_id,
    oa.class_id AS class_id,
    CASE 
        WHEN oa.type = 'assignment' THEN ad.assignment_title
        ELSE oa.type
    END AS assignment_title,
    oa.assignment_id AS assignment_id, 
    c.course_title AS course_title, 
    c.course_code AS course_code,
    co.college_code AS college_code,
    co.college_name AS college_name,
    c.college_id AS college_id,  
    t.term_title AS term_title,
    c.term_id AS term_id, 
    c.state AS course_state,
    oa.created_on AS created_on,
    CASE 
        WHEN oa.type = 'assignment' THEN 
            'https://forum.minerva.edu/app/assignments/' || oa.assignment_id
        WHEN ad.section_id IS NOT NULL THEN 
            'https://forum.minerva.edu/app/courses/' || c.course_id || 
            '/sections/' || ad.section_id || 
            '/classes/' || oa.class_id 
    ELSE NULL
    END AS assignment_link,
    CASE 
        WHEN oa.type = 'assignment' THEN ad.weight
        ELSE '1x'
    END AS weight
FROM outcome_assessments oa
JOIN learning_outcomes lo ON oa.outcome_id = lo.outcome_id
JOIN courses c ON lo.course_id = c.course_id
JOIN terms t ON c.term_id = t.term_id
JOIN colleges co ON c.college_id = co.college_id
LEFT JOIN assignments_data ad ON oa.assignment_id = ad.assignment_id;