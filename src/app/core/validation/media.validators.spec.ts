import { ALLOWED_MEDIA_TYPES, MAX_MEDIA_SIZE_BYTES, validateMediaFile } from './media.validators';

describe('validateMediaFile', () => {
  it('accept allowed image types under 2MB', () => {
    for (const type of ALLOWED_MEDIA_TYPES) {
      const file = new File(['x'.repeat(1024)], 'photo', { type });
      expect(validateMediaFile(file)).toBeNull();
    }
  });

  it('accepts a file exactly at the 2 MB limit', () => {
    const file = new File(['x'.repeat(MAX_MEDIA_SIZE_BYTES)], 'ok.png', { type: 'image/png' });
    expect(validateMediaFile(file)).toBeNull();
  });

  it('rejects files larger than 2 MB', () => {
    const file = new File(['x'.repeat(MAX_MEDIA_SIZE_BYTES + 1)], 'big.png', { type: 'image/png' });
    expect(validateMediaFile(file)).toContain('2 Mo');
  });

  it('rejects disallowed file types', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    expect(validateMediaFile(file)).toContain('Format non autorisé');
  });

  it('rejects files without a MIME type', () => {
    const file = new File(['x'], 'photo');
    expect(validateMediaFile(file)).toContain('Format non autorisé');
  });
});
