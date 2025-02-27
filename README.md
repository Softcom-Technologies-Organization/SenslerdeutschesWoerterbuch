# Introduction

TODO: Give a short introduction of your project. Let this section explain the objectives or the motivation behind this project.

# Getting Started

1. Installation process
   - run docker-compuse up -d in the docker folder to start Elasticsearch
   - Go to kibana at http://localhost:5601/app/enterprise_search/elasticsearch to genreate an api key
   - Paste the "encoded" version of the api_key in the apiKey variable of the search.service.ts
2. Software dependencies
   - Todo
3. Latest releases
   - Todo
4. API references
   - Todo

# Build and Test

TODO: Describe and show how to build your code and run the tests.

# Contribute

TODO: Explain how other users and developers can contribute to make your code better.

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:

- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)

# Architecture

A first version uses an angular frontend directly connected to an Elasticsearch docker container

A second iteration migt introduce a lightweight backend inbetween to prevent exposing Elasticsearch to the public. Elasticsearch has documentation about how to setup this direct connection, but they also recomend at some places to use a lightweight backend to prevent the exposure of Elasticsearch to the public.

A separate database is ommited. Elasticsearch is optimized for **speed** rather than **resilience**. Typically, a second database is used as the **source of truth**, with Elasticsearch serving as a **fast, searchable replica**.
However, given the **low frequency of updates**, maintaining synchronization between a traditional **source-of-truth database** and Elasticsearch can be **omitted** to simplify the setup.

# **Tasks**

## 1. Parsing Dictionary Documents to Generate JSON

- **V1:** Keyword + Text
- **V1.1:** Keyword + Text while **preserving formatting** (e.g., italics, special characters)
- **V2:** Keyword + Additional structured fields in the description

## 2. Setup of a Simplified Dockerized Development Environment

- **Frontend:** Angular
- **Backend:** Elasticsearch as **BaaS**

- Reference: [Elasticsearch Search Applications](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-application-overview.html)

  --> This task is parially done, in the current state. There is an angular application with a client which is able to call the an Elasticsearch instance running in a docker container. However, the apikey is not generated in the setup and thus every developer to generate its own key in his docker container

## 3. Frontend Development

- **Search Page / Landing Page**
- **Search Results Page**
- **Details Page**

## 4. Setup & Experimentation with Elasticsearch

- **Import JSON data** into the Elasticsearch database
- **Enhance search similarity** by generating new fields:
  - Normalize words
  - Generate **Soundex** codes for phonetic similarity
    - Reference: [Soundex for German](https://de.wikipedia.org/wiki/Soundex#Soundex_f%C3%BCr_die_deutsche_Sprache)
  - Other possible improvements...
- **Optimize search suggestions** while typing by experimenting with different Elasticsearch query techniques
