# ai_summary.py (FINAL UNIFIED VERSION with enhanced error handling and --group-limit support)
import os, sqlite3, time, argparse
from openai import OpenAI
from dotenv import load_dotenv

def main():
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("❌ OPENAI_API_KEY is missing from .env")
    client = OpenAI(api_key=api_key)

    parser = argparse.ArgumentParser(description="Generate AI summaries from assignment_scores view.")
    parser.add_argument("--mode", choices=["assignment_outcome", "outcome", "assignment"], default="assignment_outcome", help="Choose summarization mode.")
    parser.add_argument("--limit", type=int, default=None, help="Row limit for assignment_outcome mode.")
    parser.add_argument("--group-limit", type=int, default=None, help="Group limit for outcome/assignment modes.")
    parser.add_argument("--debug", action="store_true", help="Enable verbose debug logs.")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.abspath(os.path.join(script_dir, "..", "backend", "data.db"))


    try:
        if args.mode == "assignment_outcome":
            summarize_assignment_outcome(client, db_path, args.limit, args.debug)
        elif args.mode == "outcome":
            summarize_grouped(client, db_path, group_by="outcome_name", group_limit=args.group_limit, debug=args.debug)
        elif args.mode == "assignment":
            summarize_grouped(client, db_path, group_by="assignment_id", group_limit=args.group_limit, debug=args.debug)
    except Exception as e:
        print(f"❌ Unexpected error during summarization: {e}")

    print("\n✅ Summarization process complete.")

# -------------------------
# Assignment + Outcome Summary Mode
# -------------------------
def summarize_assignment_outcome(client, db_path, limit=None, debug=False):
    rows = fetch_assignment_scores(db_path, limit)
    if not rows:
        print("⚠️ No rows fetched from assignment_scores.")
        return
    for assignment_id, outcome_id, comment, course_title, outcome_name in rows:
        if not comment or len(comment.strip()) < 5:
            if debug: print(f"⚠️ Skipping short/empty comment for assignment_id={assignment_id}, outcome_id={outcome_id}")
            continue
        try:
            summary = generate_summary_assignment_outcome(client, comment, course_title, outcome_name, debug)
            store_assignment_outcome_summary(db_path, assignment_id, outcome_id, summary)
            time.sleep(1)
        except Exception as e:
            print(f"❌ Error for assignment_id={assignment_id}, outcome_id={outcome_id}: {e}")

def fetch_assignment_scores(db_path, limit=None):
    query = """
        SELECT assignment_id, outcome_id, comment, course_title, outcome_name
        FROM assignment_scores
        WHERE comment IS NOT NULL
    """
    if limit:
        query += f" LIMIT {limit}"
    try:
        with sqlite3.connect(db_path) as conn:
            return conn.execute(query).fetchall()
    except Exception as e:
        print(f"❌ DB error while fetching assignment_scores: {e}")
        return []

def generate_summary_assignment_outcome(client, comment, course_title, outcome_name, debug=False):
    messages = [
        {"role": "system", "content": "You are an AI that summarizes student feedback into key insights."},
        {"role": "user", "content": f"Feedback on outcome '{outcome_name}' in course '{course_title}':\n\"{comment}\"\nPlease provide a concise 3-sentence summary."}
    ]
    try:
        response = client.chat.completions.create(model="gpt-3.5-turbo", messages=messages, temperature=0.7, max_tokens=120)
        summary = response.choices[0].message.content.strip()
        if debug:
            print(f"🔹 [Assignment+Outcome] Summary: {summary[:60]}...")
        return summary
    except Exception as e:
        raise RuntimeError(f"OpenAI API error during assignment-outcome summary: {e}")

def store_assignment_outcome_summary(db_path, assignment_id, outcome_id, summary_text):
    try:
        with sqlite3.connect(db_path) as conn:
            c = conn.cursor()
            c.execute("SELECT summary_id FROM ai_summaries WHERE assignment_id=? AND outcome_id=?", (assignment_id, outcome_id))
            result = c.fetchone()
            if result:
                c.execute("UPDATE ai_summaries SET summary_text=?, last_updated=CURRENT_TIMESTAMP WHERE summary_id=?", (summary_text, result[0]))
            else:
                c.execute("INSERT INTO ai_summaries (assignment_id, outcome_id, summary_text) VALUES (?, ?, ?)", (assignment_id, outcome_id, summary_text))
            conn.commit()
    except Exception as e:
        print(f"❌ DB error while storing summary for assignment_id={assignment_id}, outcome_id={outcome_id}: {e}")

# -------------------------
# Grouped Summary (by Outcome or Assignment)
# -------------------------
def summarize_grouped(client, db_path, group_by, group_limit=None, debug=False):
    rows = fetch_grouped_comments(db_path, group_by, group_limit)
    if not rows:
        print(f"⚠️ No grouped rows found for {group_by}.")
        return
    print(f"📊 Processing {len(rows)} groups for: {group_by}")
    for label, all_comments in rows:
        if not all_comments or len(all_comments.strip()) < 5:
            if debug:
                print(f"⚠️ Skipped empty/insufficient group: {group_by}={label}")
            continue
        if len(all_comments) > 12000:
            print(f"⚠️ Context too large for {group_by}={label} ({len(all_comments)} chars). Skipping.")
            continue
        try:
            summary = generate_group_summary(client, label, all_comments, group_by, debug)
            store_group_summary(db_path, label, summary, group_by)
            time.sleep(1)
        except Exception as e:
            print(f"❌ Error summarizing {group_by}={label}: {e}")

def fetch_grouped_comments(db_path, group_by, limit=None):
    query = f"""
        SELECT {group_by}, GROUP_CONCAT(comment, '\n') as all_comments
        FROM assignment_scores
        WHERE comment IS NOT NULL
        GROUP BY {group_by}
    """
    if limit:
        query += f" LIMIT {limit}"
    try:
        with sqlite3.connect(db_path) as conn:
            return conn.execute(query).fetchall()
    except Exception as e:
        print(f"❌ DB error while fetching grouped comments for {group_by}: {e}")
        return []

def generate_group_summary(client, label, comments, group_by, debug=False):
    prompt_label = f"{group_by.replace('_', ' ').title()} '{label}'"
    messages = [
        {"role": "system", "content": "You summarize grouped student feedback into key insights."},
        {"role": "user", "content": f"Summarize feedback for {prompt_label}:\n\n{comments}\n\nHighlight key strengths, weaknesses, and themes in 4-5 sentences."}
    ]
    try:
        response = client.chat.completions.create(model="gpt-3.5-turbo", messages=messages, temperature=0.7, max_tokens=300)
        summary = response.choices[0].message.content.strip()
        if debug:
            print(f"🔹 [{group_by}] Summary for {str(label)[:30]}...: {summary[:60]}...")
        return summary
    except Exception as e:
        raise RuntimeError(f"OpenAI API error during grouped summary for {group_by}={label}: {e}")

def store_group_summary(db_path, label, summary_text, group_by):
    table = "outcome_summaries" if group_by == "outcome_name" else "assignment_summaries"
    column = "outcome_name" if group_by == "outcome_name" else "assignment_id"
    try:
        with sqlite3.connect(db_path) as conn:
            c = conn.cursor()
            c.execute(f"SELECT summary_id FROM {table} WHERE {column}=?", (label,))
            result = c.fetchone()
            if result:
                c.execute(f"UPDATE {table} SET summary_text=?, last_updated=CURRENT_TIMESTAMP WHERE summary_id=?", (summary_text, result[0]))
            else:
                c.execute(f"INSERT INTO {table} ({column}, summary_text) VALUES (?, ?)", (label, summary_text))
            conn.commit()
    except Exception as e:
        print(f"❌ DB error while storing grouped summary for {group_by}={label}: {e}")

if __name__ == "__main__":
    main()