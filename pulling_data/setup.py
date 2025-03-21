import os
import subprocess
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# Import WebDriver Manager for different browsers
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager  # Updated import

# Service classes for browser drivers
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService


from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def create_env_file(csrf_token, session_id):
    """Create the .env file if it doesn't exist with CSRF_TOKEN and SESSION_ID."""
    if os.path.exists(".env"):
        print(".env file already exists. Skipping input step.")
        return

    with open(".env", "w") as env_file:
        env_file.write(f'CSRF_TOKEN="{csrf_token}"\n')
        env_file.write(f'SESSION_ID="{session_id}"\n')

    print("✅ .env file created successfully.")

def automate_login_and_get_cookies(browser_choice="chrome"):
    """Automate login using Selenium and extract CSRF_TOKEN and SESSION_ID."""
    
    # Set up WebDriver based on the user's browser choice
    if browser_choice == "chrome":
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    else:
        print("Unsupported browser. Please use 'chrome'.")
        return None, None

    driver.get("https://forum.minerva.edu")  # Replace with your forum URL
    print("Page loaded successfully. Waiting for elements...")

    # Wait for the "Use Email and Password" button to be visible and click it
    try:
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "js-use-email"))
        ).click()
        print("Clicked 'Use Email and Password' button.")
    except Exception as e:
        print(f"Error waiting for 'Use Email and Password' button: {e}")
        driver.quit()
        return None, None

    # Wait for the email input field to be visible
    try:
        email_field = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.NAME, "email"))
        )
        email_field.send_keys("your_email@example.com")  # Replace with actual email
        print("Entered email.")
    except Exception as e:
        print(f"Error waiting for email field: {e}")
        driver.quit()
        return None, None

    # Wait for the password input field to be visible and fill it in
    try:
        password_field = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.NAME, "password"))
        )
        password_field.send_keys("your_password")  # Replace with actual password
        print("Entered password.")
    except Exception as e:
        print(f"Error waiting for password field: {e}")
        driver.quit()
        return None, None

    # Submit the form
    password_field.send_keys(Keys.RETURN)
    print("Form submitted. Waiting for login to complete...")

    # Wait for the page to load after login (adjust time if necessary)
    time.sleep(10)  # Give the page time to load completely

    # Retrieve cookies after login
    cookies = driver.get_cookies()
    print("Cookies retrieved.")

    csrf_token = None
    session_id = None

    # Extract CSRF token and session ID from cookies
    for cookie in cookies:
        if cookie['name'] == 'csrftoken':
            csrf_token = cookie['value']
        elif cookie['name'] == 'sessionid':
            session_id = cookie['value']

    if csrf_token and session_id:
        print(f"Successfully retrieved CSRF Token: {csrf_token}")
        print(f"Successfully retrieved Session ID: {session_id}")
    else:
        print("Failed to retrieve CSRF Token and Session ID.")

    driver.quit()  # Close the browser
    print("Browser closed.")
    
    return csrf_token, session_id


def install_requirements():
    """Install dependencies from requirements.txt"""
    if os.path.exists("requirements.txt"):
        print("Installing dependencies from requirements.txt...")
        subprocess.run(["pip3", "install", "-r", "requirements.txt"])

def main():
    # Step 1: Install dependencies from requirements.txt
    install_requirements()

    # Step 2: Ask the user for the browser of choice (default to Chrome)
    print("Which browser would you like to use? (chrome/firefox/edge): ")
    browser_choice = input().strip().lower()
    if browser_choice not in ["chrome", "firefox", "edge"]:
        print("Invalid choice, defaulting to Chrome.")
        browser_choice = "chrome"

    # Step 3: Automate login and retrieve CSRF token and session ID
    csrf_token, session_id = automate_login_and_get_cookies(browser_choice)

    if csrf_token and session_id:
        # Step 4: Create .env file with CSRF token and session ID
        create_env_file(csrf_token, session_id)

        # Step 5: Run your Python scripts or any other setup needed
        print("Running main.py...")
        subprocess.run(["python3", "main.py"])

        print("You can now run db_visualizer.py to view tables from your database.")
        subprocess.run(["python3", "db_visualizer.py"])
    else:
        print("Error: CSRF Token and Session ID could not be retrieved. Please try logging in manually.")

if __name__ == "__main__":
    main()
