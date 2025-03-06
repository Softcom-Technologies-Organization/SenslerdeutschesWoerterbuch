import { Component, DestroyRef } from '@angular/core';
import { SearchService } from '../services/search.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-results-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './results-page.component.html',
  styleUrl: './results-page.component.scss'
})
export class ResultsPageComponent {

  constructor(
    private readonly searchService: SearchService,
    private readonly router: Router,
    readonly destroyRef: DestroyRef) {

    this.router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe((event: any) => {
      if(event instanceof NavigationEnd) {
        let word = 'default'

        let urlSegments = (event as NavigationEnd).url.split('/');
        word = urlSegments[urlSegments.length-1];

        if(word !== 'default') {
          this.searchService.search(word);
        }
      }
    });
  }

  protected get searchResults(): any {
    return this.searchService.searchResults;
  }
}
