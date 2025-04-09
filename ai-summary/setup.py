import os
import subprocess
import sys
from dotenv import load_dotenv

load_dotenv()  # Load existing .env variables if available

def setup_openai(auto_accept=False):
    print("\nAI Summarization Setup")
    print("=====================")

    if auto_accept:
        want_ai = "yes"
    else:
        want_ai = input("\nDo you want to enable AI summarization? (yes/no): ").lower().strip()

    if want_ai in ['yes', 'y']:
        existing_key = os.getenv("OPENAI_API_KEY")
        if existing_key:
            print("\nFound existing OpenAI API key. Skipping setup.")
            return True

        print("\nTo use AI summarization, you'll need an OpenAI API key.")
        print("If you don't have one, visit: https://platform.openai.com/api-keys")

        api_key = input("\nPlease enter your OpenAI API key: ").strip()

        # Write to .env file
        with open('.env', 'a') as f:
            f.write(f"\nOPENAI_API_KEY={api_key}")

        print("\nOpenAI API key has been saved to .env file!")
        return True

    print("\nSkipping AI summarization setup.")
    return False

if __name__ == "__main__":
    auto_accept = "--yes" in sys.argv
    setup_openai(auto_accept=auto_accept)
