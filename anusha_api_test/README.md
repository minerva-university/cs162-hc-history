## API Testing Progress

### Running The Code

#### From the Console
- open your console and run `git pull && git switch anusha-api-test && cd anusha_api_test` to get into this folder
- run `python setup.py` if you want to get your own data
- data will be pulled and stored in a new folder, `api_responses/`

#### Finding CSRF Token and Session ID
- Go to [forum.minerva.edu](https://forum.minerva.edu)
- Inspect element, click on the Network tab, and refresh the page
- Search for the "self" file
- Click on the "Headers" tab
- Click on the "Request Headers" dropdown
- One of the first ten rows should say Cookie: csrftoken=...; sessionid=...;

### Progress Made

#### API Endpoints
- I identified all accessible API endpoints. The list is stored in `all_minerva_endpoints.txt`
- I created `test_endpoints.py`, a script to systematically send GET requests to all endpoints
- Requests may fail due to missing parameters/other errors

#### API Responses
- API responses are stored in the `api_responses/` directory
- Each endpoint has its own `.txt` file
- The script formats JSON responses for readability and logs errors when applicable

#### .env File
- API credentials (CSRF token, session ID, etc.) are stored securely in a `.env` file to prevent exposure
- To use, create a .env file with the following two lines (replacing with your data):
    - `CSRF_TOKEN="XXXXXX"`
    - `SESSION_ID="XXXXX"`
- `setup.py` will prompt you for these tokens

#### Next Steps
- I'm currently analyzing API responses to determine useful data
- I need to identify which endpoints are useful and which data within them are useful
- For some endpoints, I will need to figure out which parameters to pass

## Discoveries About Endpoints

### **Primary Endpoint for Project**

The main endpoint we need to access is

**`outcome-assessments`**: https://forum.minerva.edu/api/v1/outcome-assessments

This is where individual feedback and grading details are stored.

### **Example Feedback Data from outcome-assessments Endpoint**

This is an example of feedback I got on a CS162 assignment:

```json
{
    "id": 2493704,
    "active": true,
    "assignment-id": 2476933,
    "broken-hc-key": null,
    "class-event-id": null,
    "comment": "I love the idea. I have written a fair amount of (uncommented, untested) code that interfaces with forum. The endpoints I query are mainly for faculty endpoints. However, it'd be cool to have this project build two separate things:\n1. A Minerva API client\n2. A more detailed personal analysis of all your feedback.\n\nAnyway, I have shortlisted the idea. I hope it gets picked!",
    "created-on": "2025-01-30T12:41:49Z",
    "graded-blindly": false,
    "grader-user-id": 595,
    "hc-id": null,
    "hc-item-id": null,
    "klass-id": null,
    "learning-outcome": null,
    "metadata": "{\"type\":\"general\",\"sortKey\":0}",
    "poll-session-id": null,
    "recording-session": null,
    "recording-session-event-id": null,
    "score": null,
    "scoring-category": null,
    "target-assignment-group-id": null,
    "target-breakout-group-id": null,
    "target-user-id": 12350,
    "type": "assignment",
    "updated-on": "2025-01-30T12:41:49Z"
}
```
### **Most Important Data**
- **`learning-outcome`**: ID for the learning outcome/HC being graded
- **`score`**: The score for each piece of feedback
- **`type`**: Can be "assignment", "poll", "video", or "preclass_assignment"

### **URL Format for Feedback Entries**

Each piece of feedback can be accessed at:

**`https://forum.minerva.edu/app/assignment-grader/**assignment-id**/users/**target-user-id**/assessments/**id**?tab=hcs&view=cornerstones`**

where **assignment-id**, **target-user-id**, and **id** are data points for each piece of feedback (elaborated on below)

### **Other Data Points & Findings**

- **`active`**: Always true, unclear what it does
- **`assignment-id`**: null if feedback is from a poll or in-class score
- **`broken-hc-key`** & **`class-event-id`**: Always null
- **`comment`** (text), **`created-on`** (date), **`graded-blindly`** (T/F): Self-explanatory
- **`grader-user-id`**: Likely the professor or TA who graded it
- **`hc-id`** & **`hc-item-id`**: Always null. **hc-id** might have been replaced with **learning-outcome**.
- **`klass-id`**: null for assignments. But poll/in-class/video grades are linked at:
  - **`https://forum.minerva.edu/app/courses/0/sections/0/classes/**klass-id**/review`**
  - for direct links: review?tab=polls, review?tab=video, review?tab=workbooks
- **`learning-outcome`**: ID for the learning outcome/HC being graded, null if it's just a comment
- **`metadata`**: Unknown purpose lol
- **`poll-session-id`**: Exists for polls, not sure what it's used for
- **`recording-session`** & **`recording-session-event-id`**: Always null
- **`score`**: The score for each piece of feedback
- **`scoring-category`**: Seems to always be null
- **`target-assignment-group-id`**: Only relevant for group projects
- **`target-breakout-group-id`**: Always null
- **`target-user-id`**: The student receiving feedback
- **`type`**: Can be "assignment", "poll", "video", or "preclass_assignment"
- **`updated-on`**: Timestamp of the last update

This section will be updated as I figure out more details from other endpoints! 
