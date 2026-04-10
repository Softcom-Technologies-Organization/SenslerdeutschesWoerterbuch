import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  readonly baseUrl = environment.apiUrl;
  readonly searchEndpoints = '/dictionary/search/';
  readonly apiUrl = this.baseUrl + this.searchEndpoints;

  lastSearchTerm: string = '';

  constructor(readonly http: HttpClient) { }

  public search(term: string, tags: string[] = [], random: boolean = false): Observable<any> {
    let params = new HttpParams().set('term', term);
    if (tags && tags.length > 0) {
      tags.forEach(tag => params = params.append('tags', tag));
    }
    if (random) {
      params = params.set('random', 'true');
    }
    return this.http.get<any>(this.apiUrl + 'query', { params: params });
  }

  public checkSearchEngineStatus(): Observable<boolean> {
    return this.http.get<{ status: string, indexExists: boolean, docCount: number }>(this.apiUrl + 'status').pipe(
      timeout(500),
      map(response => response.status === 'available' && response.indexExists && response.docCount > 0),
      catchError(() => of(false))
    );
  }

  public searchRandom(tags: string[]): Observable<any> {
    let params = new HttpParams();
    if (tags && tags.length > 0) {
      tags.forEach(tag => params = params.append('tags', tag));
    }
    return this.http.get<any>(this.apiUrl + 'random', { params: params });
  }

  public getTags(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'tags');
  }
}
