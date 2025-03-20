FROM mcr.microsoft.com/playwright:v1.51.1-noble

# Set environment variables
ENV IS_DOCKER=true

WORKDIR /app

# Copy package files and install dependencies properly
COPY ./e2e/package.json ./e2e/package-lock.json ./
RUN npm ci

# Copy test files 
COPY ./e2e/playwright.config.ts ./
COPY ./e2e/tests ./tests

# Command to run tests
CMD ["npx", "playwright", "test"]