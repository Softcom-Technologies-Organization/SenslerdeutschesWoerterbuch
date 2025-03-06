import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = '/api'; // Elasticsearch endpoint --> Todo: move to a config file
  private apiKey =
    'ZnJxa1pwVUJnT3VWU1JzRlJ3QTQ6QzB3ZUx0QXRSRFdBV1RWNE1nVzduUQ=='; // Replace with your actual API key --> Todo: Move to a config file

  // go to http://localhost:5601/app/enterprise_search/elasticsearch to genreate an api key
  // the generation of the api key should be automated in the docker-compose setup at a future step

  private _searchResults: any;

  public get searchResults(): any {return this._searchResults;}

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `ApiKey ${this.apiKey}`,
    });
  }

  public autoComplete(query: string): Observable<any> {
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

  public search(query: string): void {
    const body = {
      query: {
        multi_match: {
          query: query,
          fields: ['text', 'formatted-text.text'],
          fuzziness: 'AUTO',
        },
      },
    };
    this.http.post(`${this.apiUrl}/dictionary/_search`, body, {
      headers: this.getHeaders(),
    }).subscribe((data) => {
      this._searchResults = data;
    });
  }
}
