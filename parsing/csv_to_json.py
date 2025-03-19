import csv
import json

data = []
fieldnames = ["term", "description", "sources"]

with open('ssdw-small.csv', 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file, fieldnames=fieldnames)
    for row in csv_reader:
        data.append(row)

with open('ssdw-small.json', 'w', encoding='utf-8') as json_file:
    json_file.write(json.dumps(data, ensure_ascii=False, indent=4))