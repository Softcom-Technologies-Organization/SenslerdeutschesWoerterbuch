import pdfplumber
import json


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
                        if current_text_block:  # Save previous entry
                            entries[current_keyword] = {
                                "formatted-text": current_text_block,
                                "text": " ".join(
                                    [block["text"] for block in current_text_block]
                                ),
                            }
                        current_text_block = []
                        current_keyword = text
                        last_word_was_keyword = True
                        continue

                    # is still current keyword as it is a continuation of the previous word
                    if last_word_was_keyword and "Bold" in font:
                        current_keyword += text
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
                entries[current_keyword] = current_text_block

        return entries

    @staticmethod
    def _is_keyword(word, font):
        """
        Determine if a bold word is likely to be a headword rather than
        a bold word inside a description.
        """
        # all keywords are bold
        if not "Bold" in font:
            return False

        # Check if coordinate of beginning of word x0 is at the start of a column
        column_start_coordinates = [59, 265, 549, 756]
        for column_start in column_start_coordinates:
            if word["x0"] > column_start and word["x0"] < column_start + 1:
                return True

        return False

    @staticmethod
    def save_json(output_path, entries):
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)


def main():
    parser = DictionaryParser("./resources/neue-woerter-auflage-4.pdf", start_page=20)
    entries = parser.parse_pdf()
    parser.save_json("./resources/dictionary_entries.json", entries)


if __name__ == "__main__":
    main()
