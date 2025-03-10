import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormattedDescriptionComponent } from './formatted-description.component';

describe('FormattedDescriptionComponent', () => {
  let component: FormattedDescriptionComponent;
  let fixture: ComponentFixture<FormattedDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormattedDescriptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormattedDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
