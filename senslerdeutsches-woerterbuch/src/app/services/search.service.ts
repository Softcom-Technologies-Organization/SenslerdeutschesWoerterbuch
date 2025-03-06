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

  public search(query: string): Observable<any> {
    const body = {
      query: {
        multi_match: {
          query: query,
          fields: ['text', 'formatted-text.text'],
          fuzziness: 'AUTO',
        },
      },
    };
    return this.http.post(`${this.apiUrl}/dictionary/_search`, body, {
      headers: this.getHeaders(),
    });
  }
}
