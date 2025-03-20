import os
import json
from dotenv import load_dotenv
from elasticsearch import Elasticsearch, helpers

# Get environment variables from .env file
load_dotenv()
proxy_url = os.getenv('PROXY_URL')
proxy_port = os.getenv('PROXY_PORT')
proxy_suffix = os.getenv('PROXY_SUFFIX')
elastic_username = os.getenv('ELASTIC_USERNAME')
elastic_password = os.getenv('ELASTIC_PASSWORD')
elastic_index = os.getenv('ELASTIC_INDEX')

# Construct the Elasticsearch endpoint
elastics_endpoint = f"{proxy_url}:{proxy_port}/{proxy_suffix}"
print(f"Connecting to Elasticsearch at: {elastics_endpoint}")

# Create Elasticsearch client
client = Elasticsearch(
    elastics_endpoint,
    basic_auth=(elastic_username, elastic_password)
)

# Test the connection
try:
    info = client.info()
    print(f"Successfully connected to Elasticsearch: {info['version']['number']}")
except Exception as e:
    print(f"Failed to connect to Elasticsearch: {e}")

# Delete the index if it already exists for simplicity
if client.indices.exists(index=elastic_index):
    client.indices.delete(index=elastic_index)
    print(f"Deleted index: {elastic_index}")

with open('index.json', 'r') as file:
    index_config = json.load(file)

client.indices.create(index=elastic_index, body=index_config)
print(f"Created index: {elastic_index}")

with open('ssdw-small.json', 'r') as file:
    data = json.load(file)

print(f"Loaded {len(data)} entries from JSON file")

actions = []
for entry in data:
    actions.append({
        "_index": elastic_index,
        "_source": {
            "term": entry["term"],
            "formatted-description": entry["description"],
        }
    })

helpers.bulk(client, actions)
print(f"Successfully indexed {len(actions)} entries")