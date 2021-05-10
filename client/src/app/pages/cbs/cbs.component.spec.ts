import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CbsComponent } from './cbs.component';

describe('CbsComponent', () => {
  let component: CbsComponent;
  let fixture: ComponentFixture<CbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CbsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
