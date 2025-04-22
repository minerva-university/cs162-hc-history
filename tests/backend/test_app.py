import os
import sys

# Ensure that the project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import io
import csv
import sqlite3
import pytest

# Import the entire module; we need it for the Flask instance and for patching get_db_connection
from backend import app as backend_app

# --- Fake Database Classes for Testing --- 

class FakeCursor:
    """
    A fake cursor to simulate database query behavior.
    For queries against sqlite_master it returns a dummy table list.
    For queries against all_scores it returns pre-defined rows or 
    raises an exception based on configuration.
    """
    def __init__(self, rows, fail_on_all_scores=False):
        self.rows = rows
        self.fail_on_all_scores = fail_on_all_scores
        self.last_query = ""

    def execute(self, query, params=None):
        self.last_query = query
        if "FROM all_scores" in query and self.fail_on_all_scores:
            raise sqlite3.OperationalError("Simulated error for testing")
        # No additional behavior is needed for our test queries.

    def fetchall(self):
        if "sqlite_master" in self.last_query:
            # Return a dummy list of tables that includes our all_scores view.
            return [{'name': 'all_scores'}]
        if "FROM all_scores" in self.last_query:
            return self.rows
        return []

class FakeConnection:
    """
    A fake connection that returns our FakeCursor.
    """
    def __init__(self, cursor):
        self._cursor = cursor

    def cursor(self):
        return self._cursor

    def close(self):
        pass

# --- Fake get_db_connection Functions for Different Test Scenarios ---

def fake_get_db_connection_success_feedback():
    # Fake rows for /api/feedback endpoint.
    fake_rows = [
        {
            'score': '4.0',
            'weight': '8x',
            'comment': 'Great job',
            'outcome_name': 'Outcome A',
            'assignment_title': 'Assignment 1',
            'course_title': 'Course 101',
            'course_code': 'C101',
            'term_title': 'Fall 2021',
            'created_on': '2021-09-01',
            'forum_link': 'https://forums/minerva/123'
        },
        { # deliberately full of None to test fallbacks
            'score': None,
            'weight': None,
            'comment': None,
            'outcome_name': None,
            'assignment_title': None,
            'course_title': None,
            'course_code': None,
            'term_title': None,
            'created_on': None,
            'forum_link': None
        }
    ]
    fake_cursor = FakeCursor(rows=fake_rows, fail_on_all_scores=False)
    return FakeConnection(fake_cursor)

def fake_get_db_connection_failure():
    # Simulate a failure when querying all_scores.
    fake_cursor = FakeCursor(rows=[], fail_on_all_scores=True)
    return FakeConnection(fake_cursor)

def fake_get_db_connection_export():
    # Fake row for testing /api/export endpoint.
    fake_rows = [{
        'score': 4.5,
        'weight': '10x',
        'comment': 'Well done',
        'outcome_name': 'Outcome Export',
        'assignment_title': 'Export Assignment',
        'course_title': 'Course Export',
        'course_code': 'CExport',
        'term_title': 'Winter 2022',
        'created_on': '2022-01-15',
        'forum_link': 'https://forums/minerva/456'
    }]
    fake_cursor = FakeCursor(rows=fake_rows, fail_on_all_scores=False)
    return FakeConnection(fake_cursor)

def fake_get_db_connection_export_all():
    # Fake row for testing /api/export-all endpoint.
    fake_rows = [{
        'score': 3.2,
        'weight': '5x',
        'comment': 'Average',
        'outcome_name': 'Outcome All',
        'assignment_title': 'All Assignment',
        'course_title': 'Course All',
        'course_code': 'CAll',
        'term_title': 'Spring 2022',
        'created_on': '2022-03-10',
        'forum_link': 'https://forums/minerva/789'
    }]
    fake_cursor = FakeCursor(rows=fake_rows, fail_on_all_scores=False)
    return FakeConnection(fake_cursor)

# --- Fixtures for Different Endpoints ---

@pytest.fixture
def client_feedback(monkeypatch):
    # Override the top-level function in the module using a string target
    monkeypatch.setattr("backend.app.get_db_connection", fake_get_db_connection_success_feedback)
    backend_app.app.config['TESTING'] = True
    with backend_app.app.test_client() as client:
        yield client

@pytest.fixture
def client_export(monkeypatch):
    monkeypatch.setattr("backend.app.get_db_connection", fake_get_db_connection_export)
    backend_app.app.config['TESTING'] = True
    with backend_app.app.test_client() as client:
        yield client

@pytest.fixture
def client_export_all(monkeypatch):
    monkeypatch.setattr("backend.app.get_db_connection", fake_get_db_connection_export_all)
    backend_app.app.config['TESTING'] = True
    with backend_app.app.test_client() as client:
        yield client

# --- Test Functions ---

def test_get_feedback_success(client_feedback):
    response = client_feedback.get("/api/feedback")
    assert response.status_code == 200
    json_data = response.get_json()
    assert isinstance(json_data, list)
    assert len(json_data) == 2

    # Verify conversion logic for the first row.
    first = json_data[0]
    assert first['score'] == 4.0
    assert first['weight'] == '8x'
    # The numeric conversion of weight '8x' should yield 8.0.
    assert first['weight_numeric'] == 8.0

    # For the second row, missing values are handled with fallbacks.
    second = json_data[1]
    assert second['score'] == 0.0
    assert second['weight'] == '1x'

def test_get_feedback_failure(monkeypatch):
    monkeypatch.setattr("backend.app.get_db_connection", fake_get_db_connection_failure)
    backend_app.app.config['TESTING'] = True
    with backend_app.app.test_client() as client:
        response = client.get("/api/feedback")
        assert response.status_code == 200
        # On failure, the endpoint returns an empty list.
        json_data = response.get_json()
        assert json_data == []

def test_export_data(client_export):
    response = client_export.get(
        "/api/export?hc=Outcome+Export&course=CExport&term=Winter+2022&minScore=4&maxScore=5"
    )
    assert response.status_code == 200
    assert response.mimetype == "text/csv"
    content_disposition = response.headers.get("Content-Disposition")
    assert "attachment" in content_disposition

    # Decode CSV and check its content.
    csv_text = response.data.decode('utf-8')
    csv_reader = csv.reader(io.StringIO(csv_text))
    rows = list(csv_reader)

    expected_header = [
        'Outcome Name', 'Score', 'Comment', 'Weight',
        'Assignment Title', 'Course Code', 'Course Title', 'Term Title'
    ]
    # Check CSV header.
    assert rows[0] == expected_header

    expected_row = [
        'Outcome Export', '4.5', 'Well done', '10x',
        'Export Assignment', 'CExport', 'Course Export', 'Winter 2022'
    ]
    # Check CSV data row.
    assert rows[1] == expected_row

def test_export_all_data(client_export_all):
    response = client_export_all.get("/api/export-all")
    assert response.status_code == 200
    assert response.mimetype == "text/csv"
    content_disposition = response.headers.get("Content-Disposition")
    assert "attachment" in content_disposition

    # Decode CSV content and verify header and row data.
    csv_text = response.data.decode('utf-8')
    csv_reader = csv.reader(io.StringIO(csv_text))
    rows = list(csv_reader)

    expected_header = [
        'Score', 'Weight', 'Comment', 'Outcome Name', 'Assignment Title',
        'Course Title', 'Course Code', 'Term Title', 'Created On'
    ]
    assert rows[0] == expected_header

    expected_row = [
        '3.2', '5x', 'Average', 'Outcome All', 'All Assignment',
        'Course All', 'CAll', 'Spring 2022', '2022-03-10'
    ]
    assert rows[1] == expected_row
