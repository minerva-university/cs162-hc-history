# Minerva API Client

A Python-based client for interacting with the Minerva API. This tool fetches data, stores it in an SQLite database, and enables viewing the data in a structured format.

---

## Table of Contents

1. [Installation](#installation)
    - [Creating a Virtual Environment](#creating-a-virtual-environment)
2. [Running the Code](#running-the-code)
    - [Console Execution](#from-the-console)
    - [Finding CSRF Token and Session ID](#finding-csrf-token-and-session-id)
    - [Running the Code After Setup](#running-the-code-after-setup)
3. [Code Overview](#what-the-code-does)
    - [Database Structure](#database-structure)
    - [Viewing the Data](#how-to-view-the-data)
4. [Data Pulling and Processing](#data-pulling-and-processing)
    - [Setup](#setup)
    - [AI Summarization Setup](#ai-summarization-setup-optional)
5. [HC/LO Feedback Platform Setup](#hc-lo-feedback-platform-setup)
    - [Prerequisites](#prerequisites)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
    - [Understanding the Database Schema](#understanding-the-database-schema)
    - [Troubleshooting](#troubleshooting)

---

## Installation

### Creating a Virtual Environment

1. **Create a virtual environment:**
    ```bash
    python -m venv venv
    ```

2. **Activate the virtual environment:**
    - On **Windows**:
      ```bash
      venv\Scripts\activate
      ```
    - On **macOS/Linux**:
      ```bash
      source venv/bin/activate
      ```

---

## Running the Code

### From the Console

1. Open your console and navigate to the repository.
2. Pull the latest changes and switch to the appropriate folder:
    ```bash
    git pull && cd pulling_data
    ```
3. Run the setup script to fetch data and store it:
    ```bash
    python3 setup.py
    ```
   - This will install dependencies, create the `.env` file if it doesn't exist, and run necessary scripts to pull and store data in the `data.db` file.

### Finding CSRF Token and Session ID

1. Visit [forum.minerva.edu](https://forum.minerva.edu).
2. Open **Inspect Element**, go to the **Network** tab, and refresh the page.
3. Search for the "self" file in the Network tab.
4. Click on the file, then navigate to the **Headers** tab.
5. Find the following headers:
   - `csrftoken=...`
   - `sessionid=...`

   These are the CSRF Token and Session ID needed for the script to work.

   ![gettokens](https://github.com/user-attachments/assets/549df9fd-36ec-45c2-8a70-d42ffc7f0b25)

### Running the Code After Setup

Once you've run `python3 setup.py`, data will be pulled from the API and stored in `data.db`.

To view and interact with the data, run the `db_visualizer.py` script:
```bash
python3 db_visualizer.py
```
This will display the data in an interactive HTML table format.

---

## What the Code Does

### Database Structure

1. **Creates an SQLite Database** with data pulled from the Minerva API.
2. **Creates tables** such as:
   - `colleges`: Information about colleges (e.g., AH, B, CS).
   - `outcome_assessments`: Data about your assessments and outcome scores.
   - Other tables for terms, courses, assignments, and learning outcomes.

3. **Creates a View (`assignment_scores`)**:
   - Aggregates data across multiple tables and creates a unified view of assignment scores based on course, college, and outcome.

### How to View the Data

1. **Run `db_visualizer.py`** to display tables visually in HTML.
2. The script generates an interactive table, allowing column visibility toggling.

---

## Data Pulling and Processing

### Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/user/minerva-api-client.git
    ```

2. Install required packages:
    ```bash
    pip install -r requirements.txt
    ```

3. Set up your database configuration in the `.env` file.

### AI Summarization Setup (Optional)

1. Get an OpenAI API key:
   - Visit https://platform.openai.com/api-keys.
   - Create a new secret key and copy it.

2. Run the setup script:
    ```bash
    python setup.py
    ```

3. When prompted, enable AI summarization and enter your OpenAI API key.

**Note:** Your OpenAI API key will be stored in the `.env` file. Never commit this file to version control.

---

## HC/LO Feedback Platform Setup

### Prerequisites

- Python 3.7+
- Node.js and npm
- SQLite3

### Backend Setup

1. **Create a virtual environment and install dependencies**:
    ```bash
    cd pulling_data
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

2. **Set up your database**:
   - **Option A**: Use your own `data.db` file. Place it in the `pulling_data` directory and name it `data.db`.
   - **Option B**: Create a new database with sample data:
     ```bash
     cd pulling_data
     sqlite3 data.db < schema.sql
     sqlite3 data.db < sample_data.sql
     ```

3. **Start the Flask backend**:
    ```bash
    cd pulling_data
    python app.py
    ```
    The backend API will be available at `http://localhost:5001/api/feedback`.

### Frontend Setup

1. **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```

2. **Start the development server**:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

---

## Understanding the Database Schema

For the feedback platform to function correctly, your database must have one of the following tables:

1. `assignment_scores` with these columns:
   - `score`, `comment`, `outcome_name`, `assignment_title`, `course_title`, `course_code`, `term_title`, `created_on`

2. OR a `feedback` table with the same columns.

If you're using your own data format, you may need to create a view in SQLite that maps your data to this format.
