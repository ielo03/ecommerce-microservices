#!/bin/bash

# Simple script to run all unit tests

echo "Running all tests..."

echo "Testing API Gateway..."
cd api-gateway
node test.js
cd ..

echo "Testing Backend..."
cd backend
node test.js
cd ..

echo "Testing Frontend..."
cd frontend
node test.js
cd ..

echo "All tests completed."