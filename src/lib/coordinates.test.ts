import { describe, it, expect } from 'vitest';
import { formatCoordinate } from './coordinates';

describe.each([
	{
		value: '0',
		latitude: false,
		decimal: '0',
		decimal_c: '0E',
		dms: '0°',
		dms_c: '0°E'
	},
	{
		value: '90',
		latitude: true,
		decimal: '90',
		decimal_c: '90N',
		dms: '90°',
		dms_c: '90°N'
	},
	{
		value: '-90',
		latitude: false,
		decimal: '-90',
		decimal_c: '90W',
		dms: '-90°',
		dms_c: '90°W'
	},
	{
		value: '180',
		latitude: true,
		decimal: '180',
		decimal_c: '180N',
		dms: '180°',
		dms_c: '180°N'
	},
	{
		value: '45.123456',
		latitude: true,
		decimal: '45.123456',
		decimal_c: '45.123456N',
		dms: '45°07\'24.44"',
		dms_c: '45°07\'24.44"N'
	},
	{
		value: '-45.123456',
		latitude: true,
		decimal: '-45.123456',
		decimal_c: '45.123456S',
		dms: '-45°07\'24.44"',
		dms_c: '45°07\'24.44"S'
	},
	{
		value: '123.456789',
		latitude: false,
		decimal: '123.456789',
		decimal_c: '123.456789E',
		dms: '123°27\'24.44"',
		dms_c: '123°27\'24.44"E'
	},
	{
		value: '-123.456789',
		latitude: false,
		decimal: '-123.456789',
		decimal_c: '123.456789W',
		dms: '-123°27\'24.44"',
		dms_c: '123°27\'24.44"W'
	},
	{
		value: '-98.45689',
		latitude: false,
		decimal: '-98.45689',
		decimal_c: '98.45689W',
		dms: '-98°27\'24.8"',
		dms_c: '98°27\'24.8"W'
	},
	{
		value: '45.5',
		latitude: true,
		decimal: '45.5',
		decimal_c: '45.5N',
		dms: "45°30'",
		dms_c: "45°30'N"
	},
	{
		value: '-123.5',
		latitude: false,
		decimal: '-123.5',
		decimal_c: '123.5W',
		dms: "-123°30'",
		dms_c: "123°30'W"
	}
])(
	'formatCoordinate',
	({ value, latitude, decimal, decimal_c, dms, dms_c }) => {
		// Decimal format
		it(`formats ${value} as decimal without cardinal`, () => {
			expect(formatCoordinate(value, latitude, 'decimal', false)).toBe(decimal);
		});

		it(`formats ${value} as decimal with cardinal`, () => {
			expect(formatCoordinate(value, latitude, 'decimal', true)).toBe(
				decimal_c
			);
		});

		// DMS format
		it(`formats ${value} as DMS without cardinal`, () => {
			expect(formatCoordinate(value, latitude, 'dms', false)).toBe(dms);
		});

		it(`formats ${value} as DMS with cardinal`, () => {
			expect(formatCoordinate(value, latitude, 'dms', true)).toBe(dms_c);
		});
	}
);
