import pytest
import sqlite3
import os
from pathlib import Path
import sys
from datetime import datetime

# Add the ai-summary directory to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent / 'ai-summary'))

from db import create_ai_summaries_table, fetch_grouped_comments, store_summary, fetch_outcome_metadata

# Test data
TEST_OUTCOME = "Test Outcome"
TEST_OUTCOME_ID = 1
TEST_DESCRIPTION = "Test Description"
TEST_STRENGTHS = "Test Strength 1\nTest Strength 2"
TEST_IMPROVEMENT = "Test Improvement 1\nTest Improvement 2\nTest Improvement 3"

@pytest.fixture(autouse=True)
def mock_db_path(monkeypatch, tmp_path):
    """Create a temporary database file and mock the db_path in the db module"""
    db_file = tmp_path / "test.db"
    monkeypatch.setattr('db.db_path', str(db_file))
    return str(db_file)

@pytest.fixture
def test_db(mock_db_path):
    """Create a temporary test database with required tables and test data"""
    conn = sqlite3.connect(mock_db_path)
    conn.row_factory = sqlite3.Row
    
    # Create required tables
    conn.execute("""
        CREATE TABLE IF NOT EXISTS all_scores (
            outcome_name TEXT,
            comment TEXT
        )
    """)
    
    conn.execute("""
        CREATE TABLE IF NOT EXISTS learning_outcomes (
            outcome_id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT
        )
    """)
    
    # Insert test data
    conn.execute("INSERT INTO learning_outcomes VALUES (?, ?, ?)", 
                (TEST_OUTCOME_ID, TEST_OUTCOME, TEST_DESCRIPTION))
    
    conn.execute("INSERT INTO all_scores VALUES (?, ?)", 
                (TEST_OUTCOME, "First comment"))
    conn.execute("INSERT INTO all_scores VALUES (?, ?)", 
                (TEST_OUTCOME, "Second comment"))
    
    conn.commit()
    
    yield conn
    
    conn.close()
    if os.path.exists(mock_db_path):
        os.remove(mock_db_path)

def test_create_ai_summaries_table(test_db, mock_db_path):
    """Test creation of AI summaries table"""
    create_ai_summaries_table()
    
    # Verify table exists and has correct schema
    cursor = test_db.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='all_scores_ai_summaries'
    """)
    assert cursor.fetchone() is not None
    
    # Verify columns
    cursor = test_db.execute("PRAGMA table_info(all_scores_ai_summaries)")
    columns = {row[1] for row in cursor.fetchall()}
    expected_columns = {
        'outcome_name', 'outcome_id', 'outcome_description',
        'strengths_text', 'improvement_text', 'last_updated'
    }
    assert columns == expected_columns

def test_fetch_grouped_comments(test_db, mock_db_path):
    """Test fetching and grouping comments by outcome"""
    rows = fetch_grouped_comments()
    assert len(rows) > 0
    
    outcome_name, comments = rows[0]
    assert outcome_name == TEST_OUTCOME
    assert "First comment" in comments
    assert "Second comment" in comments

def test_fetch_grouped_comments_with_limit(test_db, mock_db_path):
    """Test fetching comments with a limit"""
    # Add another outcome
    test_db.execute("INSERT INTO all_scores VALUES (?, ?)", 
                   ("Another Outcome", "Another comment"))
    test_db.commit()
    
    rows = fetch_grouped_comments(limit=1)
    assert len(rows) == 1

def test_store_summary_new(test_db, mock_db_path):
    """Test storing a new summary"""
    create_ai_summaries_table()
    
    store_summary(
        TEST_OUTCOME,
        TEST_OUTCOME_ID,
        TEST_DESCRIPTION,
        TEST_STRENGTHS,
        TEST_IMPROVEMENT
    )
    
    cursor = test_db.execute(
        "SELECT * FROM all_scores_ai_summaries WHERE outcome_name=?",
        (TEST_OUTCOME,)
    )
    row = cursor.fetchone()
    
    assert row is not None
    assert row['outcome_name'] == TEST_OUTCOME
    assert row['outcome_id'] == TEST_OUTCOME_ID
    assert row['outcome_description'] == TEST_DESCRIPTION
    assert row['strengths_text'] == TEST_STRENGTHS
    assert row['improvement_text'] == TEST_IMPROVEMENT

def test_store_summary_update(test_db, mock_db_path):
    """Test updating an existing summary"""
    create_ai_summaries_table()
    
    # Store initial summary
    store_summary(
        TEST_OUTCOME,
        TEST_OUTCOME_ID,
        TEST_DESCRIPTION,
        TEST_STRENGTHS,
        TEST_IMPROVEMENT
    )
    
    # Update with new content
    new_strengths = "Updated Strength"
    new_improvement = "Updated Improvement"
    store_summary(
        TEST_OUTCOME,
        TEST_OUTCOME_ID,
        TEST_DESCRIPTION,
        new_strengths,
        new_improvement
    )
    
    cursor = test_db.execute(
        "SELECT * FROM all_scores_ai_summaries WHERE outcome_name=?",
        (TEST_OUTCOME,)
    )
    row = cursor.fetchone()
    
    assert row['strengths_text'] == new_strengths
    assert row['improvement_text'] == new_improvement

def test_fetch_outcome_metadata(test_db, mock_db_path):
    """Test fetching outcome metadata"""
    outcome_id, description = fetch_outcome_metadata(TEST_OUTCOME)
    
    assert outcome_id == TEST_OUTCOME_ID
    assert description == TEST_DESCRIPTION

def test_fetch_outcome_metadata_nonexistent(test_db, mock_db_path):
    """Test fetching metadata for non-existent outcome"""
    outcome_id, description = fetch_outcome_metadata("Non-existent Outcome")
    
    assert outcome_id is None
    assert description is None 