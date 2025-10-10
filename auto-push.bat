@echo off
echo ========================================
echo Auto Git Push (Every 5 minutes)
echo ========================================
echo.
echo This will automatically commit and push changes every 5 minutes.
echo Press Ctrl+C to stop.
echo.
pause

:loop
echo.
echo [%date% %time%] Checking for changes...

REM Add all changes
git add -A

REM Check if there are changes
git diff-index --quiet HEAD --
if %errorlevel% neq 0 (
    echo Changes detected, committing...
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
    git commit -m "Auto update %mydate% %mytime%"
    
    echo Pushing to GitHub...
    git push origin main
    
    if %errorlevel% equ 0 (
        echo Successfully pushed to GitHub!
    ) else (
        echo Error: Failed to push to GitHub
    )
) else (
    echo No changes detected.
)

REM Wait 5 minutes (300 seconds)
echo Waiting 5 minutes before next check...
timeout /t 300 /nobreak >nul

goto loop
