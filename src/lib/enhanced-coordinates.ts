import type { 
	ExactCoordinate, 
	PairingAnalysis, 
	CoordinatePair, 
	CoordinatePairingResult,
	ValidationResult 
} from './types';
import { PairingStrategy } from './types';

// Regex patterns for coordinate parsing
const DMS_PATTERNS = {
	// Full DMS: 45°30'15.25"N or 45d30m15.25sN
	FULL_DMS: /^([+-]?\d+)[°d]\s*(\d+)['"m]\s*(\d+(?:\.\d+)?)['"s]?\s*([NSEW]?)$/i,
	
	// Degrees + Minutes: 45°30.5'N or 45d30.5mN  
	DEG_MIN: /^([+-]?\d+)[°d]\s*(\d+(?:\.\d+)?)['"m]\s*([NSEW]?)$/i,
	
	// Degrees only: 45°N or 45dN
	DEG_ONLY: /^([+-]?\d+)[°d]\s*([NSEW]?)$/i,
	
	// Decimal fallback: 45.123 or -122.456
	DECIMAL: /^([+-]?\d+(?:\.\d+)?)\s*([NSEW]?)$/
};

/**
 * Parse a single coordinate string into ExactCoordinate representation
 */
export function parseCoordinateExact(input: string): ExactCoordinate | null {
	if (!input || typeof input !== 'string') {
		return null;
	}
	
	const normalized = input.trim().toUpperCase();
	if (normalized === '') {
		return null;
	}
	
	// Extract cardinal direction first
	const cardinalMatch = normalized.match(/([NSEW])$/);
	const cardinal = cardinalMatch?.[1] as 'N' | 'S' | 'E' | 'W' | undefined;
	const numericPart = cardinal ? normalized.slice(0, -1).trim() : normalized;
	
	// Determine sign
	const isNegative = numericPart.startsWith('-') || cardinal === 'S' || cardinal === 'W';
	const absolutePart = numericPart.replace(/^[+-]/, '');
	
	// Try different parsing strategies
	const result = (
		parseDMS(absolutePart, isNegative, cardinal) ||
		parseDecimal(absolutePart, isNegative, cardinal)
	);
	
	if (result && cardinal) {
		result.isLatitude = cardinal === 'N' || cardinal === 'S';
		result.isExplicit = true;
	}
	
	return result;
}

/**
 * Parse DMS format coordinates
 */
function parseDMS(input: string, isNegative: boolean, cardinal?: 'N' | 'S' | 'E' | 'W'): ExactCoordinate | null {
	// Try full DMS first
	let match = input.match(DMS_PATTERNS.FULL_DMS);
	if (match) {
		const degrees = parseInt(match[1]);
		const minutes = parseFloat(match[2]);
		const seconds = parseFloat(match[3]);
		
		if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds) || 
			degrees < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
			return null;
		}
		
		return createDMSCoordinate(degrees, minutes, seconds, isNegative, cardinal);
	}
	
	// Try degrees + minutes
	match = input.match(DMS_PATTERNS.DEG_MIN);
	if (match) {
		const degrees = parseInt(match[1]);
		const minutes = parseFloat(match[2]);
		
		if (isNaN(degrees) || isNaN(minutes) || 
			degrees < 0 || minutes < 0 || minutes >= 60) {
			return null;
		}
		
		return createDMSCoordinate(degrees, minutes, 0, isNegative, cardinal);
	}
	
	// Try degrees only
	match = input.match(DMS_PATTERNS.DEG_ONLY);
	if (match) {
		const degrees = parseInt(match[1]);
		
		if (isNaN(degrees) || degrees < 0) {
			return null;
		}
		
		return createDMSCoordinate(degrees, 0, 0, isNegative, cardinal);
	}
	
	return null;
}

/**
 * Create DMS coordinate with exact fractional representation
 */
function createDMSCoordinate(
	degrees: number, 
	minutes: number, 
	seconds: number, 
	isNegative: boolean, 
	cardinal?: 'N' | 'S' | 'E' | 'W'
): ExactCoordinate {
	if (seconds > 0) {
		// Has seconds - use 3600 base or higher for decimals
		const secondsInt = Math.floor(seconds);
		const secondsDecimal = seconds - secondsInt;
		
		if (secondsDecimal > 0) {
			// Decimal seconds: find appropriate power of 10
			const decimalStr = secondsDecimal.toString().split('.')[1] || '';
			const decimalPlaces = decimalStr.length;
			const multiplier = Math.pow(10, decimalPlaces);
			
			const totalNumerator = (minutes * 60 + secondsInt) * multiplier + 
								 Math.round(secondsDecimal * multiplier);
			const totalDenominator = 3600 * multiplier;
			
			return {
				degrees,
				numerator: totalNumerator,
				denominator: totalDenominator,
				isNegative,
				cardinal,
				isExplicit: !!cardinal
			};
		} else {
			// Whole seconds
			return {
				degrees,
				numerator: minutes * 60 + secondsInt,
				denominator: 3600,
				isNegative,
				cardinal,
				isExplicit: !!cardinal
			};
		}
	} else if (minutes > 0) {
		// Has minutes only
		const minutesInt = Math.floor(minutes);
		const minutesDecimal = minutes - minutesInt;
		
		if (minutesDecimal > 0) {
			const decimalStr = minutesDecimal.toString().split('.')[1] || '';
			const decimalPlaces = decimalStr.length;
			const multiplier = Math.pow(10, decimalPlaces);
			
			return {
				degrees,
				numerator: minutesInt * multiplier + Math.round(minutesDecimal * multiplier),
				denominator: 60 * multiplier,
				isNegative,
				cardinal,
				isExplicit: !!cardinal
			};
		} else {
			return {
				degrees,
				numerator: minutesInt,
				denominator: 60,
				isNegative,
				cardinal,
				isExplicit: !!cardinal
			};
		}
	} else {
		// Degrees only
		return {
			degrees,
			numerator: 0,
			denominator: 1,
			isNegative,
			cardinal,
			isExplicit: !!cardinal
		};
	}
}

/**
 * Parse decimal format coordinates
 */
function parseDecimal(input: string, isNegative: boolean, cardinal?: 'N' | 'S' | 'E' | 'W'): ExactCoordinate | null {
	const match = input.match(DMS_PATTERNS.DECIMAL);
	if (!match) {
		return null;
	}
	
	const fullNumber = parseFloat(match[1]);
	if (isNaN(fullNumber) || fullNumber < 0) {
		return null;
	}
	
	const degrees = Math.floor(fullNumber);
	const fractionalPart = fullNumber - degrees;
	
	if (fractionalPart === 0) {
		return {
			degrees,
			numerator: 0,
			denominator: 1,
			isNegative,
			cardinal,
			isExplicit: !!cardinal
		};
	} else {
		// Extract decimal places for exact representation
		const fullStr = match[1];
		const decimalIndex = fullStr.indexOf('.');
		if (decimalIndex === -1) {
			return {
				degrees,
				numerator: 0,
				denominator: 1,
				isNegative,
				cardinal,
				isExplicit: !!cardinal
			};
		}
		
		const decimalStr = fullStr.substring(decimalIndex + 1);
		const numerator = parseInt(decimalStr);
		const denominator = Math.pow(10, decimalStr.length);
		
		return {
			degrees,
			numerator,
			denominator,
			isNegative,
			cardinal,
			isExplicit: !!cardinal
		};
	}
}

/**
 * Convert ExactCoordinate to decimal value
 */
export function exactToDecimal(coord: ExactCoordinate): number {
	const fractionalPart = coord.numerator / coord.denominator;
	const absoluteValue = coord.degrees + fractionalPart;
	return coord.isNegative ? -absoluteValue : absoluteValue;
}

/**
 * Convert ExactCoordinate to display string
 */
export function exactToDisplayString(coord: ExactCoordinate): string {
	const fractionalPart = coord.numerator / coord.denominator;
	const absoluteValue = coord.degrees + fractionalPart;
	const value = coord.isNegative ? -absoluteValue : absoluteValue;
	
	if (coord.cardinal) {
		return `${Math.abs(value).toFixed(6)}°${coord.cardinal}`.replace(/\.?0+°/, '°');
	} else {
		return `${value.toFixed(6)}°`.replace(/\.?0+°/, '°');
	}
}

/**
 * Parse multiple coordinates from text input
 */
export function parseCoordinateStream(input: string): ExactCoordinate[] {
	if (!input || typeof input !== 'string') {
		return [];
	}
	
	return input
		.split(/[,\s\n\t]+/)
		.map(token => token.trim())
		.filter(token => token.length > 0)
		.map(parseCoordinateExact)
		.filter((coord): coord is ExactCoordinate => coord !== null);
}

/**
 * Analyze coordinate stream for pairing strategies
 */
export function analyzeCoordinateStream(coords: ExactCoordinate[]): PairingAnalysis {
	const explicitLat = coords.filter(c => c.cardinal === 'N' || c.cardinal === 'S').length;
	const explicitLon = coords.filter(c => c.cardinal === 'E' || c.cardinal === 'W').length;
	const ambiguous = coords.filter(c => !c.cardinal).length;
	
	const analysis: PairingAnalysis = {
		totalCoordinates: coords.length,
		explicitLatitudes: explicitLat,
		explicitLongitudes: explicitLon,
		ambiguousCoordinates: ambiguous,
		suggestedStrategy: PairingStrategy.AMBIGUOUS,
		confidence: 0,
		warnings: []
	};
	
	// Strategy detection logic
	if (coords.length === 0) {
		analysis.suggestedStrategy = PairingStrategy.AMBIGUOUS;
		analysis.confidence = 0;
	} else if (explicitLat > 0 && explicitLon > 0 && explicitLat === explicitLon) {
		analysis.suggestedStrategy = PairingStrategy.EXPLICIT_CARDINALS;
		analysis.confidence = 0.95;
	} else if ((explicitLat > 0 || explicitLon > 0) && explicitLat + explicitLon === coords.length / 2) {
		analysis.suggestedStrategy = PairingStrategy.MIXED_CARDINALS;
		analysis.confidence = 0.85;
	} else if (coords.length % 2 === 0 && ambiguous === coords.length && coords.length >= 4) {
		const alternatingStrategy = detectAlternatingPattern(coords);
		analysis.suggestedStrategy = alternatingStrategy || PairingStrategy.USER_ORDER;
		analysis.confidence = alternatingStrategy === PairingStrategy.ALTERNATING_TYPES ? 0.75 : 0.5;
	} else {
		analysis.suggestedStrategy = PairingStrategy.USER_ORDER;
		analysis.confidence = coords.length > 0 ? 0.3 : 0;
	}
	
	// Add warnings
	if (coords.length % 2 !== 0) {
		analysis.warnings.push(`Odd number of coordinates (${coords.length}). Last coordinate will be unpaired.`);
	}
	
	if (explicitLat !== explicitLon && (explicitLat > 0 || explicitLon > 0)) {
		analysis.warnings.push(`Unbalanced cardinal directions: ${explicitLat} latitudes, ${explicitLon} longitudes.`);
	}
	
	return analysis;
}

/**
 * Detect alternating lat/lon pattern
 */
function detectAlternatingPattern(coords: ExactCoordinate[]): PairingStrategy | null {
	if (coords.length < 4) return null; // Need at least 2 pairs to detect pattern
	
	// Check if even positions are consistently one type and odd are another
	const evenInLatRange = coords.filter((_, i) => i % 2 === 0).every(c => isLikelyLatitude(c));
	const oddInLonRange = coords.filter((_, i) => i % 2 === 1).every(c => isLikelyLongitude(c));
	
	const evenInLonRange = coords.filter((_, i) => i % 2 === 0).every(c => isLikelyLongitude(c));
	const oddInLatRange = coords.filter((_, i) => i % 2 === 1).every(c => isLikelyLatitude(c));
	
	if ((evenInLatRange && oddInLonRange) || (evenInLonRange && oddInLatRange)) {
		return PairingStrategy.ALTERNATING_TYPES;
	}
	
	return null;
}

/**
 * Check if coordinate is likely a latitude (≤90°)
 */
function isLikelyLatitude(coord: ExactCoordinate): boolean {
	const value = Math.abs(exactToDecimal(coord));
	return value <= 90;
}

/**
 * Check if coordinate is likely a longitude (≤180°)
 */
function isLikelyLongitude(coord: ExactCoordinate): boolean {
	const value = Math.abs(exactToDecimal(coord));
	return value <= 180;
}

/**
 * Determine coordinate type from cardinal
 */
export function determineCoordinateType(coord: ExactCoordinate): 'latitude' | 'longitude' | 'ambiguous' {
	if (coord.cardinal) {
		return (coord.cardinal === 'N' || coord.cardinal === 'S') ? 'latitude' : 'longitude';
	}
	return 'ambiguous';
}

/**
 * Get validation constraints for cardinal directions
 */
function getCardinalConstraints(cardinal: 'N' | 'S' | 'E' | 'W'): { min: number, max: number } {
	switch (cardinal) {
		case 'N':
		case 'S':
			return { min: 0, max: 90 };  // Latitude range (cardinal makes sign explicit)
		case 'E':
		case 'W':
			return { min: 0, max: 180 }; // Longitude range (cardinal makes sign explicit)
	}
}

/**
 * Validate coordinate with cardinal constraints
 */
export function validateCardinalRange(coord: ExactCoordinate): ValidationResult {
	if (!coord.cardinal) {
		return { isValid: true }; // No cardinal to validate
	}
	
	const constraints = getCardinalConstraints(coord.cardinal);
	const absoluteValue = exactToDecimal({ ...coord, isNegative: false });
	
	if (absoluteValue < constraints.min || absoluteValue > constraints.max) {
		const coordType = (coord.cardinal === 'N' || coord.cardinal === 'S') ? 'Latitude' : 'Longitude';
		return {
			isValid: false,
			error: `${coordType} ${absoluteValue}°${coord.cardinal} is out of range. Valid range: 0° to ${constraints.max}°`
		};
	}
	
	return { isValid: true };
}

/**
 * Validate coordinate in inferred range
 */
export function validateInferredRange(coord: ExactCoordinate, inferredType: 'latitude' | 'longitude'): ValidationResult {
	const value = exactToDecimal(coord);
	
	if (inferredType === 'latitude') {
		if (value < -90 || value > 90) {
			return {
				isValid: false,
				error: `${value}° is out of latitude range (-90° to +90°)`
			};
		}
	} else {
		if (value < -180 || value > 180) {
			return {
				isValid: false,
				error: `${value}° is out of longitude range (-180° to +180°)`
			};
		}
	}
	
	return { isValid: true };
}

/**
 * Pair coordinates using intelligent strategies
 */
export function pairCoordinates(
	coords: ExactCoordinate[], 
	analysis: PairingAnalysis,
	userOrder: 'lat-lon' | 'lon-lat'
): CoordinatePairingResult {
	
	switch (analysis.suggestedStrategy) {
		case PairingStrategy.EXPLICIT_CARDINALS:
			return pairByExplicitCardinals(coords);
			
		case PairingStrategy.MIXED_CARDINALS:
			return pairByMixedCardinals(coords, userOrder);
			
		case PairingStrategy.ALTERNATING_TYPES:
			return pairByAlternatingPattern(coords);
			
		case PairingStrategy.USER_ORDER:
		default:
			return pairByUserOrder(coords, userOrder);
	}
}

/**
 * Pair coordinates with explicit cardinals
 */
function pairByExplicitCardinals(coords: ExactCoordinate[]): CoordinatePairingResult {
	const lats = coords.filter(c => c.cardinal === 'N' || c.cardinal === 'S');
	const lons = coords.filter(c => c.cardinal === 'E' || c.cardinal === 'W');
	const ambiguous = coords.filter(c => !c.cardinal);
	
	const pairs: CoordinatePair[] = [];
	const minPairs = Math.min(lats.length, lons.length);
	
	// Pair explicit coordinates
	for (let i = 0; i < minPairs; i++) {
		pairs.push({
			first: lats[i],
			second: lons[i],
			confidence: 0.95,
			strategy: PairingStrategy.EXPLICIT_CARDINALS
		});
	}
	
	// Handle remaining coordinates
	const unpaired = [
		...lats.slice(minPairs),
		...lons.slice(minPairs),
		...ambiguous
	];
	
	return {
		pairs,
		unpaired,
		analysis: {
			totalCoordinates: coords.length,
			explicitLatitudes: lats.length,
			explicitLongitudes: lons.length,
			ambiguousCoordinates: ambiguous.length,
			suggestedStrategy: PairingStrategy.EXPLICIT_CARDINALS,
			confidence: 0.95,
			warnings: unpaired.length > 0 ? [`${unpaired.length} coordinates could not be paired`] : []
		}
	};
}

/**
 * Pair coordinates with mixed cardinals
 */
function pairByMixedCardinals(coords: ExactCoordinate[], userOrder: 'lat-lon' | 'lon-lat'): CoordinatePairingResult {
	const explicit = coords.filter(c => c.cardinal);
	const ambiguous = coords.filter(c => !c.cardinal);
	
	const pairs: CoordinatePair[] = [];
	const unpaired: ExactCoordinate[] = [];
	
	// Try to pair each explicit coordinate with an ambiguous one
	for (const explicitCoord of explicit) {
		if (ambiguous.length === 0) break;
		
		const ambiguousCoord = ambiguous.shift()!;
		const isLatFirst = determineCoordinateType(explicitCoord) === 'latitude';
		
		pairs.push({
			first: isLatFirst ? explicitCoord : ambiguousCoord,
			second: isLatFirst ? ambiguousCoord : explicitCoord,
			confidence: 0.85,
			strategy: PairingStrategy.MIXED_CARDINALS
		});
	}
	
	// Handle remaining ambiguous coordinates with user order
	while (ambiguous.length >= 2) {
		const first = ambiguous.shift()!;
		const second = ambiguous.shift()!;
		
		pairs.push({
			first: userOrder === 'lat-lon' ? first : second,
			second: userOrder === 'lat-lon' ? second : first,
			confidence: 0.5,
			strategy: PairingStrategy.USER_ORDER
		});
	}
	
	unpaired.push(...ambiguous);
	
	return {
		pairs,
		unpaired,
		analysis: analyzeCoordinateStream(coords)
	};
}

/**
 * Pair coordinates by alternating pattern
 */
function pairByAlternatingPattern(coords: ExactCoordinate[]): CoordinatePairingResult {
	const pairs: CoordinatePair[] = [];
	const pairCount = Math.floor(coords.length / 2);
	
	// Detect which positions are lat vs lon
	const evenAreLatitudes = coords.filter((_, i) => i % 2 === 0).every(c => isLikelyLatitude(c));
	
	for (let i = 0; i < pairCount; i++) {
		const first = coords[i * 2];
		const second = coords[i * 2 + 1];
		
		pairs.push({
			first: evenAreLatitudes ? first : second,
			second: evenAreLatitudes ? second : first,
			confidence: 0.75,
			strategy: PairingStrategy.ALTERNATING_TYPES
		});
	}
	
	const unpaired = coords.slice(pairCount * 2);
	
	return {
		pairs,
		unpaired,
		analysis: analyzeCoordinateStream(coords)
	};
}

/**
 * Pair coordinates by user order preference
 */
function pairByUserOrder(coords: ExactCoordinate[], userOrder: 'lat-lon' | 'lon-lat'): CoordinatePairingResult {
	const pairs: CoordinatePair[] = [];
	const pairCount = Math.floor(coords.length / 2);
	
	for (let i = 0; i < pairCount; i++) {
		const first = coords[i * 2];
		const second = coords[i * 2 + 1];
		
		const pair: CoordinatePair = {
			first: userOrder === 'lat-lon' ? first : second,
			second: userOrder === 'lat-lon' ? second : first,
			confidence: 0.5,
			strategy: PairingStrategy.USER_ORDER
		};
		
		// Increase confidence if range validation supports the assignment
		if (validatePairRanges(pair)) {
			pair.confidence = 0.7;
		}
		
		pairs.push(pair);
	}
	
	const unpaired = coords.slice(pairCount * 2);
	
	return {
		pairs,
		unpaired,
		analysis: analyzeCoordinateStream(coords)
	};
}

/**
 * Validate that a coordinate pair has valid ranges
 */
function validatePairRanges(pair: CoordinatePair): boolean {
	const latValue = exactToDecimal(pair.first);
	const lonValue = exactToDecimal(pair.second);
	
	return (latValue >= -90 && latValue <= 90) && (lonValue >= -180 && lonValue <= 180);
}