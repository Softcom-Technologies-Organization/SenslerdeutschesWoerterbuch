import json
import os
import time
from django.core.management.base import BaseCommand
from django.conf import settings
from opensearchpy import OpenSearch
from opensearchpy.exceptions import ConnectionError

class Command(BaseCommand):
    help = 'Initialize OpenSearch indices, roles, and users'

    def handle(self, *args, **options):
        # 1. Configuration
        HOST = os.getenv('OPENSEARCH_HOST', 'opensearch')
        URL = f"http://{HOST}:9200"
        AUTH = ('admin', os.getenv('OPENSEARCH_ADMIN_PASSWORD', 'ComplexPassword123!'))
        
        INDEX_NAME = os.getenv('ELASTIC_INDEX', 'dictionary')
        READER_USER = os.getenv('ELASTIC_READER_USERNAME', 'dictionary_reader')
        READER_PASS = os.getenv('ELASTIC_READER_PASSWORD', 'public_read_pass')
        READER_ROLE = "dictionary_reader_role"

        # Paths to your config files (assuming they are in dictionary/search_config/)
        BASE_DIR = settings.BASE_DIR
        INDEX_CONFIG = BASE_DIR / 'dictionary' / 'search_config' / 'index.json'
        BULK_DATA = BASE_DIR / 'dictionary' / 'search_config' / 'bulk_data.ndjson'

        self.stdout.write(f"Connecting to OpenSearch at {URL}...")
        
        # 2. Wait for Connection
        client = OpenSearch(hosts=[URL], http_auth=AUTH)
        for i in range(30):
            try:
                if client.ping():
                    break
            except Exception:
                pass
            time.sleep(2)
            self.stdout.write(f"Waiting for OpenSearch... ({i+1}/30)")
        else:
            self.stdout.write(self.style.ERROR("Could not connect to OpenSearch."))
            return

        # 3. Reset Index
        if client.indices.exists(index=INDEX_NAME):
            self.stdout.write(f"Deleting existing index '{INDEX_NAME}'...")
            client.indices.delete(index=INDEX_NAME)

        if os.path.exists(INDEX_CONFIG):
            with open(INDEX_CONFIG, 'r') as f:
                config = json.load(f)
            client.indices.create(index=INDEX_NAME, body=config)
            self.stdout.write(self.style.SUCCESS(f"Created index '{INDEX_NAME}'"))

        # 4. Bulk Import
        if os.path.exists(BULK_DATA):
            self.stdout.write("Importing bulk data...")
            with open(BULK_DATA, 'r') as f:
                data = f.read()
            # Note: error handling omitted for brevity, check 'errors' key in response
            client.bulk(body=data) 
            self.stdout.write(self.style.SUCCESS("Bulk data imported."))

        # 5. Security: Create Role (OpenSearch API)
        # OpenSearch stores security settings in a different plugin endpoint than Elastic
        role_body = {
            "cluster_permissions": ["cluster_composite_ops_ro"],
            "index_permissions": [{
                "index_patterns": ["dictionary*"],
                "allowed_actions": [
                    "read",
                    "indices:data/read/*"
                ]
            }]
        }
        try:
            client.security.create_role(role=READER_ROLE, body=role_body)
            self.stdout.write(self.style.SUCCESS(f"Role '{READER_ROLE}' updated."))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Role creation warning: {e}"))

        # 6. Security: Create User
        user_body = {
            "password": READER_PASS,
            "backend_roles": [READER_ROLE]
        }
        try:
            client.security.create_user(username=READER_USER, body=user_body)
            self.stdout.write(self.style.SUCCESS(f"User '{READER_USER}' updated."))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"User creation warning: {e}"))

        mapping_body = {
            "users": ["dictionary_reader"],
            "backend_roles": []
        }
        try:
            client.transport.perform_request(
                'PUT',
                '/_plugins/_security/api/rolesmapping/dictionary_reader_role',
                body=mapping_body
            )
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Mapping warning (might already exist): {e}"))

        # D. Flush Cache to apply changes immediately
        client.transport.perform_request('DELETE', '/_plugins/_security/api/cache')
        
        self.stdout.write(self.style.SUCCESS('Successfully initialized OpenSearch!'))