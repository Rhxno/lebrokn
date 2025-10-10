@echo off
echo ========================================
echo Quick Git Push Script
echo ========================================
echo.

REM Add all changes
echo Adding all changes...
git add -A

REM Check if there are changes to commit
git diff-index --quiet HEAD --
if %errorlevel% equ 0 (
    echo No changes to commit.
    pause
    exit /b 0
)

REM Commit with timestamp
echo Committing changes...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
git commit -m "Auto update %mydate% %mytime%"

REM Push to GitHub
echo Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Successfully pushed to GitHub!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Error: Failed to push to GitHub
    echo ========================================
)

echo.
pause
