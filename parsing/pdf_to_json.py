import math
import re
import pdfplumber
import json
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

    @staticmethod
    def save_bulk_ndjson(output_path, entries, index_name):
        with open(output_path, "w", encoding="utf-8") as f:
            for entry in entries.values():
                action = {"index": {"_index": index_name}}
                f.write(json.dumps(action, ensure_ascii=False) + "\n")
                document = {
                    "term": entry["term"],
                    "formatted-description": entry["formatted-description"],
                }
                f.write(json.dumps(document, ensure_ascii=False) + "\n")

def main():
    parser = DictionaryParser(
        "./ssdw-auflage-4.pdf", start_page=20, end_page=58
    )
    entries = parser.parse_pdf()
    parser.save_json("./pdf_data.json", entries)
    parser.save_bulk_ndjson("./bulk_data.ndjson", entries, "dictionary")

if __name__ == "__main__":
    main()
