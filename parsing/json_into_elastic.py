import os
import json
from dotenv import load_dotenv
from elasticsearch import Elasticsearch, helpers

# Get environment variables from .env file
load_dotenv()
proxy_url = os.getenv('PROXY_URL')
proxy_port = os.getenv('PROXY_PORT')
proxy_suffix = os.getenv('PROXY_SUFFIX')
elastic_admin_username = os.getenv('ELASTIC_ADMIN_USERNAME')
elastic_admin_password = os.getenv('ELASTIC_ADMIN_PASSWORD')
elastic_index = os.getenv('ELASTIC_INDEX')
elastic_reader_username = os.getenv('ELASTIC_READER_USERNAME')
elastic_reader_password = os.getenv('ELASTIC_READER_PASSWORD')


# Construct the Elasticsearch endpoint
elastics_endpoint = f"{proxy_url}:{proxy_port}/{proxy_suffix}"
print(f"Connecting to Elasticsearch at: {elastics_endpoint}")

# Create Elasticsearch client
client = Elasticsearch(
    elastics_endpoint,
    basic_auth=(elastic_admin_username, elastic_admin_password)
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

# Create a reader role first
try:
    client.security.put_role(
        name="dictionary_reader_role",
        body={
            "cluster": ["monitor"],
            "indices": [
                {
                    "names": [elastic_index],
                    "privileges": ["read", "view_index_metadata"]
                }
            ]
        }
    )
    print(f"Created reader role: dictionary_reader_role")
except Exception as e:
    print(f"Failed to create role: {e}")

# Then create the reader user
try:
    client.security.put_user(
        username=elastic_reader_username,
        body={
            "password": elastic_reader_password,
            "roles": ["dictionary_reader_role"],
            "full_name": "Dictionary Reader"
        }
    )
    print(f"Created reader user: {elastic_reader_username}")
except Exception as e:
    print(f"Failed to create user: {e}")