import os
import sys
import subprocess
import platform
import pytest

# Insert the project root into sys.path so that "setup" is importable.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the module you want to test; here your setup.py file.
import setup

# --- Tests for run_command() ---

def test_run_command_success(monkeypatch, capsys):
    # Fake subprocess.run that does not raise an exception.
    def fake_run(command, check):
        return  # Simulate a successful command execution.
    monkeypatch.setattr(subprocess, "run", fake_run)

    # Call the function.
    setup.run_command(["echo", "hello"])
    captured = capsys.readouterr().out
    assert "✅ Successfully ran: echo hello" in captured

def test_run_command_failure(monkeypatch, capsys):
    # Fake subprocess.run that raises CalledProcessError.
    def fake_run(command, check):
        raise subprocess.CalledProcessError(returncode=1, cmd=command)
    monkeypatch.setattr(subprocess, "run", fake_run)

    with pytest.raises(SystemExit) as e:
        setup.run_command(["false", "command"])
    captured = capsys.readouterr().out
    assert "❌ Error while running: false command" in captured
    assert e.value.code == 1

# --- Tests for check_data_db() ---

def test_check_data_db_exists(monkeypatch, capsys):
    # Simulate that ./backend/data.db exists.
    monkeypatch.setattr(os.path, "exists", lambda path: path == "./backend/data.db")
    result = setup.check_data_db()
    captured = capsys.readouterr().out
    assert result is True
    assert "✅ data.db file found." in captured

def test_check_data_db_not_exists(monkeypatch, capsys):
    # Simulate that no file exists.
    monkeypatch.setattr(os.path, "exists", lambda path: False)
    result = setup.check_data_db()
    captured = capsys.readouterr().out
    assert result is False
    assert "❌ data.db not found." in captured

# --- Tests for prompt_ai_summary() ---

def test_prompt_ai_summary_yes(monkeypatch):
    # Monkeypatch input() to simulate user entering "yes".
    monkeypatch.setattr("builtins.input", lambda prompt: "yes")
    assert setup.prompt_ai_summary() is True

def test_prompt_ai_summary_no(monkeypatch):
    # Monkeypatch input() to simulate user entering "no".
    monkeypatch.setattr("builtins.input", lambda prompt: "no")
    assert setup.prompt_ai_summary() is False

# --- Tests for run_ai_setup() ---
# We record the commands passed to run_command.

def test_run_ai_setup(monkeypatch):
    calls = []
    def fake_run_command(command):
        calls.append(command)
    monkeypatch.setattr(setup, "run_command", fake_run_command)
    
    setup.run_ai_setup()
    
    expected_calls = [
        ["python3", "ai-summary/setup.py", "--yes"],
        ["python3", "ai-summary/init_db.py"],
        ["python3", "ai-summary/ai_summary.py"]
    ]
    assert calls == expected_calls

# --- Tests for run_backend() ---
# We'll fake subprocess.Popen to capture the backend command and return a dummy process.

class DummyProcess:
    def wait(self):
        return "waited"

def fake_popen_backend(command):
    # Verify that the command is as expected.
    assert command == ["python3", "backend/app.py"]
    return DummyProcess()

def test_run_backend(monkeypatch, capsys):
    monkeypatch.setattr(subprocess, "Popen", fake_popen_backend)
    proc = setup.run_backend()
    captured = capsys.readouterr().out
    assert "🚀 Starting backend..." in captured
    assert isinstance(proc, DummyProcess)

# --- Tests for run_frontend() ---
# We test one branch (e.g., macOS/Darwin). Adjust similarly for Windows or Linux if needed.

def test_run_frontend_darwin(monkeypatch, capsys):
    calls = []
    def fake_popen(args, **kwargs):
        calls.append((args, kwargs))
        return None
    monkeypatch.setattr(subprocess, "Popen", fake_popen)
    # Force platform.system() to return "Darwin".
    monkeypatch.setattr(platform, "system", lambda: "Darwin")
    
    setup.run_frontend()
    # Verify that one of the calls uses 'osascript' to launch Terminal.
    found = any(isinstance(args, list) and args and args[0] == 'osascript' for args, _ in calls)
    captured = capsys.readouterr().out
    assert found, "Expected an osascript command for Darwin."
    assert "🚀 Starting frontend in a new console window..." in captured

# --- Tests for main() ---
# Testing main() requires faking several functions to avoid side effects.
# We test two paths: one where data.db is missing (causing sys.exit) and one "successful" branch.

def test_main_missing_data_db(monkeypatch, capsys):
    # Simulate that the ./backend/data.db file is missing.
    monkeypatch.setattr(os.path, "exists", lambda path: False)
    # Make prompt_ai_summary return False (won't be used because main will exit earlier).
    monkeypatch.setattr(setup, "prompt_ai_summary", lambda: False)
    with pytest.raises(SystemExit) as e:
        setup.main()
    assert e.value.code == 1
    captured = capsys.readouterr().out
    assert "❌ Exiting setup due to missing data.db file." in captured

def test_main_success(monkeypatch, capsys):
    # Simulate a successful run with data.db present and user declining AI summary.
    def fake_exists(path):
        if path == "requirements.txt":
            return False  # skip dependency installation
        if path == "./backend/data.db":
            return True
        return False
    monkeypatch.setattr(os.path, "exists", fake_exists)
    monkeypatch.setattr(setup, "run_command", lambda cmd: None)
    
    # Patch run_backend to return a dummy process (whose wait does nothing).
    class DummyProcess2:
        def wait(self):
            return
    monkeypatch.setattr(setup, "run_backend", lambda: DummyProcess2())
    # Patch run_frontend to do nothing.
    monkeypatch.setattr(setup, "run_frontend", lambda: None)
    # Simulate user input to decline AI summary.
    monkeypatch.setattr(setup, "prompt_ai_summary", lambda: False)
    # Patch subprocess.run for the dependency installation.
    monkeypatch.setattr(subprocess, "run", lambda cmd: None)
    
    # Run main() which should complete without sys.exit.
    setup.main()
    captured = capsys.readouterr().out
    # Check that key prints occur.
    assert "🚀 Running backend/setup.py..." in captured

