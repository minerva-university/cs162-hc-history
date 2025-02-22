## API Testing Progress

### Progress Made:

#### Running The Code:
- Navigate to `anusha_api_test/` in your console
- run `python test_endpoints.py` if you want to get your own data (read more below)

#### API Endpoints
- Identified all accessible API endpoints. The list will be stored in `all_minerva_endpoints.txt`
- Created `test_endpoints.py`, a script to systematically send GET requests to all endpoints
- Requests may fail due to missing parameters/other errors

#### API Responses
- API responses are now stored in the `api_responses/` directory
- Each endpoint has its own `.txt` file
- The script formats JSON responses for readability and logs errors when applicable

#### .env File
- API credentials (CSRF token, session ID, etc.) are stored securely in a `.env` file to prevent exposure
- To use, create a .env file with the following two lines (replacing with your data):
    - `CSRF_TOKEN="XXXXXX"`
    - `SESSION_ID="XXXXX"`

#### Finding CSRF Token and Session ID
- Go to forum.minerva.edu
- Inspect element, click on the Network tab, and refresh the page
- Search for the "self" file
- Click on the "Headers" tab
- Click on the "Request Headers" dropdown
- One of the first ten rows should say Cookie: csrftoken=...; sessionid=...;

#### Next Steps
- I'm currently analyzing API responses to determine useful data
- I need to identify which endpoints are useful and which data within them are useful
- For some endpoints, I will need to figure out which parameters to pass