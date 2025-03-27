#!/bin/sh
set -e  # Exit on error

# Set variables from environment with defaults
ELASTIC_URL='http://elasticsearch:9200'
ELASTIC_INDEX=${ELASTIC_INDEX}
ELASTIC_ADMIN_USERNAME=${ELASTIC_ADMIN_USERNAME}
ELASTIC_ADMIN_PASSWORD=${ELASTIC_ADMIN_PASSWORD}
ELASTIC_READER_USERNAME=${ELASTIC_READER_USERNAME}
ELASTIC_READER_PASSWORD=${ELASTIC_READER_PASSWORD}

echo "Connecting to Elasticsearch at: $ELASTIC_URL with username: $ELASTIC_ADMIN_USERNAME and password: $ELASTIC_ADMIN_PASSWORD"

# Test connection
until curl -s -f -u "$ELASTIC_ADMIN_USERNAME:$ELASTIC_ADMIN_PASSWORD" "$ELASTIC_URL/_cluster/health"; do
  echo "Waiting for Elasticsearch..."
  sleep 2
done
echo "✅ Connected to Elasticsearch"

# Delete index if it exists
if curl -s -f -u "$ELASTIC_ADMIN_USERNAME:$ELASTIC_ADMIN_PASSWORD" "$ELASTIC_URL/$ELASTIC_INDEX" > /dev/null 2>&1; then
  echo "Deleting existing index: $ELASTIC_INDEX"
  curl -s -X DELETE -u "$ELASTIC_ADMIN_USERNAME:$ELASTIC_ADMIN_PASSWORD" "$ELASTIC_URL/$ELASTIC_INDEX"
fi

# Create index with settings
echo "Creating index with configuration..."
curl -s -X PUT -u "$ELASTIC_ADMIN_USERNAME:$ELASTIC_ADMIN_PASSWORD" "$ELASTIC_URL/$ELASTIC_INDEX" -H "Content-Type: application/json" -d @index.json

# Index documents
echo "Indexing documents..."
curl -s -X POST -u "$ELASTIC_ADMIN_USERNAME:$ELASTIC_ADMIN_PASSWORD" "$ELASTIC_URL/_bulk" -H "Content-Type: application/json" --data-binary @bulk_data.ndjson

# Create role for public user
echo "Creating reader role..."
curl -s -X PUT -u "$ELASTIC_ADMIN_USERNAME:$ELASTIC_ADMIN_PASSWORD" "$ELASTIC_URL/_security/role/dictionary_reader_role" -H "Content-Type: application/json" -d '{
  "cluster": ["monitor"],
  "indices": [
    {
      "names": ["'"$ELASTIC_INDEX"'"],
      "privileges": ["read", "view_index_metadata"]
    }
  ]
}'

# Create public user
echo "Creating public user..."
curl -s -X PUT -u "$ELASTIC_ADMIN_USERNAME:$ELASTIC_ADMIN_PASSWORD" "$ELASTIC_URL/_security/user/$ELASTIC_READER_USERNAME" -H "Content-Type: application/json" -d '{
  "password": "'"$ELASTIC_READER_PASSWORD"'",
  "roles": ["dictionary_reader_role"],
  "full_name": "Dictionary Reader"
}'

echo "✅ Setup complete!"