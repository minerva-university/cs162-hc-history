DROP VIEW IF EXISTS assignment_scores;

CREATE VIEW assignment_scores AS 
SELECT 
    oa.assessment_id AS assessment_id, 
    oa.comment AS comment,
    oa.score AS score,
    lo.name AS outcome_name, 
    lo.outcome_id AS outcome_id, 
    ad.assignment_title AS assignment_title, 
    ad.assignment_id AS assignment_id, 
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
