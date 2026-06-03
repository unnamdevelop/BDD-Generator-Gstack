import { validateSignature } from '../../src/webhook/validator';
import { createHmac } from 'crypto';

describe('Webhook Signature Validation', () => {
  const secret = 'test-secret';
  const body = JSON.stringify({ issue: { key: 'TEST-1' } });

  // Helper to generate valid HMAC
  function generateHmac(data: string, key: string): string {
    return createHmac('sha256', key).update(data).digest('hex');
  }

  describe('validateSignature', () => {
    it('should validate correct HMAC signature', () => {
      const signature = generateHmac(body, secret);
      const result = validateSignature(body, signature, secret);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid HMAC signature', () => {
      const invalidSignature = 'invalid-signature';
      const result = validateSignature(body, invalidSignature, secret);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject missing signature', () => {
      const result = validateSignature(body, '', secret);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing signature');
    });

    it('should reject if secret not configured', () => {
      const signature = generateHmac(body, secret);
      const result = validateSignature(body, signature, '');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Webhook secret not configured');
    });

    it('should reject tampered body with valid signature', () => {
      const originalSignature = generateHmac(body, secret);
      const tamperedBody = JSON.stringify({ issue: { key: 'TEST-2' } });

      const result = validateSignature(tamperedBody, originalSignature, secret);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle different body content correctly', () => {
      const body1 = '{"test": 1}';
      const body2 = '{"test": 2}';

      const sig1 = generateHmac(body1, secret);
      const sig2 = generateHmac(body2, secret);

      expect(validateSignature(body1, sig1, secret).valid).toBe(true);
      expect(validateSignature(body1, sig2, secret).valid).toBe(false);
      expect(validateSignature(body2, sig1, secret).valid).toBe(false);
      expect(validateSignature(body2, sig2, secret).valid).toBe(true);
    });
  });
});
