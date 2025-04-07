import os
import subprocess
from dotenv import load_dotenv

def setup_openai():
    if os.path.exists("requirements.txt"):
        print("📦 Installing dependencies from requirements.txt...")
        subprocess.run(["pip3", "install", "-r", "requirements.txt"])
    else:
        print("📂 No requirements.txt found. Skipping dependency installation.")

    """Setup OpenAI API key configuration"""
    print("\nAI Summarization Setup")
    print("=====================")
    
    want_ai = input("\nDo you want to enable AI summarization? (yes/no): ").lower().strip()
    
    if want_ai in ['yes', 'y']:
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
    setup_openai() 