import os
import argparse
import time
from dotenv import load_dotenv
import openai
from pathlib import Path
import json
import sys
from typing import Dict, List, Optional, Tuple

from db import create_ai_summaries_table, fetch_grouped_comments, fetch_outcome_metadata, store_summary
from generate import generate_summary_parts

# Get the absolute path to the directory containing this script
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, '.env')

# Load environment variables from .env file
load_dotenv(env_path)

# Check if OpenAI API key exists, if not prompt user
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    if os.environ.get('CI'):
        # In CI environment, use a dummy key
        api_key = 'dummy-key-for-testing'
    else:
        # In local environment, prompt for key
        print("🔑 OpenAI API key not found in .env file.")
        api_key = input("Please enter your OpenAI API key: ").strip()
        # Save the key to .env file
        with open(env_path, 'a') as f:
            f.write(f"\nOPENAI_API_KEY={api_key}\n")
        print("✅ OpenAI API key saved to .env file for future use.")

openai.api_key = api_key
# Define client as the openai module
client = openai

def main():
    parser = argparse.ArgumentParser(description="Generate AI summaries grouped by outcome_name from all_scores.")
    parser.add_argument("--limit", type=int, default=None, help="Optional limit on the number of outcomes to summarize.")
    args = parser.parse_args()

    print("🚀 Creating AI summaries table...")
    create_ai_summaries_table()

    print("🚀 Fetching comments grouped by outcome_name...")
    rows = fetch_grouped_comments(args.limit)
    if not rows:
        print("⚠️ No rows found in all_scores.")
        return

    print(f"📊 Generating summaries for {len(rows)} outcomes...")

    for outcome_name, all_comments in rows:
        if not all_comments or len(all_comments.strip()) < 5:
            print(f"⚠️ Skipping empty group: {outcome_name}")
            continue
        if len(all_comments) > 12000:
            print(f"⚠️ Skipping {outcome_name} due to too large context ({len(all_comments)} chars).")
            continue

        outcome_id, outcome_description = fetch_outcome_metadata(outcome_name)

        try:
            strengths, improvement = generate_summary_parts(client, outcome_name, outcome_description, all_comments)
            store_summary(outcome_name, outcome_id, outcome_description, strengths, improvement)
            print(f"✅ Saved summary for: {outcome_name}")
            time.sleep(1)
        except Exception as e:
            print(f"❌ Error for {outcome_name}: {e}")

    print("\n🎉 AI Summarization Process Complete.")

if __name__ == "__main__":
    main()