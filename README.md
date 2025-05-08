# Notes Microservices Application

This is a simple notes application built using a microservices architecture. It consists of three main services:

1. **API Gateway**: Routes requests to the appropriate service
2. **Backend**: Provides API for creating and retrieving notes
3. **Frontend**: Web interface for interacting with notes

## Architecture

- **API Gateway** (Port 8080): Routes frontend requests to the frontend service and `/api/*` requests to the backend service
- **Frontend** (Port 8081): Serves the web interface
- **Backend** (Port 8082): Provides the API for notes and interacts with MySQL
- **MySQL**: Stores the notes data

## Health Endpoints

Each service provides health endpoints:

- API Gateway: `/health` and `/api-gateway/health`
- Frontend: `/health`
- Backend: `/health`

The API Gateway's `/health` endpoint aggregates health information from all services.

## Running the Application

### Using Docker Compose

The easiest way to run the application is using Docker Compose:

```bash
cd /path/to/ecommerce-microservices/real
docker-compose up -d
```

This will start all services and MySQL. The application will be accessible at http://localhost:8080.

### Running Services Individually

#### API Gateway

```bash
cd api-gateway
npm install
npm start
```

#### Backend

```bash
cd backend
npm install
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

You'll also need to run MySQL separately if running services individually. Make sure to set the appropriate environment variables for the database connection:

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=password
export DB_NAME=notes_app
```

## API Endpoints

### Backend API

- `GET /notes`: Get all notes
- `POST /notes`: Create a new note
  - Request body: `{ "content": "Your note content" }`

## Development

For development, you can use the `npm run dev` script in each service, which uses nodemon to automatically restart the service when files change.

```bash
npm run dev
```
