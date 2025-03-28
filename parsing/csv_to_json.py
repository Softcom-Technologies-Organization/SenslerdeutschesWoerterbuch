import csv
import json
import os

elastic_index = 'dictionary'

# Input and output files
input_file = 'ssdw-small.csv'
json_output = 'ssdw-small.json'  # Keep original output for compatibility
bulk_output = 'bulk_data.ndjson'  # Add new bulk format output

fieldnames = ["term", "description", "sources"]

# Read CSV and store data
data = []
with open(input_file, 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file, fieldnames=fieldnames)
    for row in csv_reader:
        data.append(row)

# Generate standard JSON (keep this for compatibility)
with open(json_output, 'w', encoding='utf-8') as json_file:
    json_file.write(json.dumps(data, ensure_ascii=False, indent=4))
    print(f"Generated standard JSON file: {json_output} with {len(data)} entries")

# Generate Elasticsearch bulk format
with open(bulk_output, 'w', encoding='utf-8') as bulk_file:
    count = 0
    for row in data:
        # Write action line
        action = {"index": {"_index": elastic_index}}
        bulk_file.write(json.dumps(action, ensure_ascii=False))
        bulk_file.write('\n')
        
        # Write document line (rename description to formatted-description)
        document = {
            "term": row["term"],
            "formatted-description": row["description"]
        }
        # Include sources if present and not empty
        if "sources" in row and row["sources"]:
            document["sources"] = row["sources"]
            
        bulk_file.write(json.dumps(document, ensure_ascii=False))
        bulk_file.write('\n')
        count += 1

    print(f"Generated Elasticsearch bulk format: {bulk_output} with {count} entries")