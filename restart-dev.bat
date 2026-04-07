@echo off
setlocal

call "%~dp0stop-frontend.bat"
call "%~dp0stop-dev.bat"
timeout /t 2 /nobreak >nul
call "%~dp0start-dev.bat"
call "%~dp0start-frontend.bat"

endlocal
