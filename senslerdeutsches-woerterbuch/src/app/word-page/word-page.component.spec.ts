import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordPageComponent } from './word-page.component';

describe('WordPageComponent', () => {
  let component: WordPageComponent;
  let fixture: ComponentFixture<WordPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordPageComponent]
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
