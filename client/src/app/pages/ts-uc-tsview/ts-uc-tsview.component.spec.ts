import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsUcTsviewComponent } from './ts-uc-tsview.component';

describe('TsUcTsviewComponent', () => {
  let component: TsUcTsviewComponent;
  let fixture: ComponentFixture<TsUcTsviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TsUcTsviewComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsUcTsviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
