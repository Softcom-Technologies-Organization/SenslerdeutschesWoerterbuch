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
COPY ./e2e/features ./features

# Command to run tests
CMD ["sh", "-c", "npx playwright test ; playwright_exit=$? ; npm run test ; cucumber_exit=$? ; if [ $playwright_exit -ne 0 ] || [ $cucumber_exit -ne 0 ]; then echo '❌ E2E tests failed!'; exit 1; else echo '✅ All e2e tests passed!'; exit 0; fi"]