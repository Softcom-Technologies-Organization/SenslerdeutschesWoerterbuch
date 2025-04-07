import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = environment.proxyUrl;
  private username = environment.elasticUsername;
  private password = environment.elasticPassword;

  private _searchResults: any;

  public get searchResults(): any {
    return this._searchResults;
  }

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const credentials = btoa(`${this.username}:${this.password}`);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    });
  }

  private getDefautSearchBody(query: string): any {
    return {
      query: {
        bool: {
          should: [
            // Match query for partial word matching
            {
              match: {
                term: {
                  query: query,
                  analyzer: 'term_search_analyzer',
                  operator: 'and',
                  fuzziness: 'AUTO',
                  boost: 1,
                },
              },
            },
            // Match query for exact word matching but with asciifolding (e.g. ü,ǜ,ù,... mapping to u)
            {
              match: {
                'term.asciifolding_keyword': {
                  query: query,
                  operator: 'and',
                  boost: 100,
                },
              },
            },
            // Match query for exact word matching
            {
              match: {
                'term.keyword': {
                  query: query,
                  operator: 'and',
                  boost: 10000,
                },
              },
            },
          ],
        },
      },
    };
  }

  public autoComplete(query: string, size = 5): Observable<any> {
    const body = this.getDefautSearchBody(query);
    body['size'] = size;
    // Check what URL is being used
    console.log('API URL:', this.apiUrl);

    return this.http.post(`${this.apiUrl}_search`, body, {
      headers: this.getHeaders(),
    });
  }

  public search(query: string) {
    const body = this.getDefautSearchBody(query);
    // in the search, also match words in the description
    body.query.bool.should.push({
      match: {
        'formatted-description': {
          query: query,
          operator: 'OR',
          fuzziness: 'AUTO',
          boost: 0.01,
        },
      },
    });
    // Check what URL is being used
    console.log('API URL:', this.apiUrl);

    this.http
      .post(`${this.apiUrl}_search`, body, {
        headers: this.getHeaders(),
      })
      .subscribe((data) => {
        this._searchResults = data;
      });
  }

  public getById(id: string): Observable<any> {
    // Check what URL is being used
    console.log('API URL:', this.apiUrl);

    return this.http.get(`${this.apiUrl}dictionary/_doc/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
