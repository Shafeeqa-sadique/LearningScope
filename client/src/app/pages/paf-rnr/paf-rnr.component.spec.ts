import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PafRnrComponent } from './paf-rnr.component';

describe('PafRnrComponent', () => {
  let component: PafRnrComponent;
  let fixture: ComponentFixture<PafRnrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PafRnrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PafRnrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
