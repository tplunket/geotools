export type Point = {
	latitude: number;
	longitude: number;
};

export type LatLon = {
	latitude: string;
	longitude: string;
};

export type CoordinateFormat = 'decimal' | 'dms';

export interface CoordinateValidationResult {
	isValid: boolean;
	clampedValue?: number;
	warning?: string;
}

// Enhanced coordinate system types
export interface ExactCoordinate {
	degrees: number;           // Whole degrees: 45
	numerator: number;         // Fractional part numerator: 1234
	denominator: number;       // Base: 10, 60, 3600, 10000, 360000, etc.
	isNegative: boolean;       // Sign separate from degrees
	cardinal?: 'N' | 'S' | 'E' | 'W';  // Optional cardinal direction
	isLatitude?: boolean;      // true if N/S, false if E/W, undefined if no cardinal
	isExplicit: boolean;       // true if cardinal direction specified
}

export enum PairingStrategy {
	EXPLICIT_CARDINALS = 'explicit',     // Both have N/S/E/W
	MIXED_CARDINALS = 'mixed',           // One has cardinal, one doesn't
	ALTERNATING_TYPES = 'alternating',   // lat, lon, lat, lon pattern
	RANGE_INFERENCE = 'range',           // Infer from value ranges
	USER_ORDER = 'user_order',           // Fall back to UI preference
	AMBIGUOUS = 'ambiguous'              // Cannot determine confidently
}

export interface PairingAnalysis {
	totalCoordinates: number;
	explicitLatitudes: number;    // Count of N/S coordinates
	explicitLongitudes: number;   // Count of E/W coordinates
	ambiguousCoordinates: number; // Count without cardinals
	suggestedStrategy: PairingStrategy;
	confidence: number;           // 0-1 confidence score
	warnings: string[];
}

export interface CoordinatePair {
	first: ExactCoordinate;
	second: ExactCoordinate;
	confidence: number;        // 0-1 confidence in pairing
	strategy: PairingStrategy;
}

export interface CoordinatePairingResult {
	pairs: CoordinatePair[];
	unpaired: ExactCoordinate[];
	analysis: PairingAnalysis;
}

export interface EditableCoordinatePair {
	id: string;                    // Unique identifier
	latitude: ExactCoordinate;
	longitude: ExactCoordinate;
	latitudeText: string;         // Editable text representation
	longitudeText: string;        // Editable text representation
	isValid: boolean;             // Real-time validation
	errors: string[];             // Validation errors
	confidence: number;           // Pairing confidence
}

export interface ValidationResult {
	isValid: boolean;
	error?: string;
}
