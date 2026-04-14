# Seislerdütsches Wörterbuech

The goal of this project is to create a digital version of the popular book. It is not intended to replace the print version but rather to offer additional features and help to print future versions.

Ja, as weri passend ù witzig di ganzi Dokumentation ùf Seislerdütsch z mache. Aber fǜr möglichst offe z syy, isch Englisch awä glych di besseri Wau. 😉

## Prerequisites

Before you start, make sure the following tools are available:

- Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- `docker compose` command available in your terminal (verify with: `docker compose --version`)
- At least 4GB RAM available for Docker (8GB+ recommended)
- Optional but recommended for the fastest setup: Visual Studio Code + Dev Containers extension (`ms-vscode-remote.remote-containers`)

## Initial Setup

After cloning the repository, create a `.env` file from the defaults:

```shell
cp .env.defaults .env
```

The `.env` file contains all necessary configuration, including the OpenSearch admin password (`OPENSEARCH_ADMIN_PASSWORD`) and domain settings for local development (defaults: `backend.localhost` and `frontend.localhost`).

## Quick start with Dev Containers (recommended)

If you use VS Code, this is usually the quickest way to start because the workspace is preconfigured:

- Open this repository in VS Code
- Install the **Dev Containers** extension (`ms-vscode-remote.remote-containers`) if it is not already installed
- Hit `F1` and run **Dev Containers: Reopen in Container** from the Command Palette
- Continue with the steps below to start the services

## Quick start

Now you can run everything locally with Docker:

```shell
docker compose up
```

The first startup will take **2-5 minutes** to download and build all container images. You'll know all services are ready when you see messages like:
- `opensearch_1 | Node is initialized`

Once ready, you can access the application in your browser:

- **Frontend (Search)**: http://frontend.localhost/search
- **Backend Admin**: http://backend.localhost/admin
- **Traefik Dashboard** (for debugging): http://localhost:8080/dashboard

> **Note for Windows/macOS users**: If the `*.localhost` domains don't resolve, fix local hostname resolution (for example, by adding the entries to your hosts file). See [Troubleshooting](#troubleshooting) for details.

All services are automatically initialized (migrations, database setup, etc.) when first started.

### Data Import (First Time Only)

The dictionary data must be imported and synced once after the first start:

1. Log in to the backend admin at **http://backend.localhost/admin**
   - **Default username**: `admin`
   - **Default password**: Check your `.env` file for `DJANGO_SUPERUSER_PASSWORD` (default is `ChangeMeInProduction!`)
2. Go to **http://backend.localhost/admin/dictionary/word/**
3. Click **IMPORT WORDS** in the top-right corner — this saves the words to the database
4. Click **SYNC SEARCH** in the top-right corner — this syncs the words to OpenSearch so they are searchable in the frontend

To verify everything works, open **http://frontend.localhost/search** — you should see words and be able to search or filter by tags.

## Troubleshooting

### Localhost domains not resolving (*.localhost)

This project uses Traefik host-based routing, so hostnames must resolve locally.

1. Check `.env` for `FRONTEND_DOMAIN` and `BACKEND_DOMAIN` (defaults: `frontend.localhost`, `backend.localhost`).
2. Add matching hosts entries:

   ```text
   127.0.0.1 frontend.localhost
   127.0.0.1 backend.localhost
   ```

3. Open:
   - `http://frontend.localhost/search`
   - `http://backend.localhost/admin`

Notes:
- `http://127.0.0.1/...` is not a reliable fallback here, because Traefik routes by hostname.
- On macOS, Docker Desktop 4.48.0 had a DNS regression (`https://github.com/docker/for-mac/issues/7786`); update to 4.49.0+ if needed.

### Port already in use

If you get errors like "Port 80 is already in use" or "Address already in use":

```shell
# Stop all containers
docker compose down

# Stop only the conflicting service (replace SERVICE_NAME):
docker compose stop SERVICE_NAME

# Or restart Docker to release all ports
```

If the port is still in use afterwards, the conflict is likely caused by a native service running on your machine instead of another container.

This project binds the host ports `80`, `443`, and `8080`, so check whether one of those is already occupied.

**macOS/Linux:**

```shell
lsof -i :80
lsof -i :443
lsof -i :8080
```

**Windows:**

```powershell
netstat -ano | findstr :80
netstat -ano | findstr :443
netstat -ano | findstr :8080
```

Typical causes are system web servers, reverse proxies, security software, or macOS features such as AirPlay Receiver.

You have three options:

1. Stop or disable the native service that owns the port.
2. Reconfigure that native service to use a different port.
3. Change the host-side port mapping in [docker-compose.yml](docker-compose.yml).

For example, if port `80` is occupied, you can change the Traefik mapping from `80:80` to `8081:80`, then access the app via `http://frontend.localhost:8081/search` and `http://backend.localhost:8081/admin`.

If you change `443`, update the mapping in the same way and use the new host port in your browser.

### Services fail to start

Check that you have enough disk space and RAM:

```shell
# See container logs
docker compose logs -f

# Check Docker's resource usage
docker stats
```

### Windows: Docker entrypoint fails

If the Docker services fail to start with errors related to `entrypoint.sh`, the issue is likely **line ending format**. On Windows, Git may have converted the file to CRLF (Windows line endings), but Docker containers expect LF (Unix line endings).

**Solution:**
1. Open `docker/admin-app/entrypoint.sh` in VS Code
2. Look at the bottom-right corner of the editor for the line ending indicator (shows `CRLF` or `LF`)
3. Click it and select **LF**
4. Save the file
5. Rebuild and restart: `docker compose up --build`

## Contributing

Every contribution to the project is more than welcome! 

**To start developing:**
- See the [Getting Started Guide](GETTING-STARTED.md) for architecture details and development workflows
- Check the [Issues](https://github.com/sprachlabor/seislerdeutscheswoerterbuch/issues) for bugs or feature requests to work on

**To submit changes:**
- Create a pull request with a clear description of what you've changed
- Make sure existing tests pass: `npm test` (frontend) and `npm run e2e` (end-to-end)

If you have any questions, please open an issue to ask them.