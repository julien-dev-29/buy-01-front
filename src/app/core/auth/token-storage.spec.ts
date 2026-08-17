import { TestBed } from '@angular/core/testing';
import { TokenStorage } from './token-storage';

describe('TokenStorage', () => {
  let storage: TokenStorage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    storage = TestBed.inject(TokenStorage);
  });

  it('returns null when no token is stored', () => {});
});
