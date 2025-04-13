import sqlite3
import os
from dotenv import load_dotenv
from setup import setup_openai

def run_setup():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    sql_path = os.path.join(script_dir, "db_schema", "setup.sql")
    db_path = os.path.abspath(os.path.join(script_dir, "..", "backend", "data.db"))

    # Make sure the parent folder for data.db exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    with open(sql_path, "r") as f:
        sql = f.read()

    conn = sqlite3.connect(db_path)
    conn.executescript(sql)
    conn.commit()
    print(f"✅ Database schema initialized in {db_path}")


def main():
    run_setup()
    
    # Only run OpenAI setup if API key doesn't exist
    load_dotenv()
    if not os.getenv('OPENAI_API_KEY'):
        setup_openai()

if __name__ == "__main__":
    main()