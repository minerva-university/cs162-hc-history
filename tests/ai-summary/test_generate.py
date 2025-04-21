import pytest
from unittest.mock import Mock, patch
import sys
import os
from pathlib import Path

# Add the ai-summary directory to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent / 'ai-summary'))

from generate import generate_summary_parts

# Sample test data
SAMPLE_OUTCOME = "Critical Thinking"
SAMPLE_DESCRIPTION = "Analyze and evaluate arguments effectively"
SAMPLE_COMMENTS = """
Great job analyzing the core arguments in your essay.
Your critical analysis needs more depth.
Excellent work identifying logical fallacies.
Try to provide more concrete examples.
"""

SAMPLE_API_RESPONSE = """
Strengths:
You demonstrated strong ability to identify logical fallacies in arguments
You showed excellent analytical skills in breaking down complex arguments

Areas for Improvement:
Practice providing more concrete examples to support your analysis
Focus on developing deeper critical analysis of arguments
Strengthen your ability to evaluate counterarguments
"""

@pytest.fixture
def mock_openai_client():
    mock_client = Mock()
    mock_client.ChatCompletion.create.return_value = Mock(
        choices=[
            Mock(
                message=Mock(
                    content=SAMPLE_API_RESPONSE
                )
            )
        ]
    )
    return mock_client

def test_generate_summary_parts_success(mock_openai_client):
    """Test successful generation of summary parts"""
    strengths, improvements = generate_summary_parts(
        mock_openai_client,
        SAMPLE_OUTCOME,
        SAMPLE_DESCRIPTION,
        SAMPLE_COMMENTS
    )
    
    # Verify the API was called with correct parameters
    mock_openai_client.ChatCompletion.create.assert_called_once()
    call_args = mock_openai_client.ChatCompletion.create.call_args[1]
    
    assert call_args['model'] == "gpt-3.5-turbo"
    assert call_args['temperature'] == 0.7
    assert call_args['max_tokens'] == 800
    
    # Verify the returned strengths and improvements
    assert "strong ability to identify logical fallacies" in strengths
    assert "excellent analytical skills" in strengths
    assert len(strengths.split('\n')) >= 2
    
    assert "Practice providing more concrete examples" in improvements
    assert "Focus on developing deeper critical analysis" in improvements
    assert len(improvements.split('\n')) >= 3

def test_generate_summary_parts_missing_sections():
    """Test handling of API response with missing sections"""
    mock_client = Mock()
    mock_client.ChatCompletion.create.return_value = Mock(
        choices=[Mock(message=Mock(content="Invalid response without sections"))]
    )
    
    with pytest.raises(ValueError) as exc_info:
        generate_summary_parts(mock_client, SAMPLE_OUTCOME, SAMPLE_DESCRIPTION, SAMPLE_COMMENTS)
    
    assert "Missing 'Strengths:' section" in str(exc_info.value)

def test_generate_summary_parts_insufficient_points():
    """Test handling of API response with insufficient points"""
    mock_client = Mock()
    mock_client.ChatCompletion.create.return_value = Mock(
        choices=[
            Mock(
                message=Mock(
                    content="""
                    Strengths:
                    Only one strength point

                    Areas for Improvement:
                    Only one improvement point
                    """
                )
            )
        ]
    )
    
    with pytest.raises(ValueError) as exc_info:
        generate_summary_parts(mock_client, SAMPLE_OUTCOME, SAMPLE_DESCRIPTION, SAMPLE_COMMENTS)
    
    assert "Not enough strength points" in str(exc_info.value)

def test_generate_summary_parts_api_error():
    """Test handling of API errors"""
    mock_client = Mock()
    mock_client.ChatCompletion.create.side_effect = Exception("API Error")
    
    with pytest.raises(Exception) as exc_info:
        generate_summary_parts(mock_client, SAMPLE_OUTCOME, SAMPLE_DESCRIPTION, SAMPLE_COMMENTS)
    
    assert "API Error" in str(exc_info.value)

def test_generate_summary_parts_clean_formatting():
    """Test that the output is properly formatted without bullets or special characters"""
    mock_client = Mock()
    mock_client.ChatCompletion.create.return_value = Mock(
        choices=[
            Mock(
                message=Mock(
                    content="""
                    Strengths:
                    • First strength
                    * Second strength
                    - Third strength

                    Areas for Improvement:
                    • First improvement
                    * Second improvement
                    - Third improvement
                    """
                )
            )
        ]
    )
    
    strengths, improvements = generate_summary_parts(
        mock_client,
        SAMPLE_OUTCOME,
        SAMPLE_DESCRIPTION,
        SAMPLE_COMMENTS
    )
    
    # Verify bullet points are removed
    assert "•" not in strengths
    assert "*" not in strengths
    assert "-" not in strengths
    assert "•" not in improvements
    assert "*" not in improvements
    assert "-" not in improvements 