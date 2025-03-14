import { Routes } from '@angular/router';
import { ResultsPageComponent } from './results-page/results-page.component';
import { WordPageComponent } from './word-page/word-page.component';

export const routes: Routes = [{
    path: '', children: [
        {path: '', redirectTo: 'search', pathMatch: 'full'},
        {path: 'search', children: [
            {path:'', component: ResultsPageComponent, pathMatch: 'full'},
            {path:':word', component: ResultsPageComponent, pathMatch: 'full'}
        ]},
        {path:'word/:id', component: WordPageComponent, pathMatch: 'full'}
    ] 
}];
