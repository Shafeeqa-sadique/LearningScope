import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsRooLeadComponent } from './ts-roo-lead.component';

describe('TsRooLeadComponent', () => {
  let component: TsRooLeadComponent;
  let fixture: ComponentFixture<TsRooLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsRooLeadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsRooLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
