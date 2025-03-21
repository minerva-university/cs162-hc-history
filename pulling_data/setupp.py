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
    """Automate the process of retrieving CSRF token and Session ID from a browser."""
    print("Which browser are you using? (chrome/firefox/edge/opera/safari)")
    browser_choice = input().strip().lower()

    if browser_choice not in ['chrome', 'firefox', 'edge', 'opera', 'safari']:
        print("Unsupported browser. Please manually pull your CSRF_TOKEN and SESSION_ID from your browser's developer tools.")
        return None, None

    print("Are you logged into Forum right now? (yes/no)")
    logged_in = input().strip().lower()

    if logged_in != 'yes':
        print("Please log into Forum and try again.")
        return None, None

    print("You may need to enter your password if required.")

    try:
        if browser_choice == 'chrome':
            cookies = browser_cookie3.chrome(domain_name='forum.minerva.edu')
        elif browser_choice == 'firefox':
            cookies = browser_cookie3.firefox(domain_name='forum.minerva.edu')
        elif browser_choice == 'edge':
            cookies = browser_cookie3.edge(domain_name='forum.minerva.edu')
        elif browser_choice == 'opera':
            cookies = browser_cookie3.opera(domain_name='forum.minerva.edu')
        elif browser_choice == 'safari':
            # Safari cookies are supported on macOS
            if os.name == 'posix':  # Check if it's macOS
                cookies = browser_cookie3.safari(domain_name='forum.minerva.edu')
            else:
                print("Safari is only supported on macOS. Please manually extract your CSRF_TOKEN and SESSION_ID.")
                return None, None

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
