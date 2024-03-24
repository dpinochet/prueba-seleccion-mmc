import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelserviceComponent } from './excelservice.component';

describe('ExcelserviceComponent', () => {
  let component: ExcelserviceComponent;
  let fixture: ComponentFixture<ExcelserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelserviceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExcelserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
