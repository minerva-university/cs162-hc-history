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

def test_run_ai_setup(monkeypatch, capsys):
    calls = []
    def fake_run_command(command):
        calls.append(command)
    monkeypatch.setattr(setup, "run_command", fake_run_command)
    
    setup.run_ai_setup()
    
    # Updated to match the new implementation that calls main.py
    expected_calls = [
        ["python3", "ai-summary/main.py"]
    ]
    assert calls == expected_calls
    captured = capsys.readouterr().out
    assert "🚀 Running AI summary generation..." in captured

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
# Updated to test the new frontend setup process

def test_run_frontend(monkeypatch, capsys):
    # Track command calls
    run_command_calls = []
    def fake_run_command(command):
        run_command_calls.append(command)
    monkeypatch.setattr(setup, "run_command", fake_run_command)
    
    # Track Popen calls
    popen_calls = []
    def fake_popen(args, **kwargs):
        popen_calls.append((args, kwargs))
        return None
    monkeypatch.setattr(subprocess, "Popen", fake_popen)
    
    # Mock os.path.exists for .next and node_modules checks
    exists_calls = []
    def fake_exists(path):
        exists_calls.append(path)
        # Simulate both directories exist to test removal
        return '.next' in path or 'node_modules' in path
    monkeypatch.setattr(os.path, "exists", fake_exists)
    
    # Mock os.getcwd
    monkeypatch.setattr(os, "getcwd", lambda: "/fake/path")
    
    # Force platform.system() to return "Darwin" for this test
    monkeypatch.setattr(platform, "system", lambda: "Darwin")
    
    # Run the function
    setup.run_frontend()
    
    # Verify output messages
    captured = capsys.readouterr().out
    assert "🚀 Starting frontend setup..." in captured
    assert "🧹 Cleaning previous builds..." in captured
    assert "📦 Installing dependencies and building..." in captured
    assert "🚀 Starting production server in a new console window..." in captured
    
    # Verify the right commands were called for cleaning
    assert any(cmd[0] == 'rm' and '.next' in cmd[2] for cmd in run_command_calls)
    assert any(cmd[0] == 'rm' and 'node_modules' in cmd[2] for cmd in run_command_calls)
    
    # Verify npm commands were called
    assert any(cmd[0] == 'npm' and cmd[1] == 'install' for cmd in run_command_calls)
    assert any(cmd[0] == 'npm' and cmd[1] == 'run' and cmd[2] == 'build' for cmd in run_command_calls)
    
    # Verify terminal was launched with osascript (for macOS)
    assert any(isinstance(args, list) and args and args[0] == 'osascript' for args, _ in popen_calls)

# Test for Windows platform
def test_run_frontend_windows(monkeypatch, capsys):
    # Mock necessary functions
    monkeypatch.setattr(setup, "run_command", lambda cmd: None)
    popen_calls = []
    def fake_popen(args, **kwargs):
        popen_calls.append((args, kwargs))
        return None
    monkeypatch.setattr(subprocess, "Popen", fake_popen)
    monkeypatch.setattr(os.path, "exists", lambda path: False)  # Skip cleanup
    monkeypatch.setattr(os, "getcwd", lambda: "/fake/path")
    monkeypatch.setattr(platform, "system", lambda: "Windows")
    
    setup.run_frontend()
    
    # Verify Windows-specific command was used
    assert any(isinstance(args, str) and 'start cmd' in args for args, kwargs in popen_calls)
    assert any('shell' in kwargs and kwargs['shell'] is True for args, kwargs in popen_calls)

# Test for Linux platform
def test_run_frontend_linux(monkeypatch, capsys):
    # Mock necessary functions
    monkeypatch.setattr(setup, "run_command", lambda cmd: None)
    popen_calls = []
    def fake_popen(args, **kwargs):
        popen_calls.append((args, kwargs))
        return None
    monkeypatch.setattr(subprocess, "Popen", fake_popen)
    monkeypatch.setattr(os.path, "exists", lambda path: False)  # Skip cleanup
    monkeypatch.setattr(os, "getcwd", lambda: "/fake/path")
    monkeypatch.setattr(platform, "system", lambda: "Linux")
    
    setup.run_frontend()
    
    # Verify Linux-specific command was used
    assert any(isinstance(args, list) and args and args[0] == 'gnome-terminal' for args, kwargs in popen_calls)

# --- Tests for main() ---
# Testing main() requires faking several functions to avoid side effects.
# We test two paths: one where data.db is missing (causing sys.exit) and one "successful" branch.

def test_main_missing_data_db(monkeypatch, capsys):
    # Simulate that the ./backend/data.db file is missing.
    def fake_exists(path):
        if path == "requirements.txt":
            return False  # Skip dependency installation
        return False  # All other files don't exist
    monkeypatch.setattr(os.path, "exists", fake_exists)
    
    # Mock run_command to avoid actual command execution
    monkeypatch.setattr(setup, "run_command", lambda cmd: None)
    
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
        if path in ["./backend/data.db", ".env"]:  # <- Add .env
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
    monkeypatch.setattr(subprocess, "run", lambda cmd, **kwargs: None)
    
    # Run main() which should complete without sys.exit.
    setup.main()
    captured = capsys.readouterr().out
    # Check that key prints occur.
    assert "🚀 Running backend/scrape.py..." in captured