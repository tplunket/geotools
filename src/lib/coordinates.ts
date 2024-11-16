export function formatCoordinate(
	value: number,
	isLatitude: boolean,
	displayFormat: 'decimal' | 'dms',
	showCardinal: boolean
): string {
	if (displayFormat === 'decimal') {
		const formatted = value.toFixed(6);
		if (!showCardinal) return formatted;

		// Add cardinal directions if requested
		if (isLatitude) {
			return `${Math.abs(value).toFixed(6)}${value >= 0 ? 'N' : 'S'}`;
		} else {
			return `${Math.abs(value).toFixed(6)}${value >= 0 ? 'E' : 'W'}`;
		}
	} else {
		// Convert to DMS
		const sign = value < 0 ? '-' : '';
		const absolute = Math.abs(value);
		const degrees = Math.floor(absolute);
		const minutesFloat = (absolute - degrees) * 60;
		const minutes = Math.floor(minutesFloat);
		const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

		const dms = `${degrees}°${minutes}'${seconds}"`;
		if (!showCardinal) return `${sign}${dms}`;

		// Add cardinal directions if requested
		if (isLatitude) {
			return `${dms}${value >= 0 ? 'N' : 'S'}`;
		} else {
			return `${dms}${value >= 0 ? 'E' : 'W'}`;
		}
	}
}
