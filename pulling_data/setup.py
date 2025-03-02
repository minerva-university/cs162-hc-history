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
    print("You can edit your CSRF_TOKEN and SESSION_ID in the .env file if necessary.")

def main():
    # Install dependencies if requirements.txt exists
    if os.path.exists("requirements.txt"):
        print("Installing dependencies from requirements.txt...")
        subprocess.run(["pip3", "install", "-r", "requirements.txt"])

    # Create .env file only if it does not exist
    create_env_file()

    # Run main.py
    print("Running main.py...")
    subprocess.run(["python3", "main.py"])

    # Run db_visualizer.py
    print("\nYou can now run db_visualizer.py to view tables from your database.")
    print("To run it, simply use the following command at any time:")
    print('python3 db_visualizer.py')
    print('\nHere is an example:')

    subprocess.run(["python3", "db_visualizer.py"])

if __name__ == "__main__":
    main()
