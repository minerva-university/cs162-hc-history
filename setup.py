import subprocess
import os
import sys
import time
import platform

# Function to run a shell command and check for errors
def run_command(command):
    try:
        subprocess.run(command, check=True)
        print(f"✅ Successfully ran: {' '.join(command)}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error while running: {' '.join(command)}")
        print(e)
        sys.exit(1)

# Function to check if the 'data.db' file exists
def check_data_db():
    db_path = './pulling_data/data.db'
    if os.path.exists(db_path):
        print("✅ data.db file found.")
        return True
    else:
        print("❌ data.db not found.")
        return False

# Function to prompt the user for AI summary setup
def prompt_ai_summary():
    response = input("\n❓ Do you want to get an AI summary of your assignment feedback?\nThe process may take up to 10 minutes. You will need a paid OpenAI key. (yes/no): ").lower()
    return response in ['yes', 'y']

# Function to install dependencies and run AI setup scripts
def run_ai_setup():
    print("🚀 Running ai-summary/setup.py...")
    run_command(["python3", "ai-summary/setup.py", "--yes"])

    print("🚀 Initializing AI summary database...")
    run_command(["python3", "ai-summary/init_db.py"])

    print("🚀 Running AI summary script...")
    run_command(["python3", "ai-summary/ai_summary.py"])

# Function to run the backend
def run_backend():
    print("🚀 Starting backend...")
    # Run the backend in the same terminal (non-blocking)
    backend_process = subprocess.Popen(["python3", "pulling_data/app.py"])
    return backend_process

# Function to run the frontend in a new terminal window (cross-platform)
def run_frontend():
    print("🚀 Starting frontend in a new console window...")

    if platform.system() == "Windows":
        # On Windows, use 'start' to open a new console window
        subprocess.Popen("start cmd /K npm run dev", cwd=os.path.join(os.getcwd(), "frontend"), shell=True)
    elif platform.system() == "Darwin":  # macOS
        # On macOS, use 'osascript' to open a new terminal window
        subprocess.Popen(['osascript', '-e', 'tell application "Terminal" to do script "cd ' + os.path.join(os.getcwd(), "frontend") + ' && npm run dev"'])
    else:
        # On Linux, use 'gnome-terminal' to open a new terminal window (adjust for other terminal emulators if needed)
        subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', f'cd {os.path.join(os.getcwd(), "frontend")} && npm run dev; exec bash'])

# Main setup function
def main():
    # Step 0: Install dependencies
    if os.path.exists("requirements.txt"):
        print("📦 Installing dependencies from requirements.txt...")
        subprocess.run(["pip3", "install", "-r", "requirements.txt"])

    # Step 1: Run pulling_data/setup.py
    print("🚀 Running pulling_data/setup.py...")
    run_command(["python3", "pulling_data/setup.py"])

    # Step 2: Check if data.db file is created
    if not check_data_db():
        print("❌ Exiting setup due to missing data.db file.")
        sys.exit(1)

    # Step 3: Ask the user if they want to run the AI summary setup
    if prompt_ai_summary():
        # Step 4: Run AI summary setup if user agrees
        run_ai_setup()

    # Step 5: Run the backend (in the original terminal)
    backend_process = run_backend()

    # Step 6: Run the frontend (in a new terminal window)
    run_frontend()

    # Optional: Wait for the backend to finish if you need to ensure it continues running
    backend_process.wait()

if __name__ == "__main__":
    main()
