import { Component } from '@angular/core';
import { SearchService } from '../services/search.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  constructor(private searchService: SearchService) {}

  protected info: Observable<any> | undefined;

  ngOnInit() {
    this.info = this.searchService.getInfo();
  }
}
