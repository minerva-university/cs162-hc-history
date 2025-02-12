# Using the Minerva API client

## Installation

Create a virtual environment
```
python -m venv venv
```

Activate the virtual environment:
• On Windows:
```
venv\Scripts\activate
```
• On macOS/Linux:
```
source venv/bin/activate
```
Next, install the Minerva API client package locally in editable mode:
```
pip install -e .
```
This will install the package and allow you to make changes to the code locally.

## Getting your sessionid and csrf tokens:

To interact with the Minerva API, you will need to retrieve your session ID and CSRF token. Here’s how you can obtain them:

1. Open the website (forum) where the API is hosted in Chrome.
2. Open the Developer Tools in Chrome (press F12 or right-click and select “Inspect”).
3. Go to the “Network” tab.
4. Look for a request made against the API endpoint (you can filter for XHR or fetch requests).
5. Click on the request to see the headers.
6. In the headers, look for the sessionid and csrf tokens. These are necessary for making authenticated API calls.

## Running the demo

To run the demo:
1. Ensure that you have set your session ID and CSRF token in the environment variables or configuration file as required by the API client.
2. Run the demo script:
```
python demo.py
```
This will demonstrate the basic functionality of the Minerva API client.