import { describe, it, expect } from 'vitest';
import { validateLatitude, WEB_MERCATOR_LATITUDE_LIMIT } from './coordinates';

describe('Polar Latitude Validation', () => {
	describe('validateLatitude', () => {
		it('should validate normal latitudes', () => {
			const result = validateLatitude('45.0');
			expect(result.isValid).toBe(true);
			expect(result.clampedValue).toBeUndefined();
			expect(result.warning).toBeUndefined();
		});

		it('should validate latitudes at the Web Mercator limit', () => {
			const result = validateLatitude(WEB_MERCATOR_LATITUDE_LIMIT.toString());
			expect(result.isValid).toBe(true);
			expect(result.clampedValue).toBeUndefined();
			expect(result.warning).toBeUndefined();
		});

		it('should clamp North polar latitudes', () => {
			const result = validateLatitude('87.0');
			expect(result.isValid).toBe(true);
			expect(result.clampedValue).toBeCloseTo(WEB_MERCATOR_LATITUDE_LIMIT, 5);
			expect(result.warning).toContain('North polar region');
			expect(result.warning).toContain('Clamped to');
		});

		it('should clamp South polar latitudes', () => {
			const result = validateLatitude('-87.0');
			expect(result.isValid).toBe(true);
			expect(result.clampedValue).toBeCloseTo(-WEB_MERCATOR_LATITUDE_LIMIT, 5);
			expect(result.warning).toContain('South polar region');
			expect(result.warning).toContain('Clamped to');
		});

		it('should handle extreme polar latitudes', () => {
			const result = validateLatitude('89.9');
			expect(result.isValid).toBe(true);
			expect(result.clampedValue).toBeCloseTo(WEB_MERCATOR_LATITUDE_LIMIT, 5);
			expect(result.warning).toContain('89.9°');
		});

		it('should reject invalid latitudes beyond ±90°', () => {
			const resultNorth = validateLatitude('91.0');
			expect(resultNorth.isValid).toBe(false);
			expect(resultNorth.clampedValue).toBeUndefined();
			expect(resultNorth.warning).toBeUndefined();

			const resultSouth = validateLatitude('-91.0');
			expect(resultSouth.isValid).toBe(false);
			expect(resultSouth.clampedValue).toBeUndefined();
			expect(resultSouth.warning).toBeUndefined();
		});

		it('should reject non-numeric values', () => {
			const result = validateLatitude('not-a-number');
			expect(result.isValid).toBe(false);
			expect(result.clampedValue).toBeUndefined();
			expect(result.warning).toBeUndefined();
		});

		it('should reject empty strings', () => {
			const result = validateLatitude('');
			expect(result.isValid).toBe(false);
			expect(result.clampedValue).toBeUndefined();
			expect(result.warning).toBeUndefined();
		});

		it('should provide accurate clamping values', () => {
			const testLatitude = '86.123456';
			const result = validateLatitude(testLatitude);
			
			expect(result.isValid).toBe(true);
			expect(result.clampedValue).toBe(WEB_MERCATOR_LATITUDE_LIMIT);
			expect(result.warning).toContain(testLatitude);
			expect(result.warning).toContain(WEB_MERCATOR_LATITUDE_LIMIT.toFixed(5));
		});

		it('should handle edge cases near the limit', () => {
			// Just above the limit
			const aboveLimit = (WEB_MERCATOR_LATITUDE_LIMIT + 0.001).toString();
			const resultAbove = validateLatitude(aboveLimit);
			expect(resultAbove.isValid).toBe(true);
			expect(resultAbove.clampedValue).toBe(WEB_MERCATOR_LATITUDE_LIMIT);

			// Just below the limit
			const belowLimit = (WEB_MERCATOR_LATITUDE_LIMIT - 0.001).toString();
			const resultBelow = validateLatitude(belowLimit);
			expect(resultBelow.isValid).toBe(true);
			expect(resultBelow.clampedValue).toBeUndefined();
		});
	});

	describe('Web Mercator Constants', () => {
		it('should have correct Web Mercator latitude limit', () => {
			// Standard Web Mercator limit is approximately 85.05112878°
			expect(WEB_MERCATOR_LATITUDE_LIMIT).toBeCloseTo(85.05112878, 6);
		});
	});
});