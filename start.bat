@echo off

REM build and start the database container
start /B docker run -p 6333:6333 qdrant/qdrant:latest

REM set up and start the backend
cd nanobook-backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
start /B python src\app.py
call deactivate
cd ..

REM set up and start the frontend
cd nanobook-frontend
call npm install
call npm run dev