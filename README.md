
# Streamer Container Logs

This project sets up a multi-service Docker environment for streaming and managing logs, with a Vite-based frontend and multiple backend services. Logs are stored in PostgreSQL and cached in Redis.


![Screenshot 2024-11-02 055401](https://github.com/user-attachments/assets/606b4e60-f3d3-49ff-bae4-a67f5397e82b)

## Project Structure

- **frontend**: Vite-based frontend application for displaying logs.
- **backend/service1, service2, service3**: Backend services that generate logs and communicate with Redis and PostgreSQL.
- **backend/log-stream-service**: Service responsible for streaming logs in real-time.
- **backend/worker**: Service that writes logs from Redis into PostgreSQL, with retry logic for database connectivity.
- **redis**: Redis instance used for caching log data.
- **postgres**: PostgreSQL database instance for persistent storage of logs.

## Prerequisites

- Docker and Docker Compose installed.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/streamer_container_logs.git
   cd streamer_container_logs
   ```

2. Ensure each service has its `Dockerfile` and required configuration files in place, especially in the `backend` and `frontend` directories.

3. Build and run the Docker containers:
   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build Docker images for each service.
   - Start each service in a container.
   - Expose ports as defined in `docker-compose.yml`.

## Accessing the Application

- **Frontend**: [http://localhost:80](http://localhost:80)
- **Backend Services**: 
  - Service1: [http://localhost:4000](http://localhost:4000)
  - Service2: [http://localhost:4001](http://localhost:4001)
  - Service3: [http://localhost:8000](http://localhost:8000)
- **Log Stream Service**: [http://localhost:5000](http://localhost:5000)
- **Redis**: Exposed on port `6379`
- **Postgres**: Exposed on port `5432`

## Configuration

You can modify environment variables, such as `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`, directly in the `docker-compose.yml` file.

### Frontend Configuration

The frontend is served on port `80`, mapped from Vite's default port `4173`. Ensure the `Dockerfile` includes `--host 0.0.0.0` for external access.

## Service Details

- **Redis**: Provides a cache layer for logs.
- **Postgres**: Stores application data persistently. Credentials can be modified in `docker-compose.yml`.
- **Log Writer Service**: Uses retry logic to ensure a stable connection with PostgreSQL before writing logs. The service will attempt to connect five times with a delay between retries.

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

1. **Frontend Not Accessible**: If the frontend doesn’t load on port `80`, check that `vite preview` is set to run on `0.0.0.0:4173`.
2. **Port Conflicts**: Ensure no other applications are using the ports specified in `docker-compose.yml`.
3. **Database Connection Issues**: If `log-writer` exits with a connection error, ensure `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` are consistent in both `docker-compose.yml` and backend configurations. The log-writer includes retry logic for PostgreSQL connections.

4. **Log Writer Retry Logic**: The `log-writer` service will retry connecting to PostgreSQL five times, pausing between each attempt. If the retries fail, check that the PostgreSQL container is up and running, and confirm network settings are correct.

## Additional Notes

This setup supports real-time log processing and storage using Redis for caching and PostgreSQL for persistence. Logs are published from the `log-writer` service for real-time streaming and analytics.
```

### Key Updates
- **Log Writer Service**: Mentioned retry logic and its purpose.
- **Troubleshooting**: Added a note about retry logic to help diagnose database connectivity issues.
