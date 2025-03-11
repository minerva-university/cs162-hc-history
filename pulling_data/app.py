from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Allow frontend access

def get_data(query):
    conn = sqlite3.connect("data.db")
    cursor = conn.cursor()
    cursor.execute(query)
    data = cursor.fetchall()
    conn.close()
    return data

@app.route('/grades', methods=['GET'])
def get_grades():
    query = """
    SELECT 
        assessment_id, 
        assignment_title, 
        course_title, 
        outcome_name, 
        COALESCE(score, 'Not Graded') AS score,  -- Replace NULL scores with "Not Graded"
        comment, 
        term_title, 
        created_on
    FROM assignment_scores
    WHERE assignment_id IS NOT NULL
    """
    data = get_data(query)

    # Debugging: Print API response to check structure
    print("API Response:", data)

    return jsonify(data)

@app.route('/api/hc/score-frequency/<hc_id>', methods=['GET'])
def get_hc_score_frequency(hc_id):
    """Get the frequency of each score across all assignments for a specific HC."""
    conn = sqlite3.connect('data.db')
    cursor = conn.cursor()
    
    # Query to get score frequencies for the specified HC
    # Adjust the table and column names to match your schema
    query = """
    SELECT score, COUNT(*) as frequency
    FROM assignments
    WHERE hc_id = ?
    GROUP BY score
    ORDER BY score
    """
    
    try:
        cursor.execute(query, (hc_id,))
        results = cursor.fetchall()
        
        # Format the results
        frequencies = [{"score": row[0], "frequency": row[1]} for row in results]
        
        conn.close()
        return jsonify({"frequencies": frequencies})
    
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/api/score-frequency', methods=['GET'])
def get_overall_score_frequency():
    """Get the frequency of each score across ALL assignments"""
    conn = sqlite3.connect('data.db')
    cursor = conn.cursor()
    
    # Query to get score frequencies across all assignments
    query = """
    SELECT score, COUNT(*) as frequency
    FROM assignments
    GROUP BY score
    ORDER BY score
    """
    
    try:
        cursor.execute(query)
        results = cursor.fetchall()
        
        # Format the results
        frequencies = [{"score": row[0], "frequency": row[1]} for row in results]
        
        conn.close()
        return jsonify({"frequencies": frequencies})
    
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
