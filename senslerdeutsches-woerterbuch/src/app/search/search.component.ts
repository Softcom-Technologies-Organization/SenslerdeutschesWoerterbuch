import { Component } from '@angular/core';
import { SearchService } from '../services/search.service';
import { CommonModule } from '@angular/common';
import { FormattedDescriptionComponent } from '../formatted-description/formatted-description.component';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormattedDescriptionComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  constructor(private searchService: SearchService) {}

  protected searchResults: any = undefined;

  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;

    this.searchService.search(query).subscribe((data) => {
      this.searchResults = data;
    });
  }
}
