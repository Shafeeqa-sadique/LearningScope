import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsRooMgrComponent } from './ts-roo-mgr.component';

describe('TsRooMgrComponent', () => {
  let component: TsRooMgrComponent;
  let fixture: ComponentFixture<TsRooMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsRooMgrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsRooMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
