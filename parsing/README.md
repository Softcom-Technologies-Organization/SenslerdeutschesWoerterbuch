# Parsing
Currently the main source is the file `ssdw-small.csv`. For the production
environment there is a file with 10x more words, but which Christian wishes to not
yet publish it on GitHub.
The file `ssdw-auflage-4.pdf` is 1 of 4 existing PDFs for the 4 additions over the
past years. For those there exists no CSV file and thus one day they have to be
parsed to be added as well. The file `pdf_parser.py` contains some sample code
which was used for a proof of concept.

## Usage
(Optional) Create a virtual Python environment.
```sh
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

Install the required packages.
```
pip install -r requirements.txt
```
Currently there are 2 working scripts.
```sh
# Script to transform the CSV file into a JSON file compatible with Elasticsearch and the setup script
python csv_to_json.py

# Script to transform the PDF file into a JSON file compatible with Elasticsearch and the setup script
python pdf_to_json.py
```

The `pdf_to_json.py` script generates Elasticsearch bulk format output and saves the output to `parsing/bulk_data.ndjson`.

## Testing
The easiest way to test your changes is to restart the setup container.
```sh
# After making changes to index.json and/or bulk_data.ndjson 
docker compose up -d setup
```
Otherwise you can directly make http calls to the Elasticsearch container which locally is exposed at `http://elasticsearch:9200`.
