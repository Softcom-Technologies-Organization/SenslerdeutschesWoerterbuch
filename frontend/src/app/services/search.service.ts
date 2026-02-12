import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SearchResult {
  elasticAvailable: boolean,
  nbHits: number,
  searchTerm: string;
  hits: Array<{
    id: string;
    title: string;
    description?: string;
    tags?: string[];
  }>
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  readonly apiUrl = 'http://localhost:8000/dictionary/search/';
  readonly username = environment.elasticUsername;
  readonly password = environment.elasticPassword;

  lastSearchTerm: string = '';

  constructor(readonly http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const credentials = btoa(`${this.username}:${this.password}`);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    });
  }

  public searchByTerm(term: string): Observable<any> {
    let params = new HttpParams().set('q', term);
    return this.http.get<any>(this.apiUrl, { params: params });
  }

}
