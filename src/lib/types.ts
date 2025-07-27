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
