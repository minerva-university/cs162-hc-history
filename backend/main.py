import sqlite3
import requests
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env
def load_env_variables():
    load_dotenv()
    CSRF_TOKEN = os.getenv("CSRF_TOKEN")
    SESSION_ID = os.getenv("SESSION_ID")
    BASE_URL = "https://forum.minerva.edu/api/v1/"

    if not CSRF_TOKEN or not SESSION_ID:
        raise EnvironmentError("❌ Missing CSRF_TOKEN or SESSION_ID in your .env file.")


    return CSRF_TOKEN, SESSION_ID, BASE_URL

# Headers for authentication
def get_headers(CSRF_TOKEN, SESSION_ID):
    return {
        "Cookie": f"csrftoken={CSRF_TOKEN}; sessionid={SESSION_ID}",
        "X-Csrftoken": CSRF_TOKEN,
    }

# Initialize database using schema.sql
def initialize_database(db_name, schema_file):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    with open(schema_file, "r") as f:
        schema_script = f.read()
    
    cursor.executescript(schema_script)  # Execute schema.sql
    
    conn.commit()
    conn.close()
    print(f"✅ Database {db_name} initialized.")

# Fetch data from endpoint and handle response
def fetch_data_from_api(url, headers):
    print(f"🔄 Please wait, fetching data from {url}...")
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        print("✅ Data fetched successfully.")
        return response.json()
    else:
        print(f"❌ Error fetching from {url}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def assert_data_fetched(name, data):
    if not data:
        raise RuntimeError(f"❌ Failed to fetch '{name}' from Forum")

# Insert outcome assessments into the database
def insert_outcome_assessments(cursor, outcome_data):
    for outcome in outcome_data:
        assessment_id = outcome.get("id")
        assignment_id = outcome.get("assignment-id")
        comment = outcome.get("comment")
        created_on = outcome.get("created-on")
        graded_blindly = outcome.get("graded-blindly")
        grader_user_id = outcome.get("grader-user-id")
        outcome_id = outcome.get("learning-outcome") 
        score = outcome.get("score")
        outcome_type = outcome.get("type")
        assignment_group_id = outcome.get("target-assignment-group-id")
        user_id = outcome.get("target-user-id")

        cursor.execute("""
        INSERT OR IGNORE INTO outcome_assessments 
        (assessment_id, assignment_id, comment, created_on, graded_blindly, grader_user_id, outcome_id, score, type, assignment_group_id, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (assessment_id, assignment_id, comment, created_on, graded_blindly, grader_user_id, outcome_id, score, outcome_type, assignment_group_id, user_id))

    print("✅ Outcome assessment data inserted.")

# Insert courses into the database
def insert_courses(cursor, lo_trees):
    for lo_tree in lo_trees:
        course_info = lo_tree.get("course", {})
        if course_info:
            course_id = course_info.get("id") 
            course_title = course_info.get("title")
            course_code = course_info.get("course-code")
            course_term = course_info.get("term") 
            course_state = course_info.get("state")
            course_college = course_info.get("college")
                
            cursor.execute("""
            INSERT OR IGNORE INTO courses (course_id, course_title, course_code, college_id, term_id, state)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (course_id, course_title, course_code, course_college, course_term, course_state))

    print("✅ Courses data inserted.")

# Insert learning outcomes into the database
def insert_learning_outcomes(cursor, lo_trees):
    for lo_tree in lo_trees:
        for obj in lo_tree.get("course-objectives", []):
            for lo in obj.get("learning-outcomes", []):
                lo_id = lo.get("id") 
                lo_desc = lo.get("description")
                lo_name = lo.get("name")
                course_id = lo.get("course-id") 

                cursor.execute("""
                INSERT OR IGNORE INTO learning_outcomes (outcome_id, description, name, course_id)
                VALUES (?, ?, ?, ?)
                """, (lo_id, lo_desc, lo_name, course_id))

    print("✅ Learning outcomes data inserted.")

# Insert terms into the database
def insert_terms(cursor, terms):
    for term in terms:
        term_id = term.get("id")  
        term_title = term.get("title")

        cursor.execute("""
        INSERT OR IGNORE INTO terms (term_id, term_title)
        VALUES (?, ?)
        """, (term_id, term_title))

    print("✅ Terms data inserted.")

def insert_colleges(cursor, colleges):
    if isinstance(colleges, list):
        for college in colleges:
            college_id = college.get("id")
            college_code = college.get("code")
            college_name = college.get("name")

            # Insert into the colleges table
            cursor.execute("""
            INSERT OR IGNORE INTO colleges (college_id, college_code, college_name)
            VALUES (?, ?, ?)
            """, (college_id, college_code, college_name))
    print("✅ Colleges data inserted.")

# Insert assignment data into the database
def insert_assignment_data(cursor, assignment_data):
    if isinstance(assignment_data, dict):
        assignment_id = assignment_data.get("id")
        section_id = assignment_data.get("section-id")
        section_title = assignment_data.get("section-title")
        assignment_title = assignment_data.get("title")
        weight = assignment_data.get("weight")
        makeup_assignment = assignment_data.get("makeup-assignment")

        # Skip the assignment if assignment_id is None
        if assignment_id is None:
            return False
        
        if isinstance(makeup_assignment, dict):
            makeup_assignment = json.dumps(makeup_assignment)

        cursor.execute("""
        INSERT OR IGNORE INTO assignments_data (assignment_id, section_id, section_title, assignment_title, weight, makeup_assignment)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (assignment_id, section_id, section_title, assignment_title, weight, makeup_assignment))

        return True
    return False

# Fetch assignment ids from the database
def get_assignment_ids(db_name):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute("SELECT assignment_id FROM outcome_assessments")
    assignment_ids = [row[0] for row in cursor.fetchall()]
    conn.close()
    if not assignment_ids:
        print("⚠️ No assignment IDs found in outcome_assessments. Skipping assignment processing.")

    print(f"✅ Retrieved {len(assignment_ids)} assignment scores.")
    return assignment_ids

# Process assignment data for each assignment ID
def process_assignments(BASE_URL, headers, db_name, assignment_ids):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    assignments_added = 0  # Counter for successfully inserted assignments
    processed_assignment_ids = set()  # Set to track processed assignment_ids

    for idx, assignment_id in enumerate(assignment_ids):
        # Skip if assignment_id has already been processed
        if assignment_id in processed_assignment_ids:
            continue
        
        # Mark this assignment_id as processed
        processed_assignment_ids.add(assignment_id)

        # Fetch and insert data for the current assignment_id
        assignment_data = fetch_assignment_data(BASE_URL, headers, assignment_id)
        
        if assignment_data:
            if insert_assignment_data(cursor, assignment_data):
                assignments_added += 1

        if idx % 15 == 0:
            print(f"🔄 Processed {idx}/{len(assignment_ids)} assignment scores...")

    conn.commit()
    conn.close()
    print(f"✅ {assignments_added} assignments successfully stored.")

# Fetch data from assignments endpoint for a given assignment_id
def fetch_assignment_data(BASE_URL, headers, assignment_id):
    url = f"{BASE_URL}assignments/{assignment_id}/nested_for_grader"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        try:
            return response.json()  # Try to parse the response as JSON
        except ValueError:
            return None
    else:
        return None

def fetch_outcome_index_items(BASE_URL, headers, term_id, outcome_type="lo"):
    url = f"{BASE_URL}outcome-index-items?termId={term_id}&outcomeType={outcome_type}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Failed to fetch outcome index items: {response.status_code} - {response.text}")
        return []

def insert_course_scores_per_term(BASE_URL, headers, db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all unique term_ids from the courses table
    cursor.execute("SELECT DISTINCT term_id FROM courses WHERE term_id IS NOT NULL")
    term_ids = [row[0] for row in cursor.fetchall()]

    for term_id in term_ids:
        print(f"🔄 Fetching course scores for term {term_id}...")
        try:
            scores = fetch_outcome_index_items(BASE_URL, headers, term_id=term_id)

            if not scores:
                print(f"⚠️ No data found for term {term_id}")
                continue

            for item in scores:
                if "course" in item:
                    course_id = item["course"]
                    # Use get() to safely handle missing 'mean' key
                    score = item.get("mean")
                    if score is not None:
                        cursor.execute("""
                            INSERT OR REPLACE INTO course_scores (course_id, term_id, score)
                            VALUES (?, ?, ?)
                        """, (course_id, term_id, score))

            print(f"✅ Stored course scores for term {term_id}")
            conn.commit()  # Commit after each term
        except Exception as e:
            print(f"⚠️ Error processing term {term_id}: {str(e)}")
            continue  # Continue with next term even if current one fails

    conn.close()
    print("✅ Completed storing course scores")

def create_views(db_path, sql_file):
    """Executes the SQL script to create the two views."""
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        with open(sql_file, "r") as f:
            sql_script = f.read()
        cursor.executescript(sql_script)
        print("✅ Scores tables created successfully!")

# Main function to tie everything together
def main():
    # Load environment variables
    CSRF_TOKEN, SESSION_ID, BASE_URL = load_env_variables()
    
    # Set up headers for API requests
    headers = get_headers(CSRF_TOKEN, SESSION_ID)
    
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Initialize the database
    # Absolute paths for DB and schema files
    DB_NAME = os.path.join(script_dir, "data.db")
    SCHEMA_FILE = os.path.join(script_dir, "schema.sql")
    initialize_database(DB_NAME, SCHEMA_FILE)
    
    # Fetch data from APIs and handle errors
    lo_trees = fetch_data_from_api(f"{BASE_URL}lo-trees", headers)
    assert_data_fetched("lo-trees", lo_trees)

    terms = fetch_data_from_api(f"{BASE_URL}terms", headers)
    assert_data_fetched("terms", terms)

    outcomes = fetch_data_from_api(f"{BASE_URL}outcome-assessments", headers)
    assert_data_fetched("outcome-assessments", outcomes)

    colleges = fetch_data_from_api(f"{BASE_URL}colleges", headers)
    assert_data_fetched("colleges", colleges)

    if not lo_trees or not terms or not outcomes or not colleges:
        print("❌ No data returned from the API.")
        return  # Exit if no data is returned from the API
    
    # Insert data into the database
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    insert_outcome_assessments(cursor, outcomes)
    insert_courses(cursor, lo_trees)

    # Commit and close so the scores function can re-open fresh
    conn.commit()
    conn.close()

    # Insert course scores based on newly inserted course data
    insert_course_scores_per_term(BASE_URL, headers, DB_NAME)

    # Reopen for learning outcomes and rest of workflow
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    insert_learning_outcomes(cursor, lo_trees)

    insert_terms(cursor, terms)
    insert_colleges(cursor, colleges)

    # Commit and close connection
    conn.commit()
    conn.close()

    # Insert data into the database again, since assignments needs access to the data
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Fetch assignment ids from the database
    assignment_ids = get_assignment_ids(DB_NAME)
    if not assignment_ids:
        return  # Exit if no assignment IDs are found

    # Process assignments
    process_assignments(BASE_URL, headers, DB_NAME, assignment_ids)

    # Commit and close connection
    conn.commit()
    conn.close()

    # Create the views
    VIEWS_FILE = os.path.join(script_dir, "views.sql")
    create_views(DB_NAME, VIEWS_FILE)

    print("✅ Data successfully stored in database")

# Execute the main function
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Unexpected error during setup: {e}")
