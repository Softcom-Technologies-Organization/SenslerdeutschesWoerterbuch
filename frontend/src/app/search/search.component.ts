import { Component, OnInit } from '@angular/core';
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
    MatSelect
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


  constructor(
    readonly searchService: SearchService, 
    private router : Router
  ) {}

  ngOnInit() {
    this.results$ = this.searchTermSubject.pipe(
      debounceTime(300),
      switchMap((term: string) => {
        this.searchService.lastSearchTerm = term;
        return this.searchService.search(term);
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
        if(result.length > 0) {
          const wordId = result[0].id;
          this.router.navigate(['/word', wordId])
        }
      })
    )
  }

  onTagsChanged(selected: string[]) {
    this.selectedTagsSubject.next(selected);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
