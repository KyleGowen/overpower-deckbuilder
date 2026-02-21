import { checkLimit, recordCreation, resetForTesting } from '../../src/middleware/newAccountRateLimiter';

describe('newAccountRateLimiter', () => {
  beforeEach(() => {
    resetForTesting();
  });

  describe('checkLimit', () => {
    it('should allow first request from new IP', () => {
      expect(checkLimit('192.168.1.1')).toBe(true);
    });

    it('should allow requests within IP limit (5 per minute)', () => {
      const ip = '10.0.0.1';
      for (let i = 0; i < 5; i++) {
        expect(checkLimit(ip)).toBe(true);
        recordCreation(ip);
      }
    });

    it('should reject 6th request from same IP within window', () => {
      const ip = '10.0.0.2';
      for (let i = 0; i < 5; i++) {
        checkLimit(ip);
        recordCreation(ip);
      }
      expect(checkLimit(ip)).toBe(false);
    });

    it('should allow requests from different IPs within global limit (10)', () => {
      for (let i = 0; i < 10; i++) {
        const ip = `10.0.0.${i}`;
        expect(checkLimit(ip)).toBe(true);
        recordCreation(ip);
      }
    });

    it('should reject 11th request globally regardless of IP', () => {
      for (let i = 0; i < 10; i++) {
        const ip = `172.16.0.${i}`;
        checkLimit(ip);
        recordCreation(ip);
      }
      expect(checkLimit('172.16.0.99')).toBe(false);
      expect(checkLimit('192.168.99.99')).toBe(false);
    });

    it('should allow new IP after same IP hits limit if under global limit', () => {
      const ip1 = '10.1.1.1';
      for (let i = 0; i < 5; i++) {
        checkLimit(ip1);
        recordCreation(ip1);
      }
      expect(checkLimit(ip1)).toBe(false);

      const ip2 = '10.1.1.2';
      expect(checkLimit(ip2)).toBe(true);
    });
  });

  describe('recordCreation', () => {
    it('should increment count for same IP', () => {
      const ip = '10.2.0.1';
      expect(checkLimit(ip)).toBe(true);
      recordCreation(ip);
      recordCreation(ip);
      recordCreation(ip);
      recordCreation(ip);
      expect(checkLimit(ip)).toBe(true);
      recordCreation(ip);
      expect(checkLimit(ip)).toBe(false);
    });

    it('should increment global count across IPs', () => {
      for (let i = 0; i < 10; i++) {
        recordCreation(`10.3.0.${i}`);
      }
      expect(checkLimit('10.3.0.100')).toBe(false);
    });
  });
});
