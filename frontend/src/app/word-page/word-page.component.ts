import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-word-page',
  imports: [MatDividerModule],
  templateUrl: './word-page.component.html',
  styleUrl: './word-page.component.scss',
})
export class WordPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  
  readonly baseUrl = environment.apiUrl;
  readonly searchEndpoints = '/dictionary/word/';
  readonly apiUrl = this.baseUrl + this.searchEndpoints;

  wordEntry: any = null;
  loading = true;
  error = false;
  synonymId: string = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadWord(id);
      }
    });
  }

  private loadWord(id: string): void {
    this.loading = true;
    this.error = false;
    this.http.get<any>(this.apiUrl + `${id}/`).subscribe({
      next: (data) => {
        this.wordEntry = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
