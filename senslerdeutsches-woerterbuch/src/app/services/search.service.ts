import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = '/api'; // Elasticsearch endpoint --> Todo: move to a config file
  private apiKey =
    'RWVUamFwVUJhdXJLLVJXUGJrRkg6a0xEdVpPaWRTckdSaFBnVU9sY1RBUQ=='; // Replace with your actual API key --> Todo: Move to a config file

  // go to http://localhost:5601/app/enterprise_search/elasticsearch to genreate an api key
  // the generation of the api key should be automated in the docker-compose setup at a future step

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `ApiKey ${this.apiKey}`,
    });
  }

  public search(query: string, size = 5): Observable<any> {
    const body = {
      query: {
        bool: {
          should: [
            { match: { term: { query: query, operator: 'and' } } },
            {
              term: {
                'term.keyword': {
                  value: query.toLowerCase(),
                  boost: 10,
                },
              },
            },
            {
              match: {
                term: {
                  query: query,
                  fuzziness: 'AUTO',
                  prefix_length: 0,
                  boost: 1,
                },
              },
            },
          ],
        },
      },
      size: size,
    };
    return this.http.post(`${this.apiUrl}/dictionary/_search`, body, {
      headers: this.getHeaders(),
    });
  }
}
