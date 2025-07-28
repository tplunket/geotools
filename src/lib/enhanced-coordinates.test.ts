/// <reference types="@vitest/browser/matchers" />
import { describe, it, expect } from 'vitest';
import {
	parseCoordinateExact,
	exactToDecimal,
	exactToDisplayString,
	parseCoordinateStream,
	analyzeCoordinateStream,
	pairCoordinates,
	determineCoordinateType,
	validateCardinalRange,
	validateInferredRange
} from './enhanced-coordinates';
import { PairingStrategy } from './types';

describe('Enhanced Coordinates', () => {
	describe('parseCoordinateExact', () => {
		describe('Invalid inputs', () => {
			it('should return null for null/undefined input', () => {
				expect(parseCoordinateExact(null as any)).toBe(null);
				expect(parseCoordinateExact(undefined as any)).toBe(null);
				expect(parseCoordinateExact('')).toBe(null);
				expect(parseCoordinateExact('   ')).toBe(null);
			});

			it('should return null for non-string input', () => {
				expect(parseCoordinateExact(123 as any)).toBe(null);
				expect(parseCoordinateExact({} as any)).toBe(null);
			});

			it('should return null for invalid formats', () => {
				expect(parseCoordinateExact('abc')).toBe(null);
				expect(parseCoordinateExact('°')).toBe(null);
				expect(parseCoordinateExact('45°60')).toBe(null); // Invalid minutes
				expect(parseCoordinateExact('45°30\'60"')).toBe(null); // Invalid seconds
			});

			it('should handle negative signs in DMS by treating as overall negative', () => {
				const result = parseCoordinateExact('-45°30\'');
				expect(result?.isNegative).toBe(true);
				expect(result?.degrees).toBe(45);
				
				// But negative minutes/seconds should be rejected
				expect(parseCoordinateExact('45°-30\'')).toBe(null);
				expect(parseCoordinateExact('45°30\'-15"')).toBe(null);
			});
		});

		describe('Decimal format parsing', () => {
			it('should parse simple decimal degrees', () => {
				const result = parseCoordinateExact('45.5');
				expect(result).toEqual({
					degrees: 45,
					numerator: 5,
					denominator: 10,
					isNegative: false,
					cardinal: undefined,
					isExplicit: false
				});
			});

			it('should parse negative decimal degrees', () => {
				const result = parseCoordinateExact('-122.25');
				expect(result).toEqual({
					degrees: 122,
					numerator: 25,
					denominator: 100,
					isNegative: true,
					cardinal: undefined,
					isExplicit: false
				});
			});

			it('should parse decimal with cardinal directions', () => {
				const result = parseCoordinateExact('45.5N');
				expect(result).toEqual({
					degrees: 45,
					numerator: 5,
					denominator: 10,
					isNegative: false,
					cardinal: 'N',
					isLatitude: true,
					isExplicit: true
				});
			});

			it('should handle cardinal directions as negative', () => {
				const resultS = parseCoordinateExact('45.5S');
				expect(resultS?.isNegative).toBe(true);
				expect(resultS?.cardinal).toBe('S');

				const resultW = parseCoordinateExact('122.25W');
				expect(resultW?.isNegative).toBe(true);
				expect(resultW?.cardinal).toBe('W');
			});

			it('should parse whole numbers', () => {
				const result = parseCoordinateExact('45');
				expect(result).toEqual({
					degrees: 45,
					numerator: 0,
					denominator: 1,
					isNegative: false,
					cardinal: undefined,
					isExplicit: false
				});
			});

			it('should handle high precision decimals', () => {
				const result = parseCoordinateExact('45.123456');
				expect(result?.degrees).toBe(45);
				expect(result?.numerator).toBe(123456);
				expect(result?.denominator).toBe(1000000);
			});
		});

		describe('DMS format parsing', () => {
			it('should parse degrees with symbol', () => {
				const result = parseCoordinateExact('45°');
				expect(result).toEqual({
					degrees: 45,
					numerator: 0,
					denominator: 1,
					isNegative: false,
					cardinal: undefined,
					isExplicit: false
				});
			});

			it('should parse degrees with letter', () => {
				const result = parseCoordinateExact('45d');
				expect(result?.degrees).toBe(45);
				expect(result?.denominator).toBe(1);
			});

			it('should parse degrees and minutes', () => {
				const result = parseCoordinateExact('45°30\'');
				expect(result).toEqual({
					degrees: 45,
					numerator: 30,
					denominator: 60,
					isNegative: false,
					cardinal: undefined,
					isExplicit: false
				});
			});

			it('should parse degrees and decimal minutes', () => {
				const result = parseCoordinateExact('45°30.5\'');
				expect(result?.degrees).toBe(45);
				expect(result?.numerator).toBe(305);
				expect(result?.denominator).toBe(600);
			});

			it('should parse full DMS', () => {
				const result = parseCoordinateExact('45°30\'15"');
				expect(result).toEqual({
					degrees: 45,
					numerator: 1815, // 30*60 + 15
					denominator: 3600,
					isNegative: false,
					cardinal: undefined,
					isExplicit: false
				});
			});

			it('should parse DMS with decimal seconds', () => {
				const result = parseCoordinateExact('45°30\'15.25"');
				expect(result?.degrees).toBe(45);
				expect(result?.numerator).toBe(181525); // (30*60 + 15)*100 + 25
				expect(result?.denominator).toBe(360000);
			});

			it('should parse DMS with cardinal directions', () => {
				const result = parseCoordinateExact('45°30\'15"N');
				expect(result?.cardinal).toBe('N');
				expect(result?.isLatitude).toBe(true);
				expect(result?.isExplicit).toBe(true);
			});

			it('should parse mixed notation (degrees symbol, minutes letter)', () => {
				const result = parseCoordinateExact('45°30m');
				expect(result?.degrees).toBe(45);
				expect(result?.numerator).toBe(30);
				expect(result?.denominator).toBe(60);
			});

			it('should handle spaces in DMS', () => {
				const result = parseCoordinateExact('45° 30\' 15"');
				expect(result?.degrees).toBe(45);
				expect(result?.numerator).toBe(1815);
			});

			it('should handle letter notation', () => {
				const result = parseCoordinateExact('45d30m15s');
				expect(result?.degrees).toBe(45);
				expect(result?.numerator).toBe(1815);
				expect(result?.denominator).toBe(3600);
			});
		});

		describe('Edge cases', () => {
			it('should handle lowercase cardinals', () => {
				const result = parseCoordinateExact('45n');
				expect(result?.cardinal).toBe('N');
			});

			it('should handle boundary values', () => {
				expect(parseCoordinateExact('0°')).toBeTruthy();
				expect(parseCoordinateExact('90°')).toBeTruthy();
				expect(parseCoordinateExact('180°')).toBeTruthy();
			});

			it('should handle boundary minutes and seconds', () => {
				expect(parseCoordinateExact('45°59\'59"')).toBeTruthy();
				expect(parseCoordinateExact('45°0\'0"')).toBeTruthy();
			});
		});
	});

	describe('exactToDecimal', () => {
		it('should convert simple degrees', () => {
			const coord = {
				degrees: 45,
				numerator: 0,
				denominator: 1,
				isNegative: false,
				isExplicit: false
			};
			expect(exactToDecimal(coord)).toBe(45);
		});

		it('should convert negative coordinates', () => {
			const coord = {
				degrees: 45,
				numerator: 5,
				denominator: 10,
				isNegative: true,
				isExplicit: false
			};
			expect(exactToDecimal(coord)).toBe(-45.5);
		});

		it('should convert DMS to decimal', () => {
			const coord = {
				degrees: 45,
				numerator: 1815, // 30*60 + 15
				denominator: 3600,
				isNegative: false,
				isExplicit: false
			};
			expect(exactToDecimal(coord)).toBeCloseTo(45.50416667);
		});

		it('should handle high precision', () => {
			const coord = {
				degrees: 45,
				numerator: 123456,
				denominator: 1000000,
				isNegative: false,
				isExplicit: false
			};
			expect(exactToDecimal(coord)).toBe(45.123456);
		});
	});

	describe('exactToDisplayString', () => {
		it('should display simple degrees', () => {
			const coord = {
				degrees: 45,
				numerator: 0,
				denominator: 1,
				isNegative: false,
				isExplicit: false
			};
			expect(exactToDisplayString(coord)).toBe('45°');
		});

		it('should display with cardinal directions', () => {
			const coord = {
				degrees: 45,
				numerator: 5,
				denominator: 10,
				isNegative: false,
				cardinal: 'N' as const,
				isExplicit: true
			};
			expect(exactToDisplayString(coord)).toBe('45.5°N');
		});

		it('should display negative coordinates', () => {
			const coord = {
				degrees: 45,
				numerator: 5,
				denominator: 10,
				isNegative: true,
				isExplicit: false
			};
			expect(exactToDisplayString(coord)).toBe('-45.5°');
		});

		it('should remove trailing zeros', () => {
			const coord = {
				degrees: 45,
				numerator: 500000,
				denominator: 1000000,
				isNegative: false,
				isExplicit: false
			};
			expect(exactToDisplayString(coord)).toBe('45.5°');
		});
	});

	describe('parseCoordinateStream', () => {
		it('should handle empty/invalid input', () => {
			expect(parseCoordinateStream('')).toEqual([]);
			expect(parseCoordinateStream(null as any)).toEqual([]);
			expect(parseCoordinateStream(undefined as any)).toEqual([]);
		});

		it('should parse comma-separated coordinates', () => {
			const result = parseCoordinateStream('45.5, -122.25');
			expect(result).toHaveLength(2);
			expect(result[0]?.degrees).toBe(45);
			expect(result[1]?.degrees).toBe(122);
			expect(result[1]?.isNegative).toBe(true);
		});

		it('should parse space-separated coordinates', () => {
			const result = parseCoordinateStream('45.5 -122.25');
			expect(result).toHaveLength(2);
		});

		it('should parse newline-separated coordinates', () => {
			const result = parseCoordinateStream('45.5\n-122.25');
			expect(result).toHaveLength(2);
		});

		it('should parse mixed separators', () => {
			const result = parseCoordinateStream('45°30\'N, 122°15\'W\n40.7N\t74.0W');
			expect(result).toHaveLength(4);
		});

		it('should filter out invalid coordinates', () => {
			const result = parseCoordinateStream('45.5, invalid, 122.25');
			expect(result).toHaveLength(2);
		});

		it('should handle DMS coordinates', () => {
			const result = parseCoordinateStream('45°30\'15"N, 122°15\'30"W');
			expect(result).toHaveLength(2);
			expect(result[0]?.cardinal).toBe('N');
			expect(result[1]?.cardinal).toBe('W');
		});
	});

	describe('analyzeCoordinateStream', () => {
		it('should detect explicit cardinals strategy', () => {
			const coords = parseCoordinateStream('45°N, 122°W, 40°N, 74°W');
			const analysis = analyzeCoordinateStream(coords);
			
			expect(analysis.explicitLatitudes).toBe(2);
			expect(analysis.explicitLongitudes).toBe(2);
			expect(analysis.suggestedStrategy).toBe(PairingStrategy.EXPLICIT_CARDINALS);
			expect(analysis.confidence).toBe(0.95);
		});

		it('should detect mixed cardinals strategy', () => {
			const coords = parseCoordinateStream('45°N, 122, 40°S, 74');
			const analysis = analyzeCoordinateStream(coords);
			
			expect(analysis.suggestedStrategy).toBe(PairingStrategy.MIXED_CARDINALS);
			expect(analysis.confidence).toBe(0.85);
		});

		it('should detect alternating pattern for latitude-longitude pairs', () => {
			const coords = parseCoordinateStream('45.5, 122.25, 40.7, 74.0');
			const analysis = analyzeCoordinateStream(coords);
			
			expect(analysis.ambiguousCoordinates).toBe(4);
			// The algorithm should detect alternating pattern (lat-lon, lat-lon)
			expect(analysis.suggestedStrategy).toBe(PairingStrategy.ALTERNATING_TYPES);
		});

		it('should detect user order strategy for non-alternating ambiguous coordinates', () => {
			const coords = parseCoordinateStream('95, 195, 85, 185'); // Values that don't follow lat-lon pattern
			const analysis = analyzeCoordinateStream(coords);
			
			expect(analysis.ambiguousCoordinates).toBe(4);
			expect(analysis.suggestedStrategy).toBe(PairingStrategy.USER_ORDER);
		});

		it('should detect alternating pattern', () => {
			const coords = parseCoordinateStream('45, 122, 40, 170, 35, 130'); // lat, lon pattern
			const analysis = analyzeCoordinateStream(coords);
			
			expect(analysis.suggestedStrategy).toBe(PairingStrategy.ALTERNATING_TYPES);
			expect(analysis.confidence).toBe(0.75);
		});

		it('should add warning for odd number of coordinates', () => {
			const coords = parseCoordinateStream('45, 122, 40');
			const analysis = analyzeCoordinateStream(coords);
			
			expect(analysis.warnings).toContain('Odd number of coordinates (3). Last coordinate will be unpaired.');
		});

		it('should add warning for unbalanced cardinals', () => {
			const coords = parseCoordinateStream('45°N, 122, 40°N');
			const analysis = analyzeCoordinateStream(coords);
			
			expect(analysis.warnings).toContain('Unbalanced cardinal directions: 2 latitudes, 0 longitudes.');
		});

		it('should handle empty coordinate stream', () => {
			const analysis = analyzeCoordinateStream([]);
			
			expect(analysis.totalCoordinates).toBe(0);
			expect(analysis.suggestedStrategy).toBe(PairingStrategy.AMBIGUOUS);
			expect(analysis.confidence).toBe(0);
		});
	});

	describe('pairCoordinates', () => {
		describe('Explicit cardinals pairing', () => {
			it('should pair coordinates with explicit cardinals', () => {
				const coords = parseCoordinateStream('45°N, 122°W, 40°S, 74°E');
				const analysis = analyzeCoordinateStream(coords);
				const result = pairCoordinates(coords, analysis, 'lat-lon');
				
				expect(result.pairs).toHaveLength(2);
				expect(result.pairs[0]?.strategy).toBe(PairingStrategy.EXPLICIT_CARDINALS);
				expect(result.pairs[0]?.confidence).toBe(0.95);
				expect(result.unpaired).toHaveLength(0);
			});

			it('should handle unbalanced explicit cardinals', () => {
				const coords = parseCoordinateStream('45°N, 122°W, 40°S');
				const analysis = analyzeCoordinateStream(coords);
				const result = pairCoordinates(coords, analysis, 'lat-lon');
				
				expect(result.pairs).toHaveLength(1);
				expect(result.unpaired).toHaveLength(1);
			});
		});

		describe('Mixed cardinals pairing', () => {
			it('should pair mixed explicit and ambiguous coordinates', () => {
				const coords = parseCoordinateStream('45°N, 122, 40°S, 74');
				const analysis = { ...analyzeCoordinateStream(coords), suggestedStrategy: PairingStrategy.MIXED_CARDINALS };
				const result = pairCoordinates(coords, analysis, 'lat-lon');
				
				expect(result.pairs).toHaveLength(2);
				expect(result.pairs[0]?.strategy).toBe(PairingStrategy.MIXED_CARDINALS);
			});
		});

		describe('Alternating types pairing', () => {
			it('should pair by alternating pattern', () => {
				const coords = parseCoordinateStream('45, 122, 40, 170'); // lat-lon pattern
				const analysis = { ...analyzeCoordinateStream(coords), suggestedStrategy: PairingStrategy.ALTERNATING_TYPES };
				const result = pairCoordinates(coords, analysis, 'lat-lon');
				
				expect(result.pairs).toHaveLength(2);
				expect(result.pairs[0]?.strategy).toBe(PairingStrategy.ALTERNATING_TYPES);
				expect(result.pairs[0]?.confidence).toBe(0.75);
			});
		});

		describe('User order pairing', () => {
			it('should pair by user order preference (lat-lon)', () => {
				const coords = parseCoordinateStream('45, 122, 40, 170');
				const analysis = { ...analyzeCoordinateStream(coords), suggestedStrategy: PairingStrategy.USER_ORDER };
				const result = pairCoordinates(coords, analysis, 'lat-lon');
				
				expect(result.pairs).toHaveLength(2);
				expect(result.pairs[0]?.strategy).toBe(PairingStrategy.USER_ORDER);
				
				// First coordinate should be latitude in lat-lon order
				expect(exactToDecimal(result.pairs[0]!.first)).toBe(45);
				expect(exactToDecimal(result.pairs[0]!.second)).toBe(122);
			});

			it('should pair by user order preference (lon-lat)', () => {
				const coords = parseCoordinateStream('122, 45, 170, 40');
				const analysis = { ...analyzeCoordinateStream(coords), suggestedStrategy: PairingStrategy.USER_ORDER };
				const result = pairCoordinates(coords, analysis, 'lon-lat');
				
				expect(result.pairs).toHaveLength(2);
				
				// First coordinate should be longitude, second latitude in lon-lat order
				expect(exactToDecimal(result.pairs[0]!.first)).toBe(45); // latitude (from second position)
				expect(exactToDecimal(result.pairs[0]!.second)).toBe(122); // longitude (from first position)
			});

			it('should increase confidence for valid ranges', () => {
				const coords = parseCoordinateStream('45, 122'); // Valid lat-lon ranges
				const analysis = { ...analyzeCoordinateStream(coords), suggestedStrategy: PairingStrategy.USER_ORDER };
				const result = pairCoordinates(coords, analysis, 'lat-lon');
				
				expect(result.pairs[0]?.confidence).toBe(0.7); // Increased from 0.5
			});

			it('should keep low confidence for questionable ranges', () => {
				const coords = parseCoordinateStream('200, 45'); // Invalid longitude in lat-lon order
				const analysis = { ...analyzeCoordinateStream(coords), suggestedStrategy: PairingStrategy.USER_ORDER };
				const result = pairCoordinates(coords, analysis, 'lat-lon');
				
				expect(result.pairs[0]?.confidence).toBe(0.5); // Not increased
			});
		});

		it('should handle odd number of coordinates', () => {
			const coords = parseCoordinateStream('45, 122, 40');
			const analysis = analyzeCoordinateStream(coords);
			const result = pairCoordinates(coords, analysis, 'lat-lon');
			
			expect(result.pairs).toHaveLength(1);
			expect(result.unpaired).toHaveLength(1);
		});
	});

	describe('determineCoordinateType', () => {
		it('should determine latitude from N/S cardinals', () => {
			const coordN = { degrees: 45, numerator: 0, denominator: 1, isNegative: false, cardinal: 'N' as const, isExplicit: true };
			const coordS = { degrees: 45, numerator: 0, denominator: 1, isNegative: false, cardinal: 'S' as const, isExplicit: true };
			
			expect(determineCoordinateType(coordN)).toBe('latitude');
			expect(determineCoordinateType(coordS)).toBe('latitude');
		});

		it('should determine longitude from E/W cardinals', () => {
			const coordE = { degrees: 122, numerator: 0, denominator: 1, isNegative: false, cardinal: 'E' as const, isExplicit: true };
			const coordW = { degrees: 122, numerator: 0, denominator: 1, isNegative: false, cardinal: 'W' as const, isExplicit: true };
			
			expect(determineCoordinateType(coordE)).toBe('longitude');
			expect(determineCoordinateType(coordW)).toBe('longitude');
		});

		it('should return ambiguous for no cardinal', () => {
			const coord = { degrees: 45, numerator: 0, denominator: 1, isNegative: false, isExplicit: false };
			expect(determineCoordinateType(coord)).toBe('ambiguous');
		});
	});

	describe('validateCardinalRange', () => {
		it('should validate latitude cardinals in range', () => {
			const coord = { degrees: 45, numerator: 0, denominator: 1, isNegative: false, cardinal: 'N' as const, isExplicit: true };
			const result = validateCardinalRange(coord);
			expect(result.isValid).toBe(true);
		});

		it('should validate longitude cardinals in range', () => {
			const coord = { degrees: 122, numerator: 0, denominator: 1, isNegative: false, cardinal: 'E' as const, isExplicit: true };
			const result = validateCardinalRange(coord);
			expect(result.isValid).toBe(true);
		});

		it('should reject latitude cardinals out of range', () => {
			const coord = { degrees: 95, numerator: 0, denominator: 1, isNegative: false, cardinal: 'N' as const, isExplicit: true };
			const result = validateCardinalRange(coord);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('out of range');
		});

		it('should reject longitude cardinals out of range', () => {
			const coord = { degrees: 190, numerator: 0, denominator: 1, isNegative: false, cardinal: 'E' as const, isExplicit: true };
			const result = validateCardinalRange(coord);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('out of range');
		});

		it('should pass validation for coordinates without cardinals', () => {
			const coord = { degrees: 95, numerator: 0, denominator: 1, isNegative: false, isExplicit: false };
			const result = validateCardinalRange(coord);
			expect(result.isValid).toBe(true);
		});
	});

	describe('validateInferredRange', () => {
		it('should validate latitude range', () => {
			const coord = { degrees: 45, numerator: 0, denominator: 1, isNegative: false, isExplicit: false };
			const result = validateInferredRange(coord, 'latitude');
			expect(result.isValid).toBe(true);
		});

		it('should validate longitude range', () => {
			const coord = { degrees: 122, numerator: 0, denominator: 1, isNegative: false, isExplicit: false };
			const result = validateInferredRange(coord, 'longitude');
			expect(result.isValid).toBe(true);
		});

		it('should reject latitude out of range', () => {
			const coord = { degrees: 95, numerator: 0, denominator: 1, isNegative: false, isExplicit: false };
			const result = validateInferredRange(coord, 'latitude');
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('-90° to +90°');
		});

		it('should reject negative latitude out of range', () => {
			const coord = { degrees: 95, numerator: 0, denominator: 1, isNegative: true, isExplicit: false };
			const result = validateInferredRange(coord, 'latitude');
			expect(result.isValid).toBe(false);
		});

		it('should reject longitude out of range', () => {
			const coord = { degrees: 190, numerator: 0, denominator: 1, isNegative: false, isExplicit: false };
			const result = validateInferredRange(coord, 'longitude');
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('-180° to +180°');
		});

		it('should validate boundary values', () => {
			// Latitude boundaries
			const lat90 = { degrees: 90, numerator: 0, denominator: 1, isNegative: false, isExplicit: false };
			const latNeg90 = { degrees: 90, numerator: 0, denominator: 1, isNegative: true, isExplicit: false };
			expect(validateInferredRange(lat90, 'latitude').isValid).toBe(true);
			expect(validateInferredRange(latNeg90, 'latitude').isValid).toBe(true);

			// Longitude boundaries
			const lon180 = { degrees: 180, numerator: 0, denominator: 1, isNegative: false, isExplicit: false };
			const lonNeg180 = { degrees: 180, numerator: 0, denominator: 1, isNegative: true, isExplicit: false };
			expect(validateInferredRange(lon180, 'longitude').isValid).toBe(true);
			expect(validateInferredRange(lonNeg180, 'longitude').isValid).toBe(true);
		});
	});
});