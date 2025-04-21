import pytest
import os
import sqlite3
from backend import main
from unittest.mock import patch, mock_open, MagicMock

# Sample test for environment loading
def test_load_env_variables(monkeypatch):
    monkeypatch.setenv("CSRF_TOKEN", "dummy_token")
    monkeypatch.setenv("SESSION_ID", "dummy_session")

    csrf, session, base_url = main.load_env_variables()
    assert csrf == "dummy_token"
    assert session == "dummy_session"
    assert base_url.startswith("https://")

# Sample test for headers
def test_get_headers():
    headers = main.get_headers("abc", "123")
    assert headers["Cookie"] == "csrftoken=abc; sessionid=123"
    assert headers["X-Csrftoken"] == "abc"

# Test schema execution with a fake DB
def test_initialize_database(tmp_path, monkeypatch):
    # Create a fake schema file
    schema_file = tmp_path / "schema.sql"
    schema_file.write_text("CREATE TABLE test (id INTEGER PRIMARY KEY);")

    db_file = tmp_path / "test.db"
    main.initialize_database(str(db_file), str(schema_file))

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    assert ("test",) in tables
    conn.close()

# Mock fetch_data_from_api
@patch("backend.main.requests.get")
def test_fetch_data_from_api_success(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"key": "value"}

    result = main.fetch_data_from_api("http://fake.url", headers={})
    assert result == {"key": "value"}

@patch("backend.main.requests.get")
def test_fetch_data_from_api_failure(mock_get):
    mock_get.return_value.status_code = 404
    mock_get.return_value.text = "Not Found"

    result = main.fetch_data_from_api("http://fake.url", headers={})
    assert result is None
