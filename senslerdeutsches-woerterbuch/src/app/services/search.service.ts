import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = 'https://localhost:9200'; // Elasticsearch endpoint --> Todo: move to a config file
  private apiKey =
    'Um5uR1NKVUJlSTZmUGtTWmZKWU46ZE03czN3bFZSLWlDa25GUS0zTzNXUQ=='; // Replace with your actual API key --> Todo: Move to a config file

  // go to http://localhost:5601/app/enterprise_search/elasticsearch to genreate an api key
  // the generation of the api key should be automated in the docker-compose setup at a future step
  //
  // {
  //   "id": "XthHSJUBUu779aC68k8N",
  //   "name": "dev",
  //   "expiration": 1745858429453,
  //   "api_key": "Dg5T6CzwQ1K2Dp16OgpKcg",
  //   "encoded": "WHRoSFNKVUJVdTc3OWFDNjhrOE46RGc1VDZDendRMUsyRHAxNk9ncEtjZw==",
  //   "beats_logstash_format": "XthHSJUBUu779aC68k8N:Dg5T6CzwQ1K2Dp16OgpKcg"
  // }

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `ApiKey ${this.apiKey}`,
    });
  }

  public getInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`, { headers: this.getHeaders() });
  }
}
