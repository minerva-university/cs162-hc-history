import os
import sys
import subprocess
import platform
import pytest

# Insert the project root (the directory that contains run.py) into sys.path.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the module to be tested.
import run

# --- Tests for run_command() ---

def test_run_command_success(monkeypatch, capsys):
    # Updated to accept `cwd`
    def fake_run(cmd, check, cwd=None):
        class DummyProcess:
            def __enter__(self): return self
            def __exit__(self, *args): pass
        return DummyProcess()
    monkeypatch.setattr(subprocess, "run", fake_run)

    run.run_command(["echo", "hello"])
    captured = capsys.readouterr().out
    assert "✅ Successfully ran: echo hello" in captured

def test_run_command_failure(monkeypatch, capsys):
    def fake_run(cmd, check, cwd=None):
        class DummyProcess:
            def __enter__(self): raise subprocess.CalledProcessError(1, cmd)
            def __exit__(self, *args): pass
        return DummyProcess()
    monkeypatch.setattr(subprocess, "run", fake_run)

    with pytest.raises(SystemExit) as exit_info:
        run.run_command(["false", "command"])
    captured = capsys.readouterr().out
    assert "❌ Error while running: false command" in captured
    assert exit_info.value.code == 1


# --- Tests for check_required_files() ---

def test_check_required_files_all_exist(monkeypatch, capsys):
    # Simulate that every required file exists.
    monkeypatch.setattr(os.path, "exists", lambda path: True)
    run.check_required_files()
    captured = capsys.readouterr().out
    assert "✅ All required files found." in captured

def test_check_required_files_missing(monkeypatch, capsys):
    # Simulate that no required file exists.
    monkeypatch.setattr(os.path, "exists", lambda path: False)
    with pytest.raises(SystemExit) as exit_info:
        run.check_required_files()
    captured = capsys.readouterr().out
    assert "❌ The following required files or folders are missing:" in captured
    assert exit_info.value.code == 1

# --- Tests for run_backend() ---

# Define a dummy process class to simulate the Popen object.
class DummyProcess:
    def wait(self):
        return "done"

def fake_popen_backend(cmd):
    # Verify that the backend command is as expected.
    assert cmd == ["python3", "backend/app.py"]
    return DummyProcess()

def test_run_backend(monkeypatch, capsys):
    monkeypatch.setattr(subprocess, "Popen", fake_popen_backend)
    proc = run.run_backend()
    captured = capsys.readouterr().out
    assert "🚀 Starting backend..." in captured
    assert isinstance(proc, DummyProcess)

# --- Tests for run_frontend() ---

# Test for the Darwin (macOS) branch.
def test_run_frontend_darwin(monkeypatch, capsys):
    calls = []
    def fake_popen(args, **kwargs):
        calls.append((args, kwargs))
        return None
    monkeypatch.setattr(subprocess, "Popen", fake_popen)
    monkeypatch.setattr(platform, "system", lambda: "Darwin")

    run.run_frontend()
    captured = capsys.readouterr().out
    assert "🚀 Starting frontend in a new console window..." in captured
    # Verify that an osascript call was issued.
    found = any(isinstance(args, list) and args and args[0] == 'osascript'
                for (args, kwargs) in calls)
    assert found

# Test for the Windows branch.
def test_run_frontend_windows(monkeypatch, capsys):
    calls = []
    def fake_popen(args, **kwargs):
        calls.append((args, kwargs))
        return None
    monkeypatch.setattr(subprocess, "Popen", fake_popen)
    monkeypatch.setattr(platform, "system", lambda: "Windows")
    # Force a fake current working directory.
    monkeypatch.setattr(os, "getcwd", lambda: "/fake/path")

    run.run_frontend()
    captured = capsys.readouterr().out
    assert "🚀 Starting frontend in a new console window..." in captured
    # Windows branch uses a string command.
    found = any(isinstance(args, str) and "start cmd /K npm run dev" in args
                for (args, kwargs) in calls)
    assert found

# Test for the Linux branch.
def test_run_frontend_linux(monkeypatch, capsys):
    calls = []
    def fake_popen(args, **kwargs):
        calls.append((args, kwargs))
        return None
    monkeypatch.setattr(subprocess, "Popen", fake_popen)
    monkeypatch.setattr(platform, "system", lambda: "Linux")
    monkeypatch.setattr(os, "getcwd", lambda: "/fake/path")

    run.run_frontend()
    captured = capsys.readouterr().out
    assert "🚀 Starting frontend in a new console window..." in captured
    found = any(isinstance(args, list) and args and "gnome-terminal" in args[0]
                for (args, kwargs) in calls)
    assert found

# --- Test for main() ---

def test_main_success(monkeypatch, capsys):
    """
    Simulate a successful run of main() by:
      - Faking check_required_files() to print the success message,
      - Replacing run_backend() with a fake that returns a dummy process,
      - Replacing run_frontend() with a fake that just prints a message.
    """
    # Fake check_required_files so that it does not exit and simply prints a message.
    monkeypatch.setattr(run, "check_required_files", lambda: print("✅ All required files found."))
    
    # Fake run_backend to return a dummy process that prints a message on wait().
    class DummyProcess2:
        def wait(self):
            print("Backend process finished waiting.")
    monkeypatch.setattr(run, "run_backend", lambda: DummyProcess2())
    
    # Fake run_frontend to just print a message.
    monkeypatch.setattr(run, "run_frontend", lambda: print("Frontend started."))

    # Run main(); since we faked all side effects, it should complete normally.
    run.main()
    captured = capsys.readouterr().out
    assert "✅ All required files found." in captured
    assert "Frontend started." in captured
    assert "Backend process finished waiting." in captured
