import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedPalettesComponent } from './published-palettes.component';

describe('PublishedPalettesComponent', () => {
  let component: PublishedPalettesComponent;
  let fixture: ComponentFixture<PublishedPalettesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedPalettesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedPalettesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
