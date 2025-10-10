@echo off
echo ========================================
echo Git Push with Custom Message
echo ========================================
echo.

REM Add all changes
git add -A

REM Check if there are changes
git diff-index --quiet HEAD --
if %errorlevel% equ 0 (
    echo No changes to commit.
    pause
    exit /b 0
)

REM Ask for commit message
set /p message="Enter commit message: "

if "%message%"=="" (
    echo Error: Commit message cannot be empty
    pause
    exit /b 1
)

REM Commit and push
git commit -m "%message%"
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo Successfully pushed to GitHub!
) else (
    echo.
    echo Error: Failed to push to GitHub
)

echo.
pause
