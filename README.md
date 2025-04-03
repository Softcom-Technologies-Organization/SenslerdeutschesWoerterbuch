# Seislerdütsches Wörterbuech
The goal of this project is to create a digital version of the popular book. It is not intended to replace the print version but rather to offer additional features and help to print future versions.

Ja, as weri passend ù witzig di ganzi Dokumentation ùf Seislerdütsch z mache. Aber fǜr möglichst offe z syy, isch Englisch awä glych di besseri Wau. 😉

## Quick start
After cloning the repository you need to create a `.env` file.
```
cp .env.defaults .env
```
You then have to set a password for the admin user of the Elasticsearch container. You can do this by uncommenting the last line in the new `.env` file and set a password for`ELASTIC_ADMIN_PASSWORD=<password>`. 

That's it. Now you can run everything locally with Docker.
```
docker compose up elasticsearch proxy setup
```
The first time it might take a few minutes to download all the images. After everything is up and running you can access the application in your browser at `http://proxy:4202`.

## Contributing
Every contribution to the project is more than welcome! You can submit bugs or feature requests, or even contribute code. Everything is tracked as issue on the repository. Feel free to read through them and create your own.

If you want to start coding, you can find more information in the [Getting Started Guide](GETTING-STARTED.md).

If you have any questions, please use Issues to ask them.