import os
import subprocess
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait


def scrape_and_save_cookies():
    options = webdriver.ChromeOptions()
    options.add_argument("user-data-dir=selenium")  # use a persistent browser profile
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        driver.get("https://forum.minerva.edu")

        # Check if user is already logged in (if specific cookie exists)
        WebDriverWait(driver, 30).until(lambda d: d.get_cookies() != [])
        cookies = driver.get_cookies()
        cookie_names = [c['name'] for c in cookies]

        if "sessionid" not in cookie_names or "csrftoken" not in cookie_names:
            input("Please log in manually through Google, then press Enter...")
            WebDriverWait(driver, 30).until(lambda d: "sessionid" in [c['name'] for c in d.get_cookies()])
            cookies = driver.get_cookies()

        desired_cookies = {c['name']: c['value'] for c in cookies if c['name'] in ['sessionid', 'csrftoken']}

        with open(".env", "w") as env_file:
            env_file.write(f'CSRF_TOKEN="{desired_cookies.get("csrftoken", "")}"\n')
            env_file.write(f'SESSION_ID="{desired_cookies.get("sessionid", "")}"\n')

        print("✅ .env file created successfully with scraped cookies.")

    finally:
        driver.quit()


def main():
    # Install dependencies
    if os.path.exists("requirements.txt"):
        print("Installing dependencies from requirements.txt...")
        subprocess.run(["pip3", "install", "-r", "requirements.txt"])

    # Scrape cookies and save to .env if it doesn't exist
    if not os.path.exists(".env"):
        scrape_and_save_cookies()
    else:
        print(".env file already exists. Skipping scraping step.")

    # Run main.py
    print("Running main.py...")
    subprocess.run(["python3", "main.py"])

    # Run db_visualizer.py
    print("\nYou can now run db_visualizer.py to view tables from your database.")
    print("To run it, use:")
    print('python3 db_visualizer.py')

    subprocess.run(["python3", "db_visualizer.py"])


if __name__ == "__main__":
    main()
