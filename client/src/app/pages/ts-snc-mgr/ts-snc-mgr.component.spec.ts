import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsSncMgrComponent } from './ts-snc-mgr.component';

describe('TsSncMgrComponent', () => {
  let component: TsSncMgrComponent;
  let fixture: ComponentFixture<TsSncMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsSncMgrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsSncMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
