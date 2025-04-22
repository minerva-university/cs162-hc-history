import os, sys, io, csv, sqlite3, pytest

# ── project‑root on import path ────────────────────────────────────────────────
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend import app as backend_app

# ── tiny DB fakes ─────────────────────────────────────────────────────────────
class FakeCursor:
    def __init__(self, rows, fail_on_all_scores=False):
        self.rows, self.fail_on_all_scores, self.last_query = rows, fail_on_all_scores, ""

    def execute(self, query, params=None):
        self.last_query = query
        if "FROM all_scores" in query and self.fail_on_all_scores:
            raise sqlite3.OperationalError("simulated failure")

    def fetchall(self):
        if "sqlite_master" in self.last_query:
            return [{"name": "all_scores"}]
        return self.rows

class FakeConnection:
    def __init__(self, cursor): self._cursor = cursor
    def cursor(self):           return self._cursor
    def close(self):            pass

# ── fake‑connection factories ─────────────────────────────────────────────────
def fake_conn_feedback():
    rows = [
        {
            "score": "4.0", "weight": "8x", "comment": "Great job",
            "outcome_name": "Outcome A", "assignment_title": "Assignment 1",
            "course_title": "Course 101", "course_code": "C101",
            "term_title": "Fall 2021", "created_on": "2021‑09‑01",
            "forum_link": "https://forums/minerva/123"
        },
        {   # all None → test fallbacks
            "score": None, "weight": None, "comment": None,
            "outcome_name": None, "assignment_title": None,
            "course_title": None, "course_code": None,
            "term_title": None, "created_on": None, "forum_link": None
        },
    ]
    return FakeConnection(FakeCursor(rows))

def fake_conn_feedback_fail():
    return FakeConnection(FakeCursor([], fail_on_all_scores=True))

def fake_conn_export():
    rows = [{
        "score": 4.5, "weight": "10x", "comment": "Well done",
        "outcome_name": "Outcome Export", "assignment_title": "Export Assignment",
        "course_title": "Course Export", "course_code": "CExport",
        "term_title": "Winter 2022", "created_on": "2022‑01‑15",
        "forum_link": "https://forums/minerva/456"
    }]
    return FakeConnection(FakeCursor(rows))

def fake_conn_export_all():
    rows = [{
        "score": 3.2, "weight": "5x", "comment": "Average",
        "outcome_name": "Outcome All", "assignment_title": "All Assignment",
        "course_title": "Course All", "course_code": "CAll",
        "term_title": "Spring 2022", "created_on": "2022‑03‑10",
        "forum_link": "https://forums/minerva/789"
    }]
    return FakeConnection(FakeCursor(rows))

def fake_conn_course_scores():
    rows = [
        {"course_code": "C101", "score": 3.9},
        {"course_code": "C202", "score": 4.2},
    ]
    return FakeConnection(FakeCursor(rows))

# ── helper ─────────────────────────────────────────────────────────────────────
def _csv_rows(resp):
    return list(csv.reader(io.StringIO(resp.data.decode("utf‑8"))))

# ── base client fixture ────────────────────────────────────────────────────────
@pytest.fixture
def client():
    backend_app.app.config["TESTING"] = True
    with backend_app.app.test_client() as c:
        yield c

# ── endpoint‑specific fixtures (monkey‑patch DB) ──────────────────────────────
@pytest.fixture
def client_feedback(monkeypatch, client):
    monkeypatch.setattr("backend.app.get_db_connection", fake_conn_feedback)
    return client

@pytest.fixture
def client_export(monkeypatch, client):
    monkeypatch.setattr("backend.app.get_db_connection", fake_conn_export)
    return client

@pytest.fixture
def client_export_all(monkeypatch, client):
    monkeypatch.setattr("backend.app.get_db_connection", fake_conn_export_all)
    return client

@pytest.fixture
def client_course_scores(monkeypatch, client):
    monkeypatch.setattr("backend.app.get_db_connection", fake_conn_course_scores)
    return client

# ── tests ─────────────────────────────────────────────────────────────────────
def test_get_feedback_success(client_feedback):
    rv = client_feedback.get("/api/feedback")
    assert rv.status_code == 200
    data = rv.get_json()
    assert len(data) == 2

    first, second = data
    assert first["score"] == 4.0
    assert first["weight_numeric"] == 8.0
    assert first["forum_link"].startswith("https://")

    assert second["score"] == 0.0
    assert second["weight"] == "1x"
    assert second["forum_link"] == ""

def test_get_feedback_failure(monkeypatch, client):
    monkeypatch.setattr("backend.app.get_db_connection", fake_conn_feedback_fail)
    rv = client.get("/api/feedback")
    assert rv.status_code == 200 and rv.get_json() == []

def test_export_data(client_export):
    rv = client_export.get(
        "/api/export?hc=Outcome+Export&course=CExport&term=Winter+2022&minScore=4&maxScore=5"
    )
    assert rv.status_code == 200 and rv.mimetype == "text/csv"
    rows = _csv_rows(rv)

    assert rows[0] == [
        "Outcome Name","Score","Comment","Weight","Assignment Title",
        "Course Code","Course Title","Term Title","Forum Link"
    ]
    assert rows[1] == [
        "Outcome Export","4.5","Well done","10x",
        "Export Assignment","CExport","Course Export","Winter 2022",
        "https://forums/minerva/456"
    ]

def test_export_all_data(client_export_all):
    rv = client_export_all.get("/api/export-all")
    assert rv.status_code == 200 and rv.mimetype == "text/csv"
    rows = _csv_rows(rv)

    assert rows[0] == [
        "Score","Weight","Comment","Outcome Name","Assignment Title",
        "Course Title","Course Code","Term Title","Created On","Forum Link"
    ]
    assert rows[1] == [
        "3.2","5x","Average","Outcome All","All Assignment",
        "Course All","CAll","Spring 2022","2022‑03‑10",
        "https://forums/minerva/789"
    ]

def test_course_scores(client_course_scores):
    rv = client_course_scores.get("/api/course-scores")
    assert rv.status_code == 200
    assert rv.get_json() == [
        {"course_code": "C101", "course_score": 3.9},
        {"course_code": "C202", "course_score": 4.2},
    ]
