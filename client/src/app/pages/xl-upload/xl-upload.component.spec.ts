import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlUploadComponent } from './xl-upload.component';

describe('XlUploadComponent', () => {
  let component: XlUploadComponent;
  let fixture: ComponentFixture<XlUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlUploadComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
