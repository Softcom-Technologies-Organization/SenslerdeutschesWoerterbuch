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
});
