import os
import subprocess
import browser_cookie3

def create_env_file(csrf_token, session_id):
    """Create the .env file if it doesn't exist with CSRF_TOKEN and SESSION_ID."""
    if os.path.exists(".env"):
        print(".env file already exists. Skipping input step.")
        return

    with open(".env", "w") as env_file:
        env_file.write(f'CSRF_TOKEN="{csrf_token}"\n')
        env_file.write(f'SESSION_ID="{session_id}"\n')

    print("✅ .env file created successfully.")
    print("You can edit your CSRF_TOKEN and SESSION_ID in the .env file if necessary.")

def get_csrf_and_sessionid():
    """Automate the process of retrieving CSRF token and Session ID from Chrome."""
    print("Do you use a Mac and Google Chrome for Forum? (yes/no)")
    use_chrome = input().strip().lower()

    if use_chrome != 'yes':
        print("Unfortunately, we cannot access your information automatically.")
        print("Please manually pull your CSRF_TOKEN and SESSION_ID from your browser's developer tools.")
        return None, None

    print("Are you logged into Forum right now? (yes/no)")
    logged_in = input().strip().lower()

    if logged_in != 'yes':
        print("Please log into Forum in Google Chrome and try again.")
        return None, None

    print("You may need to enter your Macbook password twice.")

    try:
        # Try to get cookies from Chrome
        cookies = browser_cookie3.chrome(domain_name='forum.minerva.edu')

        # Extract CSRF Token and Session ID
        csrf_token = next((cookie.value for cookie in cookies if cookie.name == 'csrftoken'), None)
        session_id = next((cookie.value for cookie in cookies if cookie.name == 'sessionid'), None)

        if csrf_token and session_id:
            print("Success!")
            print(f"CSRF Token: {csrf_token}")
            print(f"Session ID: {session_id}")
            return csrf_token, session_id
        else:
            print("We were unable to access your information.")
            print("Please manually pull your CSRF_TOKEN and SESSION_ID from your browser's developer tools.")
            return None, None
    except Exception as e:
        print("An error occurred while trying to access your information.")
        print(f"Error: {e}")
        print("Please manually pull your CSRF_TOKEN and SESSION_ID from your browser's developer tools.")
        return None, None

def main():
    # Get CSRF Token and Session ID automatically
    csrf_token, session_id = get_csrf_and_sessionid()

    if csrf_token and session_id:
        # Install dependencies if requirements.txt exists
        if os.path.exists("requirements.txt"):
            print("Installing dependencies from requirements.txt...")
            subprocess.run(["pip3", "install", "-r", "requirements.txt"])

        # Create .env file with the obtained CSRF_TOKEN and SESSION_ID
        create_env_file(csrf_token, session_id)

        # Run main.py
        print("Running main.py...")
        subprocess.run(["python3", "main.py"])

        # Run db_visualizer.py
        print("\nYou can now run db_visualizer.py to view tables from your database.")
        print("To run it, simply use the following command at any time:")
        print('python3 db_visualizer.py')
        print('\nHere is an example:')

        subprocess.run(["python3", "db_visualizer.py"])
    else:
        print("Could not retrieve CSRF_TOKEN and SESSION_ID. Please try again manually.")

if __name__ == "__main__":
    main()
