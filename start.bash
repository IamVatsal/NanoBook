# !/bin/bash

# Start Qdrant vector database in a Docker container
docker run -p 6333:6333 --storage-path /qdrant/storage --name notebook_db qdrant/qdrant:latest &

# start backend server
cd nanobook-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 5000 &
deactivate
cd ..

# start frontend server
cd nanobook-frontend
npm install
npm run dev