FROM alpine:3.21.3

# Install curl for API calls
RUN apk add --no-cache curl

WORKDIR /app

# Copy configuration and data files
COPY ./parsing/index.json .
COPY ./parsing/bulk_data.ndjson .
COPY ./docker/setup/setup.sh .

# Make script executable
RUN chmod +x setup.sh

# Run setup script
CMD ["./setup.sh"]