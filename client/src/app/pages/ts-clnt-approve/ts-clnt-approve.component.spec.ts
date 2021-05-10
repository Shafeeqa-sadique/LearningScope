import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsClntApproveComponent } from './ts-clnt-approve.component';

describe('TsClntApproveComponent', () => {
  let component: TsClntApproveComponent;
  let fixture: ComponentFixture<TsClntApproveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TsClntApproveComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsClntApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
