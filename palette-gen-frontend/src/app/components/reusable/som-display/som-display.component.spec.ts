import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SomDisplayComponent } from './som-display.component';

describe('SomDisplayComponent', () => {
  let component: SomDisplayComponent;
  let fixture: ComponentFixture<SomDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SomDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SomDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
