from main import load_env_variables, get_headers, fetch_data_from_api
import json

CSRF_TOKEN, SESSION_ID, BASE_URL = load_env_variables()
headers = get_headers(CSRF_TOKEN, SESSION_ID)

url = f"{BASE_URL}outcome-assessments"
data = fetch_data_from_api(url, headers)

if data:
    with open("debug_outcome_assessments.json", "w") as f:
        json.dump(data, f, indent=2)
    print("✅ Saved full outcome data to debug_outcome_assessments.json")
else:
    print("❌ Could not fetch outcome assessments")
