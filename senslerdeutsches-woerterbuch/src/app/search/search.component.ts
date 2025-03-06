import { Component, DestroyRef, EventEmitter, Output } from '@angular/core';
import { SearchService } from '../services/search.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {

  private _searchTerm: string = '';

  public get searchTerm(): string {
    return this._searchTerm;
  }

  public set searchTerm(value: string) {
    this.searchService.autoComplete(value).subscribe((data) => {
      this.searchResults = data;
    });
    this._searchTerm = value;
  }

  constructor(
    private readonly searchService: SearchService,
    private readonly router: Router,
    readonly destroyRef: DestroyRef) {

    this.router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe((event: any) => {
      if(event instanceof NavigationEnd) {

        let urlSegments = (event as NavigationEnd).url.split('/');
        this.searchTerm = urlSegments[urlSegments.length-1];
      }
    });
  }

  protected searchResults: any = undefined;

  onSearch(event: Event){
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;

    this.router.navigate(['/', 'search', query]);
  }
}
