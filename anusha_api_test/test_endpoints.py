#running this code creates a folder called api_responses that contains the responses from the API endpoints, along with any errors or exceptions that occurred during the requests.
#it also prints messages to the console to indicate the status of each API request.
#.env must be configured to store the CSRF token and session ID for the API requests.

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API credentials from environment variables
CSRF_TOKEN = os.getenv("CSRF_TOKEN")
SESSION_ID = os.getenv("SESSION_ID")
BASE_URL = "https://forum.minerva.edu/api/v1/"

# Ensure variables are loaded correctly
if not all([CSRF_TOKEN, SESSION_ID, BASE_URL]):
    print("⚠️ ERROR: Missing environment variables. Check your .env file.")
    exit()

# Headers for authentication
HEADERS = {
    "Cookie": f"csrftoken={CSRF_TOKEN}; sessionid={SESSION_ID}",
    "X-Csrftoken": CSRF_TOKEN,
}

# List of API endpoints to test
endpoints = {
    "users": "users",
    "paginated-users": "paginated-users",
    "terms": "terms",
    "term-holidays": "term-holidays",
    "colleges": "colleges",
    "courses": "courses",
    "sections": "sections",
    "assignment-submissions": "assignment-submissions",
    "assignment-submission-resources": "assignment-submission-resources",
    "section-users": "section_users",
    "hc-items": "hc-items",
    "general-learning-outcomes": "general-learning-outcomes",
    "learning-outcomes": "learning-outcomes",
    "academic-policies": "academic-policies",
    "assignments": "assignments",
    "assignment-group-users": "assignment-group-users",
    "assignment-groups": "assignment-groups",
    "paginated-assignments": "paginated-assignments",
    "paginated-assessments": "paginated-assessments",
    "announcements": "announcements",
    "paginated-announcements": "paginated-announcements",
    "paginated-recently-graded": "paginated-recently-graded",
    "classes": "classes",
    "paginated-classes": "paginated-classes",
    "class-events": "class-events",
    "class-polls": "class-polls",
    "office-hours": "office-hours",
    "licodeservers": "licodeservers",
    "lo-trees": "lo-trees",
    "messages": "messages",
    "message-metadata": "message-metadata",
    "pubsubservers": "pubsubservers",
    "recording-sessions": "recording-sessions",
    "resources": "resources",
    "room-users": "room-users",
    "room-resources": "room-resources",
    "paginated-resources": "paginated-resources",
    "outcome-assessments": "outcome-assessments",
}

# Create a directory to store responses
output_dir = "api_responses"
os.makedirs(output_dir, exist_ok=True)

for name, endpoint in endpoints.items():
    url = f"{BASE_URL}{endpoint}"
    print(f"🔄 Testing: {name} -> {url}")

    try:
        response = requests.get(url, headers=HEADERS)
        filename = os.path.join(output_dir, f"{name}.txt")

        with open(filename, "w", encoding="utf-8") as f:
            # Log status code
            f.write(f"=== {name.upper()} (Status Code: {response.status_code}) ===\n")

            if response.status_code == 200:
                # Format JSON output for readability
                json_data = json.dumps(response.json(), indent=4)
                f.write(json_data + "\n")
                print(f"✅ SUCCESS: {name} (Saved to {filename})")
            else:
                f.write(f"⚠️ ERROR: {response.status_code} - {response.text}\n")
                print(f"❌ ERROR: {name} (Status: {response.status_code})")

    except Exception as e:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(f"❌ ERROR: {name} - {str(e)}\n")
        print(f"❌ EXCEPTION: {name} - {e}")

print("\n✅ Testing complete. Check the 'api_responses' directory for details.")
