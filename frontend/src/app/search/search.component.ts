import { Component, OnInit } from '@angular/core';
import { SearchResult, SearchService } from '../services/search.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, shareReplay, startWith, Subscription, switchMap } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelect } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatIcon } from '@angular/material/icon';
import { TagTranslationPipe } from "../pipes/tag-translation.pipe";

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
    MatIconModule,
    MatIcon,
    TagTranslationPipe,
    MatSelect
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})

export class SearchComponent implements OnInit {
  result: any = null;
  private sub?: Subscription;
  searchEngineDown = false;

  showFigure$!: Observable<boolean>;
  esAvailable$!: Observable<boolean>;
  readonly searchTermSubject = new BehaviorSubject<string>('');
  readonly subscriptions = new Subscription();
  searchControl = new FormControl('');

  get searchTerm() {
    return this.searchControl.value ?? '';
  }

  tags: string[] = ['curse-word'];
  selectedTags: { [tag: string]: boolean } = {};
  readonly selectedTagsSubject = new BehaviorSubject<string[]>([]);

  private exactMatchMode = false;

  constructor(readonly searchService: SearchService) { }

  ngOnInit() {
    this.sub = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.searchService.searchByTerm(this.searchControl.value ?? ''))
    ).subscribe(
      res => this.result = res,
      err => { this.result = { hits: { total: 0, hits: [] }, error: err }; }
    );
  }

  randomWordSearch() {
    const term = 'random'; // replace with your logic
    this.searchService.search(term).subscribe(res => this.result = res);
  }

  onTagsChanged(selected: string[]) {
    // integrate tag filtering into request if needed
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

}
