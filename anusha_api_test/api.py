import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Retrieve values from the .env file
CSRF_TOKEN = os.getenv("CSRF_TOKEN")
SESSION_ID = os.getenv("SESSION_ID")
BASE_URL = "https://forum.minerva.edu/api/v1/"

HEADERS = {
    "Cookie": f"csrftoken={CSRF_TOKEN}; sessionid={SESSION_ID}",
    "X-Csrftoken": CSRF_TOKEN,
}

def get_courses():
    """Fetches the list of courses the user is enrolled in."""
    url = f"{BASE_URL}assignments"
    response = requests.get(url, headers=HEADERS, params={"course_id":3409})
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch courses. Status code: {response.status_code}")
        return []
