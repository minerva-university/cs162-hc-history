
from api import HEADERS, BASE_URL

import requests
def get_assignments():
    url = "https://forum.minerva.edu/api/v1/assignments"
    params = {}  # Try an empty dictionary to test the default behavior

    response = requests.get(url, headers=HEADERS, params=params)

    if response.status_code != 200:
        print(f"Failed to fetch assignments. Status code: {response.status_code}")
        print("Response Content:", response.text)  # Print full error message
        return []

    data = response.json()

    filtered_assignments = [
        {"title": assignment.get("title", "No Title"), "status": assignment.get("state", "Unknown")}
        for assignment in data
    ]

    print("Filtered Assignments:\n", filtered_assignments)
    return filtered_assignments


def get_sections():
    """Fetch enrolled sections and display course title + status."""
    url = f"{BASE_URL}sections"
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        sections = response.json()
        
        print("\nYour Enrolled Courses:\n" + "=" * 30)
        for section in sections:
            course = section.get("course", {})
            title = course.get("title", "No Title")
            status = course.get("state", "Unknown Status")
            print(f"{title}: {status}")

    else:
        print(f"Failed to fetch sections. Status code: {response.status_code}")

if __name__ == "__main__":
    get_sections()