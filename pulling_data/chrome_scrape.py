from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

# Function to initiate Chrome (works for Arc too since both are Chromium-based)
def get_driver():
    options = webdriver.ChromeOptions()
    # Specify Chrome's user-data-dir to preserve login state (adjust for Arc if needed)
    # options.add_argument("user-data-dir=/path/to/chrome-or-arc/profile")

    # Optionally uncomment if you need to automate login completely fresh:
    # options.add_argument("--incognito")

    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Main execution
driver = get_driver()

try:
    driver.get("https://forum.minerva.edu")

    # Wait for user to log in manually (you can automate Google login, but it involves managing Google auth complexity)
    print("Please log in manually. Press Enter after you've finished logging in.")
    input()

    # Wait explicitly until the cookies are loaded after login
    WebDriverWait(driver, 30).until(
        lambda d: d.get_cookies() != []
    )

    # Fetching cookies from the specified domain
    cookies = driver.get_cookies()

    # Extracting sessionid and csrftoken
    desired_cookies = {}
    for cookie in cookies:
        if cookie['name'] in ['sessionid', 'csrftoken']:
            desired_cookies[cookie['name']] = cookie['value']

    print("Extracted Cookies:", desired_cookies)

finally:
    driver.quit()
