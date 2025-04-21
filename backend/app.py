from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import sqlite3
import os
import logging
import csv
import io
from datetime import datetime

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
    
    # Debug: Show available tables in the database
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    logger.debug(f"Available tables in database: {[table['name'] for table in tables]}")
    
    try:
        # Query the all_scores view
        logger.debug("Attempting to query all_scores view")
        cursor.execute('''
            SELECT score, weight, comment, outcome_name, assignment_title, 
                   course_title, course_code, term_title, created_on, forum_link
            FROM all_scores
        ''')
    except sqlite3.OperationalError as e:
        logger.debug(f"Error querying all_scores: {e}")
        return jsonify([])  # Return empty list on failure
    
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
        weight_str = row['weight'] or "1x"  # fallback if None

        # Parse numeric weight
        weight_raw = row['weight']
        try:
            # Convert to string first in case it's an int/float
            weight_numeric = float(str(weight_raw).replace('x', '')) if weight_raw is not None else 1.0
        except (ValueError, TypeError, AttributeError) as e:
            weight_numeric = weight_raw

        # Parse score safely
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
            'weight': weight_str,          # keep original (e.g., "8x")
            'weight_numeric': weight_numeric,  # new numeric field (e.g., 8.0)
            'comment': row['comment'] or "",
            'outcome_name': row['outcome_name'] or "",
            'assignment_title': row['assignment_title'] or "",
            'course_title': row['course_title'] or "",
            'course_code': row['course_code'] or "",
            'term_title': row['term_title'] or "",
            'created_on': row['created_on'] or "",
            'forum_link': row['forum_link'] or ""

        })


    conn.close()
    return jsonify(feedback_data)

@app.route('/api/course-scores', methods=['GET'])
def get_course_scores():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Join course_scores with courses to get course_code
        cursor.execute("""
            SELECT c.course_code, cs.score
            FROM course_scores cs
            JOIN courses c ON cs.course_id = c.course_id
        """)
        rows = cursor.fetchall()

        course_scores = [
            {
                "course_code": row["course_code"],
                "course_score": row["score"]
            }
            for row in rows
        ]
        return jsonify(course_scores)

    except sqlite3.Error as e:
        logger.error(f"❌ Error fetching course scores: {e}")
        return jsonify([]), 500

    finally:
        conn.close()


@app.route('/api/export', methods=['GET'])
def export_data():
    # Get filter parameters
    hc = request.args.get('hc', '')
    course = request.args.get('course', '')
    term = request.args.get('term', '')
    min_score = float(request.args.get('minScore', 0))
    max_score = float(request.args.get('maxScore', 5))
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Base query
        query = '''
            SELECT score, weight, comment, outcome_name, assignment_title, 
                   course_title, course_code, term_title, created_on, forum_link
            FROM all_scores
            WHERE 1=1
        '''
        params = []
        
        # Add filters if provided
        if hc:
            query += ' AND outcome_name = ?'
            params.append(hc)
        
        if course:
            query += ' AND course_code = ?'
            params.append(course)
            
        if term:
            query += ' AND term_title = ?'
            params.append(term)
            
        if min_score > 0:
            query += ' AND score >= ?'
            params.append(min_score)
            
        if max_score < 5:
            query += ' AND score <= ?'
            params.append(max_score)
        
        # Execute the query with parameters
        logger.debug(f"Exporting filtered data with query: {query} and params: {params}")
        cursor.execute(query, params)
    except sqlite3.OperationalError as e:
        logger.debug(f"Error querying all_scores: {e}")
        rows = []
    
    rows = cursor.fetchall()
    logger.debug(f"Retrieved {len(rows)} rows for filtered export")
    
    # Create a CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Outcome Name', 'Score', 'Comment', 'Weight', 'Assignment Title',
        'Course Code', 'Course Title', 'Term Title', 'Forum Link'
    ])

    
    # Write data rows
    for row in rows:
        writer.writerow([
            row['outcome_name'] or "",
            row['score'],
            row['comment'] or "",
            row['weight'],
            row['assignment_title'] or "",
            row['course_code'] or "",
            row['course_title'] or "",
            row['term_title'] or "",
            row['forum_link'] or ""

        ])
    
    # Prepare the response
    output.seek(0)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"filtered_scores_{timestamp}.csv"
    
    conn.close()
    
    # Return the CSV file
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=filename
    )


@app.route('/api/export-all', methods=['GET'])
def export_all_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Query the all_scores view without any filters
        logger.debug("Exporting all data from all_scores view")
        cursor.execute('''
            SELECT score, weight, comment, outcome_name, assignment_title, 
                   course_title, course_code, term_title, created_on, forum_link
            FROM all_scores
        ''')
    except sqlite3.OperationalError as e:
        logger.debug(f"Error querying all_scores: {e}")
        rows = []
    
    rows = cursor.fetchall()
    logger.debug(f"Retrieved {len(rows)} rows for full export")
    
    # Create a CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Score', 'Weight', 'Comment', 'Outcome Name', 'Assignment Title', 
                     'Course Title', 'Course Code', 'Term Title', 'Created On', 'Forum Link'])
    
    # Write data rows
    for row in rows:
        writer.writerow([
            row['score'],
            row['weight'],
            row['comment'] or "",
            row['outcome_name'] or "",
            row['assignment_title'] or "",
            row['course_title'] or "",
            row['course_code'] or "",
            row['term_title'] or "",
            row['created_on'] or "",
            row['forum_link'] or ""
        ])
    
    # Prepare the response
    output.seek(0)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"all_scores_{timestamp}.csv"
    
    conn.close()
    
    # Return the CSV file
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=filename
    )

@app.route('/api/ai-summaries', methods=['GET'])
def get_ai_summaries():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT outcome_name, outcome_id, outcome_description,
                   strengths_text, improvement_text, last_updated
            FROM all_scores_ai_summaries
        ''')
        
        summaries = cursor.fetchall()
        return jsonify([{
            'outcome_name': row['outcome_name'],
            'outcome_id': row['outcome_id'],
            'outcome_description': row['outcome_description'],
            'strengths_text': row['strengths_text'],
            'improvement_text': row['improvement_text'],
            'last_updated': row['last_updated']
        } for row in summaries])
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify([])
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
