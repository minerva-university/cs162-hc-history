@echo off
cd /d %~dp0\..

echo -----------------------------------
echo   Welcome to the HC/LO Launcher
echo -----------------------------------
echo Choose an option:
echo   1. Run setup.py (first time setup)
echo   2. Run run.py (start app)
set /p choice=Enter 1 or 2: 

if "%choice%"=="1" (
    python setup.py
) else if "%choice%"=="2" (
    python run.py
) else (
    echo Invalid option.
)

pause
