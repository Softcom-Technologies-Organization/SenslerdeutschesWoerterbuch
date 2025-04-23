import { Component, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchResult, SearchService } from '../services/search.service';
import { MatDividerModule } from '@angular/material/divider';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-word-page',
  imports: [MatDividerModule],
  templateUrl: './word-page.component.html',
  styleUrl: './word-page.component.scss',
})
export class WordPageComponent implements OnInit {
  wordEntry: any = null;
  loading = true;
  error = false;
  synonymId: string = '';

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const wordId = params['id'];
        if (wordId) {
          this.fetchWordById(wordId);
        }
      });
  }

  fetchWordById(id: string): void {
    this.loading = true;
    this.error = false;

  this.searchService.getById(id).pipe(
    switchMap((response: any) => {
      this.wordEntry = response._source;
      const description = this.wordEntry["formatted-description"] || null;

      // Check if the description matches "s. another-word."
      const match = description?.match(/^\s*s\.\s(\S+)\.$/i);
      if (match) {
        const linkedWord = match[1]; // Extract "another-word"
        return this.searchService.getByTerm(linkedWord).pipe(
          map((linkedResult: SearchResult | null) => {
            if (linkedResult) {
              this.synonymId = linkedResult.id;
            }
            return response; // Pass the original response along
          })
        );
      }
      return [response]; // If no match, return the original response as an observable
    })
  ).subscribe({
    next: (response) => {
      this.wordEntry = response._source || response;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error fetching word:', err);
      this.error = true;
      this.loading = false;
    },
  });
  }
}
