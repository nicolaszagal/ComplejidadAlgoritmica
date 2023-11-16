import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFlightsComponent } from './my-flights.component';

describe('MyFlightsComponent', () => {
  let component: MyFlightsComponent;
  let fixture: ComponentFixture<MyFlightsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyFlightsComponent]
    });
    fixture = TestBed.createComponent(MyFlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
