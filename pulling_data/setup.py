import os
import subprocess

def manual_cookie_entry():
    print("\n⚠️  Could not extract cookies automatically.")
    print("Please manually input your credentials:")
    csrf_token = input("Enter your CSRF token: ").strip()
    session_id = input("Enter your Session ID: ").strip()

    with open(".env", "w") as env_file:
        env_file.write(f'CSRF_TOKEN="{csrf_token}"\n')
        env_file.write(f'SESSION_ID="{session_id}"\n')

    print("✅ .env file created successfully with manually entered cookies.")


def scrape_and_save_cookies():
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.common.exceptions import WebDriverException, TimeoutException
    from webdriver_manager.chrome import ChromeDriverManager
    options = webdriver.ChromeOptions()
    options.add_argument("user-data-dir=selenium")  # persistent browser session

    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    except WebDriverException as e:
        print("🚫 Failed to initialize Chrome WebDriver.")
        print(str(e))
        manual_cookie_entry()
        return

    try:
        driver.get("https://forum.minerva.edu")

        # Wait for some cookies
        WebDriverWait(driver, 30).until(lambda d: d.get_cookies() != [])
        cookies = driver.get_cookies()
        cookie_names = [c['name'] for c in cookies]

        if "sessionid" not in cookie_names or "csrftoken" not in cookie_names:
            input("Please log in manually through Google, then press Enter...")
            WebDriverWait(driver, 30).until(lambda d: "sessionid" in [c['name'] for c in d.get_cookies()])
            cookies = driver.get_cookies()

        desired_cookies = {c['name']: c['value'] for c in cookies if c['name'] in ['sessionid', 'csrftoken']}

        if "csrftoken" not in desired_cookies or "sessionid" not in desired_cookies:
            raise ValueError("Cookies not found after login.")

        with open(".env", "w") as env_file:
            env_file.write(f'CSRF_TOKEN="{desired_cookies.get("csrftoken", "")}"\n')
            env_file.write(f'SESSION_ID="{desired_cookies.get("sessionid", "")}"\n')

        print("✅ .env file created successfully with scraped cookies.")

    except (TimeoutException, ValueError) as e:
        print("🚫 Failed to scrape cookies.")
        print(str(e))
        manual_cookie_entry()

    finally:
        try:
            driver.quit()
        except Exception:
            pass


def main():
    # Install dependencies
    if os.path.exists("requirements.txt"):
        print("📦 Installing dependencies from requirements.txt...")
        subprocess.run(["pip3", "install", "-r", "requirements.txt"])
    else:
        print("📂 No requirements.txt found. Skipping dependency installation.")

    # Scrape cookies and save to .env if it doesn't exist
    if not os.path.exists(".env"):
        scrape_and_save_cookies()
    else:
        print(".env file already exists. Skipping scraping step.")

    # Run main.py
    print("🚀 Running main.py...")
    subprocess.run(["python3", "main.py"])

    # Prompt for running db_visualizer.py
    print("\n📊 You can now run db_visualizer.py to view tables from your database.")
    print("To run it, use:\npython3 db_visualizer.py")
    subprocess.run(["python3", "db_visualizer.py"])


if __name__ == "__main__":
    main()
