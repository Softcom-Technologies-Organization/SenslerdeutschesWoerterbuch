# Getting Started
The application consists of multiple more or less independent parts. For each part you can find more detailed information in the Markdown files inside the directories.

## Architecture Overview

### Frontend
Angular with Angular Material is used for the Frontend. See `./frontend/`.

### Reverse Proxy & Routing
Traefik is used as a reverse proxy to:
- Serve the frontend application
- Route API requests to the backend
- Handle domain-based routing (backend.localhost, frontend.localhost)
- Manage SSL/TLS certificates in production

### Backend
Django is used for the admin interface and API. See `./admin-app/`.

### Search & Data Storage
OpenSearch is used for full-text search and document storage. PostgreSQL is used for relational data. Both are automatically initialized when services start.

### Parsing
The data for the dictionary is only available as semi-structured CSV or PDFs used for printing. Python scripts are used to parse those files to make them compatible and searchable with OpenSearch. [Read more](./parsing/README.md)

## Testing
Angular unit tests can be run normally. Just make sure you have Chrome available.
```
cd frontend
ng test
```

E2e tests are using Playwright.
```
cd e2e
npm install
npx playwright install --with-deps
npx playwright test
```

If running the local docker setup, use the following command.
```
docker compose --profile test run --rm e2e
```

GitHub Actions are used to run the tests automatically. To test and debug them locally we suggest using https://github.com/nektos/act. After downloading the binary you can use it with a simple command.
```
bin/act --secret-file .env
```

## Deploying

**Important**: For now the target infrastructure is not fully available. Manual deployments are currently in progress. If you need to deploy, create an issue to request permissions.

### Build and Push Images to Azure Container Registry

First, authenticate with the registry:
```
az acr login --name seislerduetscheswoerterbuech
```

Build the container images:
```
docker build -t seislerduetscheswoerterbuech.azurecr.io/opensearch:latest -f docker/opensearch/Dockerfile . --no-cache
docker build -t seislerduetscheswoerterbuech.azurecr.io/django:latest -f docker/admin-app/Dockerfile . --no-cache
docker build -t seislerduetscheswoerterbuech.azurecr.io/frontend:latest -f docker/public-app/Dockerfile . --no-cache
```

Push the images:
```
docker push seislerduetscheswoerterbuech.azurecr.io/opensearch:latest
docker push seislerduetscheswoerterbuech.azurecr.io/django:latest
docker push seislerduetscheswoerterbuech.azurecr.io/frontend:latest
```

### Update the Container App

```
az containerapp update \
  --resource-group rg-SeislerdeutschesWoerterbuech-prod \
  --name wb-test \
  --yaml containerapp-deploy.yaml
```