import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsCreateComponent } from './ts-create.component';

describe('TsCreateComponent', () => {
  let component: TsCreateComponent;
  let fixture: ComponentFixture<TsCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TsCreateComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
