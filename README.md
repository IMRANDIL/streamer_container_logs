# Streamer Container Logs

This project sets up a multi-service Docker environment for streaming and managing logs, including a frontend built with Vite and several backend services.

## Project Structure

- **frontend**: Vite-based frontend application.
- **backend/service1, service2, service3**: Backend services communicating with Redis and PostgreSQL.
- **backend/log-stream-service**: A log stream service responsible for processing and managing logs.
- **redis**: Redis instance for caching.
- **postgres**: PostgreSQL instance for database storage.

## Prerequisites

- Docker and Docker Compose installed.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/streamer_container_logs.git
   cd streamer_container_logs
   ```

2. Ensure all necessary files are in place for each service, including `Dockerfile` for each backend service and `frontend`.

3. Build and run the Docker containers:
   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build images for each service.
   - Start each service in a container.
   - Expose ports as defined in `docker-compose.yml`.

## Accessing the Application

- **Frontend**: Access at [http://localhost:80](http://localhost:80).
- **Backend Services**: 
  - Service1: [http://localhost:4000](http://localhost:4000)
  - Service2: [http://localhost:4001](http://localhost:4001)
  - Service3: [http://localhost:8000](http://localhost:8000)
- **Log Stream Service**: [http://localhost:5000](http://localhost:5000)
- **Redis**: Port `6379`
- **Postgres**: Port `5432`

## Configuration

Environment variables for services (e.g., `POSTGRES_USER`, `POSTGRES_PASSWORD`) can be adjusted in `docker-compose.yml`.

### Frontend Configuration

The frontend server is configured to expose on port `80`, mapping the internal port `4173` where Vite serves the app. The Dockerfile in the frontend directory includes `--host 0.0.0.0` to allow external access.

## Service Details

- **Redis**: Serves as a cache layer to improve performance.
- **Postgres**: Stores application data, with credentials configured in `docker-compose.yml`.
- **Log Stream Service**: Manages and streams logs to be displayed in the frontend.

## Common Commands

- **View logs for all containers**:
  ```bash
  docker-compose logs -f
  ```

- **Stop all containers**:
  ```bash
  docker-compose down
  ```

- **Rebuild containers after making code changes**:
  ```bash
  docker-compose up --build
  ```

## Troubleshooting

1. **Frontend Not Accessible**: If the frontend doesn’t load on port `80`, ensure the frontend container logs show `vite preview` running on `0.0.0.0:4173`.
2. **Port Conflicts**: Make sure no other processes occupy the ports specified in `docker-compose.yml`.
3. **Database Connection Issues**: Confirm the `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` are correct in both `docker-compose.yml` and your backend configurations.

