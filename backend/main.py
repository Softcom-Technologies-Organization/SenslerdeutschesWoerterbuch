import json
import os
import logging
from fastapi import FastAPI
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
import subprocess
logging.basicConfig(level=logging.ERROR)
load_dotenv()

ELASTIC_URL = os.getenv("ELASTIC_URL", "http://localhost:9200")
ELASTIC_ADMIN_USERNAME = os.getenv("ELASTIC_ADMIN_USERNAME", "elastic")
ELASTIC_ADMIN_PASSWORD = os.getenv("ELASTIC_ADMIN_PASSWORD", "newpasswordwrong")
ELASTIC_INDEX = os.getenv("ELASTIC_INDEX", "dictionary")
ELASTIC_READER_USERNAME = os.getenv("ELASTIC_READER_USERNAME", "dictionary_reader")
ELASTIC_READER_PASSWORD = os.getenv("ELASTIC_READER_PASSWORD", "thisisgonnabepublic")

# Config variables
script_directory = os.path.dirname(os.path.abspath(__file__))
INDEX_CONFIG_PATH = os.path.join(script_directory, "index.json")
BULK_DATA_PATH = os.path.join(script_directory, "bulk_data.ndjson")
ELASTIC_READER_ROLE = "dictionary_reader_role"

client = Elasticsearch(ELASTIC_URL, basic_auth=(ELASTIC_ADMIN_USERNAME, ELASTIC_ADMIN_PASSWORD))

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/elastic-health")
def elastic_health():
    res = client.cluster.health()
    return {"elastic health": res}

# Should be a POST request but for the moment it is easier to use GET to invoke with browser
@app.get("/elastic-reset")
def elastic_reset():
    result = {}
    try:
        # Delete index if it already exists for ease of re-creation
        if client.indices.exists(index=ELASTIC_INDEX):
            delete_response = client.indices.delete(index=ELASTIC_INDEX)
            result["delete_result"] = delete_response

        # Create index based on the config file
        try:
            with open(INDEX_CONFIG_PATH, "r") as f:
                index_config = json.load(f)
                create_response = client.indices.create(
                    index=ELASTIC_INDEX, body=index_config
                )
                result["create_result"] = create_response
        except FileNotFoundError:
            return {
                "status": "error",
                "message": f"Index config file not found at {INDEX_CONFIG_PATH}",
            }

        # Import base data from the bulk file
        try:
            with open(BULK_DATA_PATH, "r") as f:
                bulk_response = client.bulk(body=f.read())
                result["bulk_result"] = {
                    "took": bulk_response.get("took"),
                    "errors": bulk_response.get("errors"),
                    "item_count": len(bulk_response.get("items", [])),
                }
        except FileNotFoundError:
            return {
                "status": "error",
                "message": f"Bulk data file not found at {BULK_DATA_PATH}",
            }
            
        # Create role to read public index
        role_response = client.security.put_role(
            name=ELASTIC_READER_ROLE,
            body={
                "cluster": ["monitor"],
                "indices": [
                    {
                        "names": [ELASTIC_INDEX],
                        "privileges": ["read", "view_index_metadata"]
                    }
                ]
            }
        )
        result["role_result"] = role_response
        
        # Create user with role
        user_response = client.security.put_user(
            username=ELASTIC_READER_USERNAME,
            body={
                "password": ELASTIC_READER_PASSWORD,
                "roles": [ELASTIC_READER_ROLE],
                "full_name": "Dictionary Reader"
            }
        )
        result["user_result"] = user_response

        return {
            "status": "success",
            "message": "Elastic reset successfully",
            "details": result,
        }

    except Exception as e:
        logging.error("An error occurred during the elastic reset process", exc_info=True)
        return {"status": "error", "message": "An internal error has occurred!"}
