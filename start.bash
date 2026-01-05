# !/bin/bash

# Start Qdrant vector database in a Docker container
docker start -p 6333:6333 --name notebook_db qdrant/qdrant:latest &

# start backend server
cd nanobook-backend
# python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/app.py &
deactivate
cd ..

# start frontend server
cd nanobook-frontend
npm install
npm run dev