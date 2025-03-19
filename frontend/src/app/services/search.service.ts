import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = 'http://localhost:4202/elastic/'; // Elasticsearch endpoint --> Todo: move to a config file
  private apiKey =
    'RndQVnFaVUJ3YWpDc1BrREhwdVo6OFprSndwbUZSSmFtQVFSSVJ4TmxIZw=='; // Replace with your actual API key --> Todo: Move to a config file

  // go to http://localhost:5601/app/enterprise_search/elasticsearch to genreate an api key
  // the generation of the api key should be automated in the docker-compose setup at a future step

  private _searchResults: any;

  public get searchResults(): any {
    return this._searchResults;
  }

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `ApiKey ${this.apiKey}`,
    });
  }

  public autoComplete(query: string, size = 5): Observable<any> {
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
    return this.http.post(`${this.apiUrl}_search`, body, {
      headers: this.getHeaders(),
    });
  }

  public search(query: string) {
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
    };
    this.http
      .post(`${this.apiUrl}_search`, body, {
        headers: this.getHeaders(),
      })
      .subscribe((data) => {
        this._searchResults = data;
      });
  }

  public getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}dictionary/_doc/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
