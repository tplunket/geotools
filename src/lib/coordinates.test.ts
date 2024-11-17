import { describe, it, expect } from 'vitest';
import { formatCoordinate, isValidCoordinate } from './coordinates';

describe('isValidCoordinate', () => {
	// Latitude tests
	it.each([
		['0', true],
		['90', true],
		['-90', true],
		['45.123456', true],
		['90.1', false],
		['-90.1', false],
		['', false],
		['invalid', false]
	])('validates latitude value %s as %s', (value, expected) => {
		expect(isValidCoordinate(value, true)).toBe(expected);
	});

	// Longitude tests
	it.each([
		['0', true],
		['180', true],
		['-180', true],
		['123.456789', true],
		['180.1', false],
		['-180.1', false],
		['', false],
		['invalid', false]
	])('validates longitude value %s as %s', (value, expected) => {
		expect(isValidCoordinate(value, false)).toBe(expected);
	});
});

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
	},
	{
		value: '35.28',
		latitude: true,
		decimal: '35.28',
		decimal_c: '35.28N',
		dms: '35°16\'48"',
		dms_c: '35°16\'48"N'
	},
	{
		value: '110.732',
		latitude: false,
		decimal: '110.732',
		decimal_c: '110.732E',
		dms: '110°43\'55.2"',
		dms_c: '110°43\'55.2"E'
	},
	{
		value: '-40.12',
		latitude: true,
		decimal: '-40.12',
		decimal_c: '40.12S',
		dms: '-40°07\'12"',
		dms_c: '40°07\'12"S'
	},
	{
		value: '-84.1213',
		latitude: false,
		decimal: '-84.1213',
		decimal_c: '84.1213W',
		dms: '-84°07\'16.68"',
		dms_c: '84°07\'16.68"W'
	},
	{
		value: '-99.999999', // testing the cascading of rounding
		latitude: false,
		decimal: '-99.999999',
		decimal_c: '99.999999W',
		dms: '-100°',
		dms_c: '100°W'
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
