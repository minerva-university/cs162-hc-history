

# Tests Documentation

This directory contains automated tests for the application using **pytest**. The tests cover various components of the system including setup scripts, runtime management, and backend API functionality.

## Overview

The test suite is designed to verify the correct behavior of:

1. **Setup Process** - Tests for `setup.py` that handles initial project configuration
2. **Runtime Management** - Tests for `run.py` that manages starting the backend and frontend services
3. **Backend API** - Tests for the Flask application that provides data access endpoints
4. **Backend Utilities** - Tests for key backend functionality in `backend/main.py` such as environment loading, schema initialization, and API integration


## Test Isolation Approach

The tests **run completely isolated from the actual application**:

- **No actual application execution** - The tests verify code behavior without running the real application
- **No database dependency** - Tests use mock database connections and predefined test data
- **No file system dependency** - File existence checks are simulated
- **No subprocess execution** - Command execution is intercepted and simulated
- **No network activity** - API endpoints are tested using Flask's test client without actual HTTP requests

This isolation approach ensures:
- Tests run quickly and reliably
- Tests don't depend on the environment or system configuration
- Tests can verify error handling without causing actual errors
- Tests can run in CI/CD pipelines without setup complexity

The `tests/backend/` subfolder mirrors the `backend/` directory and keeps tests modular and organized. This structure:

- Helps isolate tests for specific backend components
- Makes it easy to locate related tests and source files
- Enables finer-grained CI triggers based on modified areas

## Test Files

### `test_setup.py`

Tests the project setup script (`setup.py`) which handles:

- Running commands with proper error handling
- Checking for the existence of the SQLite database file
- Prompting for AI summary generation
- Running the AI setup process
- Starting the backend and frontend services

### `test_run.py`

Tests the runtime management script (`run.py`) which handles:

- Running commands with proper error handling
- Checking for required files and directories
- Starting the backend server
- Launching the frontend in a platform-specific console window (macOS, Windows, Linux)

### `backend/test_app.py`

Tests the Flask backend application (`backend/app.py`) which provides:

- `/api/feedback` endpoint for retrieving feedback data
- `/api/export` endpoint for exporting filtered data as CSV
- `/api/export-all` endpoint for exporting all data as CSV

### `backend/test_main.py`

Tests the backend utility script (`backend/main.py`) which handles:

- Loading environment variables from a `.env` file and raising errors if missing
- Constructing authorization headers using CSRF and session tokens
- Initializing the SQLite database using a schema file
- Fetching data from external API endpoints with proper error handling and response parsing

These tests ensure that core backend setup functions work in isolation, simulate API responses, and validate schema-based database creation logic.

## Running Tests

To run the entire tests, make sure you are in the root directory and then run:

```bash
pytest