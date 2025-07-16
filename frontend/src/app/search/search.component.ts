import { Component, inject, OnInit } from '@angular/core';
import { SearchResult, SearchService } from '../services/search.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BehaviorSubject, debounceTime, map, Observable, shareReplay, Subscription, switchMap } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatAutocompleteModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})

export class SearchComponent implements OnInit {
  results$!: Observable<SearchResult[]>;
  showFigure$!: Observable<boolean>;
  readonly searchTermSubject = new BehaviorSubject<string>('');
  readonly subscriptions = new Subscription();
  searchControl = new FormControl('');

  private exactMatchMode = false;
  constructor(readonly searchService: SearchService) {}

  ngOnInit() {
    this.results$ = this.searchTermSubject.pipe(
      debounceTime(300),
      switchMap((term: string) => {
        this.searchService.lastSearchTerm = term;
        const exact = this.exactMatchMode;
        this.exactMatchMode = false;
        return this.searchService.search(term, exact);
     }),
     shareReplay(1)
    );

    this.subscriptions.add(
      this.searchControl.valueChanges.subscribe(term => {
        if (term) {
          this.searchTermSubject.next(term);
        } else {
          this.searchTermSubject.next('');
        }
      })
    );

    this.showFigure$ = this.results$.pipe(
      map(results => !results || results.length === 0)
    );

    const savedTerm = this.searchService.lastSearchTerm;
    if (savedTerm) {
      this.searchControl.setValue(savedTerm);
    }
  }

  randomWordSearch() {
    const randomResult$ = this.searchService.getRandomResult();

    this.subscriptions.add(
      randomResult$.subscribe(result => {
        if (result.length > 0) {
          const term = result[0].title;
          this.exactMatchMode = true;
          this.searchControl.setValue(term);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
