import math
import re
import pdfplumber
import json
from elasticsearch import Elasticsearch, helpers
from dotenv import dotenv_values


class DictionaryParser:
    def __init__(self, pdf_path, start_page=0, end_page=-1):
        self.pdf_path = pdf_path
        self.start_page = start_page
        self.end_page = end_page

    def parse_pdf(self):
        entries = {}

        with pdfplumber.open(self.pdf_path) as pdf:
            current_keyword = None
            current_text_block = None
            last_font = None
            last_size = None
            last_word_was_keyword = False
            for page in pdf.pages[self.start_page : self.end_page : 2]:
                # The content of each page seems to be duplicated over two pages, but simply with the words at different coordinates. We can skip every second page.
                words = page.extract_words(
                    extra_attrs=["fontname", "size"],
                    keep_blank_chars=True,
                    use_text_flow=True,
                )

                for word in words:
                    text = word["text"]
                    font = word.get("fontname", "")
                    size = word.get("size", 0)

                    # skip header of page
                    if word["top"] < 80:
                        continue

                    # special rules for starting page where words are starting further down in first column
                    if (
                        page.page_number == 21
                        and self._is_keyword(word, font)
                        and word["x0"] < 550
                        and word["top"] < 375
                    ):
                        continue

                    # Is new keyword ?
                    if self._is_keyword(word, font):
                        # the word cheere is not recognized properly and seems to get lost TODO: improve parsing and make it more robust
                        if current_text_block:  # Save previous entry
                            self._add_entry_to_dict(
                                entries, current_keyword, current_text_block
                            )

                        current_text_block = []
                        current_keyword = text
                        last_word_was_keyword = True
                        continue

                    # is still current keyword as it is a continuation of the previous word
                    if self._is_continuation_of_keyword(word, last_word_was_keyword):
                        current_keyword += text
                        continue

                    # skip big letter at the beginning of a new letter
                    if math.isclose(size, 18.58, abs_tol=0.1):
                        continue

                    # process normal word
                    if current_keyword:
                        if (
                            len(current_text_block) > 0
                            and font == last_font
                            and size == last_size
                        ):
                            current_text_block[-1]["text"] += text
                        else:
                            current_text_block.append(
                                {"text": text, "font": font, "size": size}
                            )
                        last_word_was_keyword = False

                    last_font = font
                    last_size = size

            # Add final entry
            if current_keyword and current_text_block:
                self._add_entry_to_dict(entries, current_keyword, current_text_block)

        return entries

    @staticmethod
    def _is_continuation_of_keyword(word, last_word_was_keyword):
        if last_word_was_keyword and "Bold" in word.get("fontname", ""):
            return True

        # if word is whitespace only and last word was a keyword, it is likely a continuation of the keyword
        if last_word_was_keyword and word["text"].isspace():
            return True

        return False

    def _add_entry_to_dict(self, entries, current_keyword, current_text_block):

        cleaned_keyword = self._clean_keyword(current_keyword)
        if cleaned_keyword in entries:
            print(f"Warning! Duplicate keyword: {cleaned_keyword}")
        self.clean_text_block(current_text_block)
        entries[cleaned_keyword] = {
            "term": cleaned_keyword,
            "formatted-description": current_text_block,
            "description": "".join([block["text"] for block in current_text_block]),
        }

    @staticmethod
    def clean_text_block(text_block):
        """
        Clean up a text block by removing unwanted characters.
        """
        if not text_block:
            return

        # Swap multiple spaces to single space
        for block in text_block:
            block["text"] = re.sub(r" {2,}", " ", block["text"])

        # Strip leading spaces
        while text_block and (
            text_block[0]["text"].startswith(" ") or not text_block[0]["text"]
        ):
            text_block[0]["text"] = text_block[0]["text"].lstrip()
            if not text_block[0]["text"]:
                text_block.pop(0)

        # Strip trailing spaces
        while text_block and (
            text_block[-1]["text"].endswith(" ") or not text_block[-1]["text"]
        ):
            text_block[-1]["text"] = text_block[-1]["text"].rstrip()
            if not text_block[-1]["text"]:
                text_block.pop(-1)

        if not text_block:
            print("Warning! Cleanup removed all text blocks.")

    @staticmethod
    def _clean_keyword(keyword):
        """
        Clean up a keyword by removing unwanted characters.
        """
        return (
            keyword.replace("*", "")
            .replace("·", "")  # middle dot
            .replace("∙", "")  # other version of middle dot (bulldet dot)
            .replace(":", "")
            .strip()
        )

    @staticmethod
    def _is_keyword(word, font):
        """
        Determine if a bold word is likely to be a headword rather than
        a bold word inside a description.
        """
        # all keywords are bold
        if not "Bold" in font:
            return False

        # all keywords are in font size 11.19 or 9.40 or 10.30
        font_sizes = [11.19, 9.40, 10.30]
        if not any(
            math.isclose(word["size"], size, abs_tol=0.1) for size in font_sizes
        ):
            return False

        # Check if coordinate of beginning of word x0 is at the start of a column
        column_start_coordinates = [59, 265, 549, 756]
        if not any(
            math.isclose(word["x0"], column_start, abs_tol=1)
            for column_start in column_start_coordinates
        ):
            return False

        # if word is whitespace only, it is not a keyword
        if word["text"].isspace():
            return False

        # All criteria met
        return True

    @staticmethod
    def save_json(output_path, entries):
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)


class ElasticHelper:
    def __init__(self, dotenv_path):
        self.es = Elasticsearch(
            [{"host": "localhost", "port": 9200, "scheme": "https"}],
            basic_auth=(
                "elastic",
                dotenv_values(dotenv_path=dotenv_path)["ELASTIC_PASSWORD"],
            ),
            verify_certs=False,
        )

    # TODO: Create this index directly when starting the elasic container
    def create_index(self, index_name="dictionary"):
        """
        Create an Elasticsearch index with custom settings and mappings to:
        - Support autocomplete with edge n-grams.
        - Apply ascii-folding and lowercasing for normalization.
        - Allow fuzzy matching and exact-match boosting.
        """
        mapping = {
            "settings": {
                "analysis": {
                    "filter": {
                        "autocomplete_filter": {
                            "type": "edge_ngram",
                            "min_gram": 1,
                            "max_gram": 20,
                        }
                    },
                    "analyzer": {
                        "autocomplete_analyzer": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": [
                                "lowercase",
                                "asciifolding",
                                "autocomplete_filter",
                            ],
                        },
                        "autocomplete_search": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase", "asciifolding"],
                        },
                    },
                    "normalizer": {
                        "lowercase_normalizer": {
                            "type": "custom",
                            "filter": ["lowercase", "asciifolding"],
                        }
                    },
                }
            },
            "mappings": {
                "properties": {
                    "term": {
                        "type": "text",
                        "analyzer": "autocomplete_analyzer",
                        "search_analyzer": "autocomplete_search",
                        "fields": {
                            "keyword": {
                                "type": "keyword",
                                "normalizer": "lowercase_normalizer",
                            }
                        },
                    },
                    "description": {"type": "text", "analyzer": "standard"},
                }
            },
        }

        if self.es.indices.exists(index=index_name):
            print(f"Index '{index_name}' already exists.")
        else:
            self.es.indices.create(index=index_name, body=mapping)
            print(f"Index '{index_name}' created.")

    def insert_into_elasticsearch(self, entries, index_name="dictionary"):
        """
        Inserts dictionary entries into Elasticsearch.

        Assumes that the 'entries' parameter is a dict where the key is the term
        and the value is a dictionary containing at least the "text" field.

        Each document is transformed into a structure with:
          - 'term': the key from the dictionary.
          - 'description': the original "text" value.
          - 'formatted-description': the original "formatted-description" value.
        """
        actions = [
            {
                "_index": index_name,
                "_source": {
                    "term": entry["term"],
                    "description": entry["description"],
                    "formatted-description": entry["formatted-description"],
                },
            }
            for entry in entries.values()
        ]
        try:
            helpers.bulk(self.es, actions)
            print("Bulk indexing successful.")
        except helpers.BulkIndexError as e:
            print("Bulk indexing error:", e)
            for error in e.errors:
                print(error)

    def delete_index(self, index_name="dictionary"):
        """
        Deletes the specified Elasticsearch index.
        """
        resp = self.es.indices.delete(
            index=index_name,
        )
        print(resp)


def main():
    parser = DictionaryParser(
        "./resources/neue-woerter-auflage-4.pdf", start_page=20, end_page=58
    )
    entries = parser.parse_pdf()
    parser.save_json("./resources/dictionary_entries.json", entries)

    elasticHelper = ElasticHelper("./docker/.env")
    elasticHelper.delete_index()
    elasticHelper.create_index()
    elasticHelper.insert_into_elasticsearch(entries)


if __name__ == "__main__":
    main()
