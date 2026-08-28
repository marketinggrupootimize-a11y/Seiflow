@echo off
cd /d "%~dp0"
start "" "http://127.0.0.1:8770/"
python _range_server.py 8770
