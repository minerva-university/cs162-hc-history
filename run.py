import subprocess
import os
import sys
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

# Function to check that the necessary files exist
def check_required_files():
    missing = []

    required_paths = [
        "./backend/data.db",
        "./backend/app.py",
        "./ai-summary/main.py",
        "./ai-summary/db.py",
        "./ai-summary/generate.py",
        "./frontend",
        ".env"
    ]

    for path in required_paths:
        if not os.path.exists(path):
            missing.append(path)

    if missing:
        print("❌ The following required files or folders are missing:")
        for m in missing:
            print(f"   - {m}")
        sys.exit(1)
    else:
        print("✅ All required files found.")

# Function to run the backend
def run_backend():
    print("🚀 Starting backend...")
    return subprocess.Popen(["python3", "backend/app.py"])

# Function to run the frontend in a new terminal window
def run_frontend():
    print("🚀 Starting frontend in a new console window...")

    frontend_path = os.path.join(os.getcwd(), "frontend")
    next_path = os.path.join(frontend_path, ".next")

    # Run build steps if .next is missing
    if not os.path.exists(next_path):
        print("🧱 .next/ folder not found. Running build steps...")
        run_command(["npm", "install"], cwd=frontend_path)
        run_command(["npm", "run", "build"], cwd=frontend_path)
    else:
        print("✅ Frontend already built.")

    # Launch frontend dev server in new terminal
    if platform.system() == "Windows":
        subprocess.Popen("start cmd /K npm run dev", cwd=frontend_path, shell=True)
    elif platform.system() == "Darwin":
        subprocess.Popen([
            'osascript', '-e',
            f'tell application "Terminal" to do script "cd {frontend_path} && npm run dev"'
        ])
    else:
        subprocess.Popen([
            'gnome-terminal', '--', 'bash', '-c',
            f'cd {frontend_path} && npm run dev; exec bash'
        ])

def main():
    # Step 1: Check for all required files
    check_required_files()

    # Step 2: Launch backend
    backend_process = run_backend()

    # Step 3: Launch frontend
    run_frontend()

    # Step 4: Keep backend running
    backend_process.wait()

if __name__ == "__main__":
    main()
