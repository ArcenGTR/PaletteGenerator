import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaletteDisplayComponent } from './palette-display.component';

describe('PaletteDisplayComponent', () => {
  let component: PaletteDisplayComponent;
  let fixture: ComponentFixture<PaletteDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaletteDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
