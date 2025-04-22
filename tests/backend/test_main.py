import sqlite3
from unittest.mock import patch

import pytest
from backend import main


def test_load_env_variables(monkeypatch):
    monkeypatch.setenv("CSRF_TOKEN", "dummy_token")
    monkeypatch.setenv("SESSION_ID", "dummy_session")

    csrf, session, base_url = main.load_env_variables()
    assert csrf == "dummy_token"
    assert session == "dummy_session"
    assert base_url.startswith("https://")


def test_load_env_variables_missing(monkeypatch):
    monkeypatch.delenv("CSRF_TOKEN", raising=False)
    monkeypatch.delenv("SESSION_ID", raising=False)
    with pytest.raises(EnvironmentError):
        main.load_env_variables()


def test_get_headers():
    headers = main.get_headers("abc", "123")
    assert headers["Cookie"] == "csrftoken=abc; sessionid=123"
    assert headers["X-Csrftoken"] == "abc"


def test_initialize_database(tmp_path):
    schema = tmp_path / "schema.sql"
    schema.write_text("CREATE TABLE tst(id INTEGER PRIMARY KEY);")
    db = tmp_path / "t.db"
    main.initialize_database(db, schema)
    assert ("tst",) in sqlite3.connect(db).execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()


@patch("backend.main.requests.get")
def test_fetch_data_from_api_success(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"k": "v"}
    assert main.fetch_data_from_api("u", {}) == {"k": "v"}


@patch("backend.main.requests.get")
def test_fetch_data_from_api_failure(mock_get):
    mock_get.return_value.status_code = 404
    mock_get.return_value.text = "X"
    assert main.fetch_data_from_api("u", {}) is None


def test_assert_data_fetched():
    main.assert_data_fetched("x", {"ok": 1})
    with pytest.raises(RuntimeError):
        main.assert_data_fetched("y", [])
