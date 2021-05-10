import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsAdminComponent } from './ts-admin.component';

describe('TsAdminComponent', () => {
  let component: TsAdminComponent;
  let fixture: ComponentFixture<TsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TsAdminComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
