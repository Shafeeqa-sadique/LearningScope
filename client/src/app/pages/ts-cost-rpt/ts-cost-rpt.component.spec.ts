import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsCostRptComponent } from './ts-cost-rpt.component';

describe('TsCostRptComponent', () => {
  let component: TsCostRptComponent;
  let fixture: ComponentFixture<TsCostRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsCostRptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsCostRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
