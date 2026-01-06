FROM mcr.microsoft.com/playwright:v1.57.0-noble

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
CMD ["sh", "-c", "npx playwright test && exit $?"]