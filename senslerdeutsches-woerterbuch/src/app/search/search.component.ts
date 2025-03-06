import { Component, EventEmitter, Output } from '@angular/core';
import { SearchService } from '../services/search.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [CommonModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  constructor(private readonly searchService: SearchService, private readonly router: Router) {}

  protected searchResults: any = undefined;

  onSearchPreview(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;

    this.searchService.autoComplete(query).subscribe((data) => {
      this.searchResults = data;
    });
  }

  onSearch(event: Event){
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;

    this.router.navigate(['/', 'search', query]);
  }
}
