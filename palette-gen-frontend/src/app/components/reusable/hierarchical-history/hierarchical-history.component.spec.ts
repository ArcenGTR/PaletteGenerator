import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchicalHistoryComponent } from './hierarchical-history.component';

describe('HierarchicalHistoryComponent', () => {
  let component: HierarchicalHistoryComponent;
  let fixture: ComponentFixture<HierarchicalHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HierarchicalHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HierarchicalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
