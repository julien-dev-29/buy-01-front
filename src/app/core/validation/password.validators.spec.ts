import { FormControl, FormGroup } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { passwordMatchValidator } from './password.validators';

describe('passwordMatchValidator', () => {
  it('return null when passwords match', () => {
    const form = new FormGroup({
      password: new FormControl('secret123'),
      confirmPassword: new FormControl('secret123'),
    });
    expect(passwordMatchValidator(form)).toBeNull();
  });

  it('returns passwordMismatch when passwords differ', () => {
    const form = new FormGroup({
      password: new FormControl('secret123'),
      confirmPassword: new FormControl('different'),
    });
    expect(passwordMatchValidator(form)).toEqual({
      passwordMismatch: true,
    });
  });

  it('returns null when controls are missing', () => {
    expect(passwordMatchValidator(new FormControl('x'))).toBeNull();
  });
});
