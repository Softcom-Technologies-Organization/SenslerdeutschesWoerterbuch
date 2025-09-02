import { Component, OnInit } from '@angular/core';
import { SearchResult, SearchService } from '../services/search.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BehaviorSubject, combineLatest, debounceTime, map, Observable, shareReplay, startWith, Subscription, switchMap } from 'rxjs';
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
    results$!: Observable<SearchResult>;
    showFigure$!: Observable<boolean>;
    esAvailable$!: Observable<boolean>;
    readonly searchTermSubject = new BehaviorSubject<string>('');
    readonly subscriptions = new Subscription();
    searchControl = new FormControl('');

    tags: string[] = ['curse-word'];
    selectedTags: { [tag: string]: boolean } = {};
    filteredResults$!: Observable<SearchResult>;
    readonly selectedTagsSubject = new BehaviorSubject<string[]>([]);

    private exactMatchMode = false;

    constructor(readonly searchService: SearchService) { }

    ngOnInit() {
        this.esAvailable$ = this.searchService.checkAvailability();

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
            map(results => !results.hits || results.hits.length === 0)
        );

        this.filteredResults$ = combineLatest([
            this.results$,
            this.selectedTagsSubject.asObservable().pipe(startWith([]))
        ]).pipe(
            map(([results, selectedTags]: [SearchResult, string[]]) => {
                if (!selectedTags.length) return results;
                results.hits = results.hits.filter(result =>
                    result.tags?.some(tag => selectedTags.includes(tag))
                );
                return results;
            })
        );

        const savedTerm = this.searchService.lastSearchTerm;
        if (savedTerm) {
            this.searchControl.setValue(savedTerm);
        }
    }

    randomWordSearch() {
        const randomResult$ = this.searchService.getRandomResult(this.selectedTagsSubject.value);
        this.subscriptions.add(
            randomResult$.subscribe(result => {
                if (result.hits.length > 0) {
                    const term = result.hits[0].title;
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
