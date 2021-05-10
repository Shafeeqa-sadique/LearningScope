import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsSncApprovalComponent } from './ts-snc-approval.component';

describe('TsSncApprovalComponent', () => {
  let component: TsSncApprovalComponent;
  let fixture: ComponentFixture<TsSncApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TsSncApprovalComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsSncApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
