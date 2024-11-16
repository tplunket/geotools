import { describe, it, expect } from 'vitest';
import { formatCoordinate } from './coordinates'; // We'll need to move the function to a separate file

describe('formatCoordinate', () => {
	describe('decimal format', () => {
		it('formats positive latitude without cardinal', () => {
			expect(formatCoordinate(45.123456, true, 'decimal', false)).toBe(
				'45.123456'
			);
		});

		it('formats negative latitude without cardinal', () => {
			expect(formatCoordinate(-45.123456, true, 'decimal', false)).toBe(
				'-45.123456'
			);
		});

		it('formats positive longitude without cardinal', () => {
			expect(formatCoordinate(123.456789, false, 'decimal', false)).toBe(
				'123.456789'
			);
		});

		it('formats positive latitude with cardinal', () => {
			expect(formatCoordinate(45.123456, true, 'decimal', true)).toBe(
				'45.123456N'
			);
		});

		it('formats negative longitude with cardinal', () => {
			expect(formatCoordinate(-123.456789, false, 'decimal', true)).toBe(
				'123.456789W'
			);
		});
	});

	describe('DMS format', () => {
		it('formats positive latitude without cardinal', () => {
			expect(formatCoordinate(45.5, true, 'dms', false)).toBe('45°30\'0.00"');
		});

		it('formats negative longitude without cardinal', () => {
			expect(formatCoordinate(-123.5, false, 'dms', false)).toBe(
				'-123°30\'0.00"'
			);
		});

		it('formats negative longitude with cardinal', () => {
			expect(formatCoordinate(-123.5, false, 'dms', true)).toBe(
				'123°30\'0.00"W'
			);
		});
	});
});
