import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsUcStsComponent } from './ts-uc-sts.component';

describe('TsUcStsComponent', () => {
  let component: TsUcStsComponent;
  let fixture: ComponentFixture<TsUcStsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsUcStsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsUcStsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
