import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiCounterComponent } from './indi-counter.component';

describe('IndiCounterComponent', () => {
  let component: IndiCounterComponent;
  let fixture: ComponentFixture<IndiCounterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndiCounterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndiCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
