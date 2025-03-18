import sqlite3
from setup import setup_openai

def run_setup():
    with open("db_schema/setup.sql", "r") as f:
        sql = f.read()
    db_path = "../pulling_data/data.db"
    conn = sqlite3.connect(db_path)
    conn.executescript(sql)
    conn.commit()
    print(f"✅ Database schema initialized in {db_path}")

def main():
    run_setup()
    setup_openai()

if __name__ == "__main__":
    main()