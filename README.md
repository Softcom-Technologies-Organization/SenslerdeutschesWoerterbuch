# Seislerdütsches Wörterbuech

The goal of this project is to create a digital version of the popular book. It is not intended to replace the print version but rather to offer additional features and help to print future versions.

Ja, as weri passend ù witzig di ganzi Dokumentation ùf Seislerdütsch z mache. Aber fǜr möglichst offe z syy, isch Englisch awä glych di besseri Wau. 😉

## Prerequisites

Before you start, make sure the following tools are available:

- Install Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- Make sure the `docker compose` command works in your terminal
- Optional but recommended for the fastest setup: Visual Studio Code + Dev Containers extension (`ms-vscode-remote.remote-containers`)

You can verify this with:

```shell
docker compose --version
```

## Quick start with Dev Containers (recommended)

If you use VS Code, this is usually the quickest way to start because the workspace is preconfigured.

- Open this repository in VS Code
- Install the **Dev Containers** extension (`ms-vscode-remote.remote-containers`) if it is not already installed
- Hit `F1` and run **Dev Containers: Reopen in Container** from the Command Palette
- Continue with the regular **Quick start** steps below

## Quick start

After cloning the repository you need to create a `.env` file from the defaults:

```shell
cp .env.defaults .env
```

The `.env` file contains all necessary configuration, including the OpenSearch admin password (`OPENSEARCH_ADMIN_PASSWORD`) and domain settings for local development (defaults: `backend.localhost` and `frontend.localhost`).

Now you can run everything locally with Docker:

```shell
docker compose up
```

The first time it might take a few minutes to download and build all the images. Once all services are up and running, you can access the application in your browser:

- **Frontend (Search)**: http://frontend.localhost/search
- **Backend Admin**: http://backend.localhost/admin
- **Traefik Dashboard** (for debugging): http://localhost:8080/dashboard

All services are automatically initialized (migrations, database setup, etc.) when first started.

### Initial Setup

The dictionary data must be imported and synced once after the first start:

1. Log in to the backend admin at http://backend.localhost/admin (see your `.env` file for the credentials)
2. Go to http://backend.localhost/admin/dictionary/word/
3. Click **IMPORT WORDS** in the top-right corner — this saves the words to the database
4. Click **SYNC SEARCH** in the top-right corner — this syncs the words to OpenSearch so they are searchable in the frontend

To verify everything works, open http://frontend.localhost/search — you should see words and be able to search or filter by tags.

## Troubleshooting

### Windows: Docker entrypoint fails

If the Docker services fail to start with errors related to `entrypoint.sh`, the issue is likely **line ending format**. On Windows, Git may have converted the file to CRLF (Windows line endings), but Docker containers expect LF (Unix line endings).

**Solution:**
1. Open `docker/admin-app/entrypoint.sh` in VS Code
2. Look at the bottom-right corner of the editor for the line ending indicator (shows `CRLF` or `LF`)
3. Click it and select **LF**
4. Save the file
5. Rebuild and restart: `docker compose up --build`

## Contributing

Every contribution to the project is more than welcome! You can submit bugs or feature requests, or even contribute code. Everything is tracked as issue on the repository. Feel free to read through them and create your own.

If you want to start coding, you can find more information in the [Getting Started Guide](GETTING-STARTED.md).

If you have any questions, please use Issues to ask them.