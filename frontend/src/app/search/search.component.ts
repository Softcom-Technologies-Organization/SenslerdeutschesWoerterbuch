import { Component, inject, OnInit } from '@angular/core';
import { SearchResult, SearchService } from '../services/search.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BehaviorSubject, combineLatest, debounceTime, map, Observable, shareReplay, startWith, Subscription, switchMap } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { TagTranslationPipe } from "../pipes/tag-translation.pipe";
import { MatSelect } from '@angular/material/select';
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
    MatIcon,
    TagTranslationPipe,
    MatSelect,
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

  tags: string[] = ['curse-word'];
  selectedTags: { [tag: string]: boolean } = {};
  filteredResults$!: Observable<SearchResult[]>;
  readonly selectedTagsSubject = new BehaviorSubject<string[]>([]);

  private exactMatchMode = false;

  // Dice icon from Font-Awesome, free icon.
  diceIcon = 
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="#6a4b46"><path d="M274.9 34.3c-28.1-28.1-73.7-28.1-101.8 0L34.3 173.1c-28.1 28.1-28.1 73.7 0 101.8L173.1 413.7c28.1 28.1 73.7 28.1 101.8 0L413.7 274.9c28.1-28.1 28.1-73.7 0-101.8L274.9 34.3zM200 224a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM96 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 376a24 24 0 1 1 0-48 24 24 0 1 1 0 48zM352 200a24 24 0 1 1 0 48 24 24 0 1 1 0-48zM224 120a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm96 328c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-114.3 0c11.6 36 3.1 77-25.4 105.5L320 413.8l0 34.2zM480 328a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>'

  constructor(
    readonly searchService: SearchService, 
    private router : Router
  ) {
      const iconRegistry = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);
      iconRegistry.addSvgIconLiteral(
        'dice',
        sanitizer.bypassSecurityTrustHtml(this.diceIcon),
    );
  }

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

    this.filteredResults$ = combineLatest([
      this.results$,
      this.selectedTagsSubject.asObservable().pipe(startWith([]))
    ]).pipe(
      map(([results, selectedTags] : [SearchResult[], string[]]) => {
        if (!selectedTags.length) return results;
        return results.filter(result =>
          result.tags?.some(tag => selectedTags.includes(tag))
        );
      })
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

  onTagsChanged(selected: string[]) {
    this.selectedTagsSubject.next(selected);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
