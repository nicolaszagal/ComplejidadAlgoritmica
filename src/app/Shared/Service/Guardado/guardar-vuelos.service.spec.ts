import { TestBed } from '@angular/core/testing';

import { GuardarVuelosService } from './guardar-vuelos.service';

describe('GuardarVuelosService', () => {
  let service: GuardarVuelosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuardarVuelosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
