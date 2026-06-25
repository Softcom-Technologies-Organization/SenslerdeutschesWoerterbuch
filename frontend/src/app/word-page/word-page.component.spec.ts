import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WordPageComponent } from './word-page.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('WordPageComponent', () => {
  let component: WordPageComponent;
  let fixture: ComponentFixture<WordPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(WordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders an audio player for each pronunciation', () => {
    component.loading = false;
    component.error = false;
    component.wordEntry = {
      term: 'Beize',
      'formatted-description': 'Wirtschaft',
      pronunciations: [
        { url: '/media/pronunciations/a.mp3', label: 'Oberland' },
        { url: '/media/pronunciations/b.mp3', label: 'Unterland' },
      ],
    };
    fixture.detectChanges();

    const audios: HTMLAudioElement[] = fixture.nativeElement.querySelectorAll('audio');
    expect(audios).toHaveSize(2);
    expect(audios[0].getAttribute('src')).toBe('/media/pronunciations/a.mp3');
  });

  it('does not render a pronunciation section when there are none', () => {
    component.loading = false;
    component.error = false;
    component.wordEntry = { term: 'Beize', 'formatted-description': 'Wirtschaft', pronunciations: [] };
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('audio')).toHaveSize(0);
  });
});
