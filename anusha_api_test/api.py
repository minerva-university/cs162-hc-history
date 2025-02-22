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