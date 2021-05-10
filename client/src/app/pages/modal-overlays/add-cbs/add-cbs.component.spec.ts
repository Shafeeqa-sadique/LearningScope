import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCbsComponent } from './add-cbs.component';

describe('AddCbsComponent', () => {
  let component: AddCbsComponent;
  let fixture: ComponentFixture<AddCbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCbsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
