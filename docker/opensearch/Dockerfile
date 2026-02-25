FROM opensearchproject/opensearch:3.4.0
RUN /usr/share/opensearch/bin/opensearch-plugin install --batch analysis-phonetic
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot
USER nonroot