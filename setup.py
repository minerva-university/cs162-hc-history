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
    db_path = './backend/data.db'
    if os.path.exists(db_path):
        print("✅ data.db file found.")
        return True
    else:
        print("❌ data.db not found.")
        return False

# Function to prompt the user for AI summary generation
def prompt_ai_summary():
    response = input("\n❓ Do you want to generate AI summaries for your assignment feedback?\nThis may take a few minutes and will use your OpenAI key. (yes/no): ").lower()
    return response in ['yes', 'y']

# Function to run AI summary generation
def run_ai_setup():
    print("🚀 Running AI summary generation...")
    run_command(["python3", "ai-summary/main.py"])

# Function to run the backend
def run_backend():
    print("🚀 Starting backend...")
    backend_process = subprocess.Popen(["python3", "backend/app.py"])
    return backend_process

# Function to run the frontend in a new terminal window
def run_frontend():
    print("🚀 Starting frontend setup...")

    frontend_path = os.path.join(os.getcwd(), "frontend")
    
    # First, clean previous builds and node_modules
    print("🧹 Cleaning previous builds...")
    if os.path.exists(os.path.join(frontend_path, '.next')):
        run_command(['rm', '-rf', os.path.join(frontend_path, '.next')])
    if os.path.exists(os.path.join(frontend_path, 'node_modules')):
        run_command(['rm', '-rf', os.path.join(frontend_path, 'node_modules')])

    # Then do a fresh install and build
    print("📦 Installing dependencies and building...")
    run_command(['npm', 'install', '--prefix', frontend_path])
    run_command(['npm', 'run', 'build', '--prefix', frontend_path])

    print("🚀 Starting production server in a new console window...")
    launch_command = f"cd {frontend_path} && npm start"

    system = platform.system()
    if system == "Darwin":  # macOS
        subprocess.Popen([
            'osascript', '-e',
            f'tell application "Terminal" to do script "{launch_command}"'
        ])
    elif system == "Windows":
        subprocess.Popen(
            f'start cmd /K "{launch_command}"',
            cwd=frontend_path,
            shell=True
        )
    else:  # Linux
        subprocess.Popen([
            'gnome-terminal', '--', 'bash', '-c',
            f'{launch_command}; exec bash'
        ])

# Main setup function
def main():
    # Step 0: Install dependencies
    if os.path.exists("requirements.txt"):
        print("📦 Installing dependencies from requirements.txt...")
        subprocess.run(["pip3", "install", "-r", "requirements.txt"])

    # Step 1: Run backend/scrape.py
    print("🚀 Running backend/scrape.py...")
    run_command(["python3", "backend/scrape.py"])

    # Step 2: Check if data.db exists
    if not check_data_db():
        print("❌ Exiting setup due to missing data.db file.")
        sys.exit(1)

    # Step 3: Prompt for AI summary generation
    if prompt_ai_summary():
        run_ai_setup()

    # Step 4: Run backend
    backend_process = run_backend()

    # Step 5: Run frontend
    run_frontend()

    backend_process.wait()

if __name__ == "__main__":
    main()