from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def get_db_connection():
    # Get the absolute path to the database file
    db_path = os.path.join(os.path.dirname(__file__), 'data.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # First check if the view exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='view' AND name='assignment_scores'
        """)
        
        view_exists = cursor.fetchone()
        logger.debug(f"View exists: {view_exists is not None}")
        
        if not view_exists:
            logger.debug("Creating assignment_scores view...")
            cursor.execute("""
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
                LEFT JOIN learning_outcomes lo ON oa.outcome_id = lo.outcome_id
                LEFT JOIN assignments_data ad ON CAST(oa.assignment_id AS TEXT) = ad.assignment_id
                LEFT JOIN courses c ON lo.course_id = c.course_id
                LEFT JOIN terms t ON CAST(c.term_id AS TEXT) = t.term_id
            """)
            conn.commit()
            logger.debug("View created successfully")
        
        # Now query the view
        logger.debug("Querying assignment_scores view...")
        cursor.execute('''
            SELECT score, comment, outcome_name, assignment_title, 
                   course_title, course_code, term_title, created_on
            FROM assignment_scores
        ''')
        
        rows = cursor.fetchall()
        logger.debug(f"Found {len(rows)} rows in assignment_scores")
        
        if len(rows) == 0:
            # Debug query to check each table
            cursor.execute("SELECT COUNT(*) FROM outcome_assessments")
            oa_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM learning_outcomes")
            lo_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM assignments_data")
            ad_count = cursor.fetchone()[0]
            logger.debug(f"Table counts - OA: {oa_count}, LO: {lo_count}, AD: {ad_count}")
        
        feedback_data = [{
            'score': float(row['score']) if row['score'] is not None else 0.0,
            'comment': row['comment'] or "",
            'outcome_name': row['outcome_name'] or "",
            'assignment_title': row['assignment_title'] or "",
            'course_title': row['course_title'] or "",
            'course_code': row['course_code'] or "",
            'term_title': row['term_title'] or "",
            'created_on': row['created_on'] or ""
        } for row in rows]
        
        return jsonify(feedback_data)
        
    except sqlite3.OperationalError as e:
        logger.error(f"Database error: {e}")
        logger.exception("Full traceback:")
        return jsonify([])
    finally:
        conn.close()


@app.route('/api/summaries')
def get_summaries():
    outcome = request.args.get('outcome', 'Organization')
    conn = get_db_connection()
    summaries = conn.execute('''
        SELECT summary_text, outcome_name, last_updated 
        FROM outcome_summaries 
        WHERE outcome_name = ?
    ''', (outcome,)).fetchall()
    conn.close()
    return jsonify([{
        'summary_text': row['summary_text'],
        'outcome_name': row['outcome_name'],
        'last_updated': row['last_updated']
    } for row in summaries])


if __name__ == '__main__':
    app.run(debug=True, port=5001)
