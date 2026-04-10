FROM mcr.microsoft.com/devcontainers/python:3.12

# Remove the Yarn repository list file to prevent apt-get update failures
# due to expired/missing GPG keys. The 'node' feature will handle Yarn installation.
RUN rm -f /etc/apt/sources.list.d/yarn.list
USER vscode