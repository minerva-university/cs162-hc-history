import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def google_authenticate():
    """Automates Google login using Selenium with Google popup interaction."""
    
    # Set up WebDriver options (headless is optional here)
    options = Options()
    # options.add_argument("--headless")  # Uncomment to run in headless mode

    # Initialize the WebDriver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    # Step 1: Go to the page where "Sign in with Google" is triggered
    driver.get("https://forum.minerva.edu")  # Replace with the actual URL of your site
    print("Page loaded successfully.")

    # Step 2: Wait for the 'Sign in with Google' button and click it
    sign_in_button = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//button[contains(text(), 'Continue with Google')]"))
    )
    sign_in_button.click()
    print("Clicked 'Continue with Google'.")

    # Step 3: Wait for the Google account selection screen to load
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located((By.ID, "identifierId"))  # Google email field
    )
    print("Google login page loaded.")

    # Step 4: Enter the email address
    email_field = driver.find_element(By.ID, "identifierId")
    email_field.send_keys("your_email@gmail.com")  # Replace with your email
    email_field.send_keys(Keys.RETURN)
    print("Entered email.")

    # Step 5: Wait for the password input to appear
    try:
        print("Waiting for password input field...")
        WebDriverWait(driver, 30).until(
            EC.visibility_of_element_located((By.NAME, "password"))
        )
        print("Password field is visible.")
    except Exception as e:
        print(f"Error waiting for password field: {e}")
        driver.quit()
        return

    # Step 6: Enter the password
    password_field = driver.find_element(By.NAME, "password")
    password_field.send_keys("your_password")  # Replace with your password
    password_field.send_keys(Keys.RETURN)
    print("Entered password and submitted.")

    # Step 7: Wait for the successful redirection (to confirm successful login)
    WebDriverWait(driver, 20).until(
        EC.url_to_be("https://forum.minerva.edu/app")  # Wait until the correct page loads
    )
    print("Successfully logged in and redirected.")

    # Step 8: Add a small delay to allow for any final page load or redirects
    time.sleep(3)

    # Step 9: Optionally, get cookies (e.g., CSRF Token, Session ID)
    cookies = driver.get_cookies()
    for cookie in cookies:
        print(f"Cookie: {cookie['name']} = {cookie['value']}")

    # Step 10: Close the browser
    driver.quit()

if __name__ == "__main__":
    google_authenticate()
