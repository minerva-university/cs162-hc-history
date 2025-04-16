# Backend

This folder contains the backend of the HC/LO Feedback Viewer. It handles all data collection, storage, and API routing needed by the frontend.

---

## Overview

- **`main.py`**  
  Loads environment variables, initializes the local SQLite database (`data.db`), and pulls student feedback data from Forum.

- **`setup.py`**  
  A helper script that scrapes your browser cookies (`csrftoken`, `sessionid`), writes them to `.env`, and runs `main.py`.

- **`app.py`**  
  Runs a Flask API server with endpoints that the frontend relies on for querying filtered feedback and AI summaries.

- **`db_visualizer.py`**  
  Opens an interactive table view of your local database for debugging or inspection.

- **`schema.sql`**  
  Defines the database schema.

- **`views.sql`**  
  Defines SQL views for simplifying queries.

- **`__init__.py`**  
  Marks the backend as a Python package and sets up the environment.
---

## Finding CSRF Token and Session ID

Normally `setup.py` handles this automatically, but here's how to find them manually if needed:

1. Visit [forum.minerva.edu](https://forum.minerva.edu).
2. Open **Inspect Element**, go to the **Network** tab, and refresh the page.
3. Look for a file called `"self"` or similar.
4. In the **Headers** tab, find cookies with:
   - `csrftoken=...`
   - `sessionid=...`

   These two values are required for pulling feedback from Forum.

> ![gettokens](https://github.com/user-attachments/assets/549df9fd-36ec-45c2-8a70-d42ffc7f0b25)

---

## Exploring `data.db`

Feedback data will be pulled and stored in `data.db` after setup.

To explore the data manually, run:
```bash
python3 db_visualizer.py
```
This will allow you to choose a table/view and launch a webpage showing your chosen data.