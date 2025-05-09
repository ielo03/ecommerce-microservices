#!/bin/bash

# Stop and remove any existing containers
echo "Stopping and removing existing containers..."
docker stop mysql frontend backend api-gateway 2>/dev/null || true
docker rm mysql frontend backend api-gateway 2>/dev/null || true

# Create a Docker network
echo "Creating Docker network..."
docker network create --driver bridge app-network 2>/dev/null || true

# Run MySQL
echo "Starting MySQL..."
docker run -d \
  --name mysql \
  --platform linux/amd64 \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=notes_app \
  --network app-network \
  mysql:8.0

# Wait for MySQL to start
echo "Waiting for MySQL to start..."
sleep 10

# Run Backend
echo "Starting Backend..."
docker run -d \
  --name backend \
  --platform linux/amd64 \
  -p 8082:8082 \
  -e NODE_ENV=production \
  -e PORT=8082 \
  -e HOST=0.0.0.0 \
  -e DB_HOST=mysql \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=notes_app \
  --network app-network \
  $(docker build -q ./backend)

# Run Frontend
echo "Starting Frontend..."
docker run -d \
  --name frontend \
  --platform linux/amd64 \
  -p 8081:8081 \
  -e NODE_ENV=production \
  -e PORT=8081 \
  -e HOST=0.0.0.0 \
  --network app-network \
  $(docker build -q ./frontend)

# Wait for Backend and Frontend to start
echo "Waiting for Backend and Frontend to start..."
sleep 5

# Run API Gateway
echo "Starting API Gateway..."
docker run -d \
  --name api-gateway \
  --platform linux/amd64 \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e HOST=0.0.0.0 \
  -e FRONTEND_HOST=frontend \
  -e BACKEND_HOST=backend \
  -e FRONTEND_PORT=8081 \
  -e BACKEND_PORT=8082 \
  --network app-network \
  $(docker build -q ./api-gateway)

echo "All services started. You can access the API Gateway at http://localhost:8080"
echo "To view logs, use: docker logs -f [container_name]"
echo "To stop all services, use: docker stop mysql frontend backend api-gateway"