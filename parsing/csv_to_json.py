import csv
import json

# Input and output files
input_file = 'ssdw-full.csv'
json_output = 'ssdw-full.json'  # Keep original output for compatibility
curse_tags = 'tags/curse-words.json'

fieldnames = ["term", "description", "sources"]

# Load curse words from JSON
with open(curse_tags, 'r', encoding='utf-8') as curse_file:
    curse_words = set(json.load(curse_file))

# Read CSV and store data
data = []
with open(input_file, 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file, fieldnames=fieldnames)
    for row in csv_reader:
        term = row["term"].strip()
        row["tags"] = []

        if term in curse_words:
            row["tags"].append("curse-word")

        data.append(row)

# Generate standard JSON (keep this for compatibility)
with open(json_output, 'w', encoding='utf-8') as json_file:
    json_file.write(json.dumps(data, ensure_ascii=False, indent=4))
    print(f"Generated standard JSON file: {json_output} with {len(data)} entries")
