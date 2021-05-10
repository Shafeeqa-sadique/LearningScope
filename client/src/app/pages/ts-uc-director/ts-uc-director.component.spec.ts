import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsUcDirectorComponent } from './ts-uc-director.component';

describe('TsUcDirectorComponent', () => {
  let component: TsUcDirectorComponent;
  let fixture: ComponentFixture<TsUcDirectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsUcDirectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsUcDirectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
