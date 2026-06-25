import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchService } from '../services/search.service';

import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    MatAutocompleteModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit, OnDestroy {
  result: any = null;
  private subscriptions = new Subscription();
  searchEngineDown = false;

  private selectedTagsSubject = new BehaviorSubject<string[]>([]);
  private randomTrigger = new Subject<void>();
  private searchTerm$ = new BehaviorSubject<string>('');
  private skipNextTermEmission = false;

  searchControl = new FormControl('');

  tags: any[] = [];
  selectedTags: string[] = [];

  get searchTerm() {
    return this.searchControl.value ?? '';
  }

  constructor(readonly searchService: SearchService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.searchService.getTags().subscribe({
        next: (tags) => (this.tags = tags),
        error: () => (this.tags = []),
      }),
    );

    this.subscriptions.add(
      this.searchService.checkSearchEngineStatus().subscribe({
        next: (available) => (this.searchEngineDown = !available),
        error: () => (this.searchEngineDown = true),
      }),
    );

    if (this.searchService.lastSearchTerm) {
      this.searchControl.setValue(this.searchService.lastSearchTerm);
    }

    this.subscriptions.add(
      this.searchControl.valueChanges
        .pipe(startWith(this.searchControl.value), debounceTime(300), distinctUntilChanged())
        .subscribe((term) => this.searchTerm$.next(term ?? '')),
    );

    const inputSearch$ = combineLatest([this.searchTerm$, this.selectedTagsSubject]).pipe(
      filter(() => {
        if (this.skipNextTermEmission) {
          this.skipNextTermEmission = false;
          return false;
        }
        return true;
      }),
      map(([term, tags]) => ({
        term: term ?? '',
        tags,
        random: false,
      })),
    );

    const randomSearch$ = this.randomTrigger.pipe(
      map(() => ({
        term: '',
        tags: this.selectedTagsSubject.value,
        random: true,
      })),
    );

    this.subscriptions.add(
      merge(inputSearch$, randomSearch$)
        .pipe(
          switchMap((params) => {
            this.searchService.lastSearchTerm = params.term;
            return this.searchService.search(params.term, params.tags, params.random).pipe(
              catchError((err) => {
                // Return a fallback result so the outer stream stays alive
                return of({ hits: { total: 0, hits: [] }, error: err });
              }),
            );
          }),
        )
        .subscribe({
          next: (res) => (this.result = res),
          error: (err) => {
            this.result = { hits: { total: 0, hits: [] }, error: err };
          },
        }),
    );
  }

  randomWordSearch() {
    this.searchControl.setValue('', { emitEvent: false });
    this.skipNextTermEmission = true;
    this.searchTerm$.next('');
    this.randomTrigger.next();
  }

  onTagsChanged(selected: any[]) {
    this.selectedTags = selected.map((tag) => tag?.name ?? tag);
    this.selectedTagsSubject.next(this.selectedTags);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
