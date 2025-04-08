import { Component, OnInit } from '@angular/core';
import { SearchService } from '../services/search.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { map, Observable, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  myControl = new FormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]> | undefined;

  constructor(readonly searchService: SearchService) {}

  ngOnInit() {
    const savedSearchTerm = this.searchService.getLastSearchTerm();
    if (savedSearchTerm) {
      this.myControl.setValue(savedSearchTerm);
      this.searchService.search(savedSearchTerm);
    }

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(savedSearchTerm || ''),
      map((value) => {
        if (value !== null && value !== undefined) {
          this.searchService.saveSearchTerm(value);
        }
        return this._filter(value || '');
      }),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    this.searchService.search(value);
    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue),
    );
  }
}
