import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, MatDivider],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'senslerdeutsches-woerterbuch';
}
