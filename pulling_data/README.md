# Minerva API Client

This is a Python-based client for interacting with the Minerva API, designed to fetch data, store it, and allow you to view the data in a structured format.

## Installation

### Create a Virtual Environment

To set up the project, you'll need to create a virtual environment.

1. **Create a virtual environment:**
    ```
    python -m venv venv
    ```

2. **Activate the virtual environment:**

    - On Windows:
      ```
      venv\Scripts\activate
      ```

    - On macOS/Linux:
      ```
      source venv/bin/activate
      ```

## Running The Code

### From the Console

1. Open your console and navigate to the repository.
2. Pull the latest changes and switch to the appropriate branch:
    ```
    git pull && git switch anusha-api-test && cd pulling_data
    ```
3. Run the setup script to pull data and store it:
    ```
    python3 setup.py
    ```
   - This will run the `setup.py` file, installing dependencies and creating the `.env` file if it doesn't exist, as well as running the necessary scripts to pull and store data in your `data.db` file.

### Finding CSRF Token and Session ID

1. Go to [forum.minerva.edu](https://forum.minerva.edu).
2. Open the **Inspect Element** tool, then go to the **Network** tab and refresh the page.
3. Search for the "self" file in the Network tab.
4. Click on the file and navigate to the **Headers** tab.
5. Open the **Request Headers** dropdown, and look for the following headers:
   - `csrftoken=...`
   - `sessionid=...`

   **Note:** These will be the CSRF Token and Session ID needed for the script to work.

   ![gettokens](https://github.com/user-attachments/assets/549df9fd-36ec-45c2-8a70-d42ffc7f0b25)

### Running the Code After Setup

Once you've run `python3 setup.py`, the data will be pulled from the API and stored in `data.db`.

To view the data and interact with it through the database, you can run the `db_visualizer.py` script to view the tables and data view:

```
python3 db_visualizer.py
```

This allows you to see the data in a structured HTML table format.

## What the Code Does

### Database Structure

1. **Creates an SQLite Database** with the necessary data pulled from the Minerva API.
2. **Creates tables** in the database, such as:
   - `colleges`: Information about the colleges that exist at Minerva (AH, B, CS, etc).
   - `outcome_assessments`: Data about your assessments and outcome scores.
   - Additional tables related to terms, courses, assignments, and learning outcomes.
   
3. **Creates a View (`assignment_scores`)**:
   - The view aggregates data from various tables and creates a unified view of the assignment scores based on various metrics such as course, college, and outcome. This is intended to be used for displaying through the frontend.

### How to View the Data

Once the database and tables are set up, you can visualize the data:

1. **Run `db_visualizer.py`** to choose and display the tables visually in an HTML format.
2. The script generates an interactive table, allowing you to toggle the visibility of columns.

# HC/LO Feedback Platform Setup

This document provides instructions for setting up the HC/LO Feedback Platform on your local machine using your own data.

## Prerequisites

- Python 3.7+
- Node.js and npm
- SQLite3

## Backend Setup

1. **Create a virtual environment and install dependencies**

```bash
cd pulling_data
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
```

2. **Set up your database**

You have two options:

### Option A: Use your own data.db file

If you have your own SQLite database file containing HC/LO feedback data, simply place it in the `pulling_data` directory and name it `data.db`.

### Option B: Create a new database with sample data

```bash
cd pulling_data
sqlite3 data.db < schema.sql
sqlite3 data.db < sample_data.sql
```

3. **Start the Flask backend**

```bash
cd pulling_data
python app.py
```

The backend API will be available at `http://localhost:5001/api/feedback`.

## Frontend Setup

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Start the development server**

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Understanding the Database Schema

For the feedback platform to work correctly, your database needs to have either:

1. An `assignment_scores` table with these columns:
   - score
   - comment
   - outcome_name
   - assignment_title
   - course_title
   - course_code
   - term_title
   - created_on

2. OR a `feedback` table with the same columns.

If you're using your own data format, you may need to create a view in SQLite that maps your data to this format.

## Troubleshooting

- If you see "Database Error" on the frontend, make sure the Flask backend is running and accessible.
- If there's no data shown, check that your database contains records in the required format.
- For more detailed logs, check the browser console and the Flask server output.
