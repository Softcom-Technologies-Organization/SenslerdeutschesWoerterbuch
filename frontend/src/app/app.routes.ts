import { Routes } from '@angular/router';
import { WordPageComponent } from './word-page/word-page.component';
import { AboutComponent } from './about/about.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { SearchComponent } from './search/search.component';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  { path: 'word/:id', component: WordPageComponent, pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'feedback', component: FeedbackComponent },
];
