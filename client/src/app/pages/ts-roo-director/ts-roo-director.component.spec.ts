import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsRooDirectorComponent } from './ts-roo-director.component';

describe('TsRooDirectorComponent', () => {
  let component: TsRooDirectorComponent;
  let fixture: ComponentFixture<TsRooDirectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsRooDirectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsRooDirectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
