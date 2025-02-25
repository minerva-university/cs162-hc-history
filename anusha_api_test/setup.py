import os
import subprocess

def create_env_file():
    """Prompt user for CSRF_TOKEN and SESSION_ID only if .env does not exist."""
    if os.path.exists(".env"):
        print(".env file already exists. Skipping input step.")
        return
    
    csrf_token = input("Enter your CSRF_TOKEN: ")
    session_id = input("Enter your SESSION_ID: ")

    with open(".env", "w") as env_file:
        env_file.write(f'CSRF_TOKEN="{csrf_token}"\n')
        env_file.write(f'SESSION_ID="{session_id}"\n')

    print(".env file created successfully.")

def main():
    # Install dependencies if requirements.txt exists
    if os.path.exists("requirements.txt"):
        print("Installing dependencies from requirements.txt...")
        subprocess.run(["pip", "install", "-r", "requirements.txt"])

    # Create .env file only if it does not exist
    create_env_file()

    # Run test_endpoints.py
    print("Running test_endpoints.py...")
    subprocess.run(["python3", "test_endpoints.py"])

if __name__ == "__main__":
    main()
