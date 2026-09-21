# VaultOTP Backend

A lightweight, high-performance REST API backend for the **VaultOTP** Authenticator app, written in Go. It handles the cloud synchronization of end-to-end encrypted vaults.

## Tech Stack
- **Language**: [Go](https://golang.org/)
- **Framework**: [Gin](https://gin-gonic.com/)
- **ORM**: [GORM](https://gorm.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Infrastructure**: Docker & Docker Compose

## API Endpoints

The backend exposes a simple REST API for Zero-Knowledge cloud sync. The server only stores encrypted strings (`AES-256`) and never sees the plain text secrets.

- `GET /api/ping` - Health check endpoint.
- `GET /api/sync` - Retrieve the encrypted vault payload for a specific `X-Device-ID`.
- `POST /api/sync` - Backup (upsert) an encrypted vault payload for a specific `X-Device-ID`.

## Getting Started

### Prerequisites
- Go 1.20+
- Docker & Docker Compose (for PostgreSQL)

### Running Locally (with Docker)

The easiest way to run the backend and its PostgreSQL database is via Docker Compose:

```bash
# Start the PostgreSQL database and backend server
docker-compose up -d
```

### Running Locally (Manual)

If you prefer to run the Go server manually:

1. **Start a PostgreSQL database** (Update `DATABASE_URL` in your `.env` or environment variables to point to your DB).
2. **Download dependencies**:
   ```bash
   go mod download
   ```
3. **Run the server**:
   ```bash
   go run main.go
   ```

By default, the server will start on port `8080`.

## Architecture
The backend uses a simple architecture:
- **`main.go`**: Entry point, DB connection, and router setup.
- **`models/vault.go`**: GORM models defining the database schema.
- **`controllers/syncController.go`**: Handlers for the `/api/sync` endpoints.

## Security
- **Zero-Knowledge**: The backend does NOT handle encryption or decryption. All encryption happens client-side on the mobile/web app using `crypto-js` before the payload is sent to this API.
- **CORS**: Configured to allow cross-origin requests from the React Native Web frontend.
