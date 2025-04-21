import pytest
from unittest.mock import Mock, patch
import sys
import os
from pathlib import Path

# Add the ai-summary directory to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent / 'ai-summary'))

import main
from main import create_ai_summaries_table, fetch_grouped_comments, store_summary

# Test data
TEST_OUTCOME = "Test Outcome"
TEST_COMMENTS = "Test comment 1\nTest comment 2"
TEST_STRENGTHS = "Test strength"
TEST_IMPROVEMENT = "Test improvement"

@pytest.fixture
def mock_db_functions():
    """Mock database functions"""
    with patch('main.create_ai_summaries_table') as mock_create, \
         patch('main.fetch_grouped_comments') as mock_fetch, \
         patch('main.fetch_outcome_metadata') as mock_metadata, \
         patch('main.store_summary') as mock_store:
        
        mock_fetch.return_value = [(TEST_OUTCOME, TEST_COMMENTS)]
        mock_metadata.return_value = (1, "Test Description")
        
        yield {
            'create': mock_create,
            'fetch': mock_fetch,
            'metadata': mock_metadata,
            'store': mock_store
        }

@pytest.fixture
def mock_openai():
    """Mock OpenAI API"""
    with patch('main.openai') as mock_openai, \
         patch('main.generate_summary_parts') as mock_generate:
        
        mock_generate.return_value = (TEST_STRENGTHS, TEST_IMPROVEMENT)
        
        yield {
            'client': mock_openai,
            'generate': mock_generate
        }

def test_main_creates_table(mock_db_functions, mock_openai):
    """Test that main creates the AI summaries table"""
    with patch('sys.argv', ['main.py']):
        main.main()
    
    mock_db_functions['create'].assert_called_once()

def test_main_fetches_comments(mock_db_functions, mock_openai):
    """Test that main fetches comments from the database"""
    with patch('sys.argv', ['main.py']):
        main.main()
    
    mock_db_functions['fetch'].assert_called_once()
    assert mock_db_functions['fetch'].call_args[0][0] is None  # default limit

def test_main_with_limit(mock_db_functions, mock_openai):
    """Test that main respects the --limit argument"""
    with patch('sys.argv', ['main.py', '--limit', '5']):
        main.main()
    
    mock_db_functions['fetch'].assert_called_once_with(5)

def test_main_generates_summaries(mock_db_functions, mock_openai):
    """Test that main generates summaries for each outcome"""
    with patch('sys.argv', ['main.py']):
        main.main()
    
    mock_openai['generate'].assert_called_once()
    args = mock_openai['generate'].call_args[0]
    assert args[1] == TEST_OUTCOME  # outcome_name
    assert args[3] == TEST_COMMENTS  # comments

def test_main_stores_summaries(mock_db_functions, mock_openai):
    """Test that main stores generated summaries"""
    with patch('sys.argv', ['main.py']):
        main.main()
    
    mock_db_functions['store'].assert_called_once_with(
        TEST_OUTCOME, 1, "Test Description", TEST_STRENGTHS, TEST_IMPROVEMENT
    )

def test_main_handles_empty_comments(mock_db_functions, mock_openai):
    """Test that main skips empty or short comments"""
    mock_db_functions['fetch'].return_value = [(TEST_OUTCOME, "   ")]
    
    with patch('sys.argv', ['main.py']):
        main.main()
    
    mock_openai['generate'].assert_not_called()
    mock_db_functions['store'].assert_not_called()

def test_main_handles_long_comments(mock_db_functions, mock_openai):
    """Test that main skips comments that are too long"""
    mock_db_functions['fetch'].return_value = [(TEST_OUTCOME, "x" * 13000)]
    
    with patch('sys.argv', ['main.py']):
        main.main()
    
    mock_openai['generate'].assert_not_called()
    mock_db_functions['store'].assert_not_called()

def test_main_handles_generation_error(mock_db_functions, mock_openai):
    """Test that main handles errors during summary generation"""
    mock_openai['generate'].side_effect = Exception("API Error")
    
    with patch('sys.argv', ['main.py']):
        main.main()  # Should not raise exception
    
    mock_db_functions['store'].assert_not_called()

def test_main_handles_no_rows(mock_db_functions, mock_openai):
    """Test that main handles case when no rows are found"""
    mock_db_functions['fetch'].return_value = []
    
    with patch('sys.argv', ['main.py']):
        main.main()
    
    mock_openai['generate'].assert_not_called()
    mock_db_functions['store'].assert_not_called() 