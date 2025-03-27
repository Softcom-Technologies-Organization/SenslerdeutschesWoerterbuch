# Getting Started
The application consists of multiple more or less independent parts. For each part you can find more detailed information in the Makrdown files inside the directories.

## Frontend
Angular with Angular Material is used for the Frontend. `./frontend/`.

## Proxy
Nginx is used to a) serve the frontend and b) to forward requests to Elasticsearch. `./docker/proxy/`. 

## Parsing
The data for the dictionary is only available as semi-structured CSV or PDFs used for printing. Python scripts are used to parse those files to make the compatible and searchable with Elastic. [Read more](./parsing/README.md)

## Elasticsearch
Elasticsearch is used for the search as it is open source and offers many built-in tools and features. `./docker/setup/`.

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
npx playwright test
```

GitHub Actions are used to run the tests automatically. To test and debug them locally we suggest using https://github.com/nektos/act. After downloading the binary you can use it with a simple command.
```
bin/act --seceret-file .env
```