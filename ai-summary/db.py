import sqlite3
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.abspath(os.path.join(script_dir, "..", "backend", "data.db"))

def create_ai_summaries_table():
    query = """
    CREATE TABLE IF NOT EXISTS all_scores_ai_summaries (
        outcome_name TEXT PRIMARY KEY,
        outcome_id INTEGER,
        outcome_description TEXT,
        strengths_text TEXT,
        improvement_text TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    with sqlite3.connect(db_path) as conn:
        conn.execute(query)
        conn.commit()

def fetch_grouped_comments(limit=None):
    query = """
    SELECT outcome_name, GROUP_CONCAT(comment, '\n') as all_comments
    FROM all_scores
    WHERE comment IS NOT NULL
    GROUP BY outcome_name
    """
    if limit:
        query += f" LIMIT {limit}"
    with sqlite3.connect(db_path) as conn:
        return conn.execute(query).fetchall()

def fetch_outcome_metadata(outcome_name):
    query = """
    SELECT outcome_id, description
    FROM learning_outcomes
    WHERE name = ?
    """
    with sqlite3.connect(db_path) as conn:
        result = conn.execute(query, (outcome_name,)).fetchone()
        if result:
            return result[0], result[1]
        return None, None

def store_summary(outcome_name, outcome_id, outcome_description, strengths, improvement):
    with sqlite3.connect(db_path) as conn:
        c = conn.cursor()
        c.execute("SELECT outcome_name FROM all_scores_ai_summaries WHERE outcome_name=?", (outcome_name,))
        result = c.fetchone()
        if result:
            c.execute("""
                UPDATE all_scores_ai_summaries
                SET outcome_id=?, outcome_description=?, strengths_text=?, improvement_text=?, last_updated=CURRENT_TIMESTAMP
                WHERE outcome_name=?
            """, (outcome_id, outcome_description, strengths, improvement, outcome_name))
        else:
            c.execute("""
                INSERT INTO all_scores_ai_summaries (outcome_name, outcome_id, outcome_description, strengths_text, improvement_text)
                VALUES (?, ?, ?, ?, ?)
            """, (outcome_name, outcome_id, outcome_description, strengths, improvement))
        conn.commit()