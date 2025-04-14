import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
}

interface ElasticsearchResponse {
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number | null;
    hits: Array<{
      _index: string;
      _id: string;
      _score: number | null;
      _source: any; // This is where the document data resides
    }>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  readonly apiUrl = environment.proxyUrl;
  readonly username = environment.elasticUsername;
  readonly password = environment.elasticPassword;

  lastSearchTerm: string = '';

  constructor(readonly http: HttpClient) {}

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
            {
              match: {
                'term.phonetic': {
                  query: query,
                  operator: 'and',
                  fuzziness: 'AUTO',
                  boost: 2,
                },
              },
            },
            // Fuzzy matchword with asciifolding (e.g. ü,ǜ,ù,... mapping to u)
            {
              fuzzy: {
                'term.asciifolding_keyword': {
                  value: query.toLowerCase(),
                  fuzziness: '2',
                  transpositions: true,
                  boost: 2,
                },
              },
            },
            // Match query for exact word matching but with asciifolding (e.g. ü,ǜ,ù,... mapping to u)
            {
              match: {
                'term.asciifolding_keyword': {
                  query: query,
                  operator: 'and',
                  boost: 3,
                },
              },
            },
            // Match query for exact word matching
            {
              match: {
                'term.keyword': {
                  query: query,
                  operator: 'and',
                  boost: 5,
                },
              },
            },
          ],
        },
      },
    };
  }

  search(query: string): Observable<any[]> {
    // Track the search term for analytics
    if (window.plausible) {
      window.plausible('Search', { 
        props: { 
          term: query 
        }
      });
    }
    const body = this.getDefautSearchBody(query);
    // in the search, also match words in the description
    body.query.bool.should.push({
      match: {
        'formatted-description': {
          query: query,
          operator: 'OR',
          boost: 1,
        },
      },
    });
    body.explain = true; // This will include detailed scoring explanations
    return this.http.post<ElasticsearchResponse>(`${this.apiUrl}_search`, body, {
      headers: this.getHeaders(),
    })
    .pipe(
      map(response => {
        if (response && response.hits && response.hits.hits) {
          return response.hits.hits.map(hit => ({
            id: hit._id,
            title: hit._source['term'], 
            description: hit._source['formatted-description'],
            ...hit._source
          } as SearchResult));
        }
        return [];
      })
    );
  }

  public getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}dictionary/_doc/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
