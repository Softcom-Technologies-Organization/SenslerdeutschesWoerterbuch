import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatToolbar } from '@angular/material/toolbar';
import { SearchComponent } from './search/search.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, RouterModule, SearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'senslerdeutsches-woerterbuch';
}
