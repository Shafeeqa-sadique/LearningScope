import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsCostCtrlComponent } from './ts-cost-ctrl.component';

describe('TsCostCtrlComponent', () => {
  let component: TsCostCtrlComponent;
  let fixture: ComponentFixture<TsCostCtrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsCostCtrlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsCostCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
