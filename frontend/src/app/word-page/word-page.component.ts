import { Component, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchService } from '../services/search.service';
import { MatDividerModule } from '@angular/material/divider';

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

    this.searchService.getById(id).subscribe({
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
