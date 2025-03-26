# Parsing
Currently the main source is the file `ssdw-small.csv`. For the production
environment there is a file with 10x the words, but which Christian wishes to not
yet publish on GitHub.
The file `ssdw-auflage-4.pdf` is 1 of 4 existing PDFs for the 4 additions over the
past years. For those there exists no CSV file and thus one day they have to be
parsed to be added as well. The file `pdf_parser.py` contains some sample code
which was used for a proof of concept.