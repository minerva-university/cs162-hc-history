from flask import Flask, jsonify
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


@app.route('/')
def index():
    return "Backend is up and running! Use /api/feedback for feedback data."


@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Debug: Show available tables in the database
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    logger.debug(f"Available tables in database: {[table['name'] for table in tables]}")
    
    try:
        # Try to query the assignment_scores table first
        logger.debug("Attempting to query assignment_scores table")
        cursor.execute('''
            SELECT score, comment, outcome_name, assignment_title, 
            course_title, course_code, term_title, created_on
            FROM assignment_scores
        ''')
    except sqlite3.OperationalError as e:
        logger.debug(f"Error querying assignment_scores: {e}")
        # If that fails, try the feedback table
        logger.debug("Falling back to feedback table")
        cursor.execute('''
            SELECT score, comment, outcome_name, assignment_title, 
            course_title, course_code, term_title, created_on
            FROM feedback
        ''')
    
    rows = cursor.fetchall()
    logger.debug(f"Retrieved {len(rows)} rows from database")
    
    # Debug: Show first row structure if available
    if rows:
        first_row = dict(rows[0])
        logger.debug(f"First row structure: {first_row}")
    
    # Convert rows to list of dictionaries
    feedback_data = []
    for row in rows:
        # Handle potential None values safely
        score_value = row['score']
        if score_value is None:
            logger.debug(f"Found null score value in row: {dict(row)}")
            score = 0.0
        else:
            try:
                score = float(score_value)
            except (ValueError, TypeError) as e:
                logger.error(f"Error converting score '{score_value}' to float: {e}")
                score = 0.0
        
        feedback_data.append({
            'score': score,
            'comment': row['comment'] or "",
            'outcome_name': row['outcome_name'] or "",
            'assignment_title': row['assignment_title'] or "",
            'course_title': row['course_title'] or "",
            'course_code': row['course_code'] or "",
            'term_title': row['term_title'] or "",
            'created_on': row['created_on'] or ""
        })
    
    conn.close()
    return jsonify(feedback_data)


@app.route('/favicon.ico')
def favicon():
    return "", 204  # No content


if __name__ == '__main__':
    app.run(debug=True, port=5001)
