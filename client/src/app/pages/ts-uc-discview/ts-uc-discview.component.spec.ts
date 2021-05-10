import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsUcDiscviewComponent } from './ts-uc-discview.component';

describe('TsUcDiscviewComponent', () => {
  let component: TsUcDiscviewComponent;
  let fixture: ComponentFixture<TsUcDiscviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TsUcDiscviewComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsUcDiscviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
