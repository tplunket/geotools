export function isValidCoordinate(value: string, isLatitude: boolean): boolean {
	if (value === '' || isNaN(parseFloat(value))) return false;

	const num = parseFloat(value);
	if (isLatitude) {
		return num >= -90 && num <= 90;
	} else {
		return num >= -180 && num <= 180;
	}
}

export function formatCoordinate(
	valueString: string,
	isLatitude: boolean,
	displayFormat: 'decimal' | 'dms',
	showCardinal: boolean
): string {
	const value = parseFloat(valueString);
	if (displayFormat === 'decimal') {
		let formatted = value.toFixed(6);
		formatted = formatted.replace(/(\.)?(0+)$/, '');
		if (!showCardinal) return formatted;

		// Add cardinal directions if requested
		let tail: string[];
		if (isLatitude) {
			tail = ['N', 'S'];
		} else {
			tail = ['E', 'W'];
		}
		if (formatted[0] === '-') {
			return `${formatted.slice(1)}${tail[1]}`;
		}
		return `${formatted}${tail[0]}`;
	} else {
		// Convert to DMS
		const sign = value < 0 ? '-' : '';
		const absolute = Math.abs(value);
		let degrees = Math.floor(absolute);
		const minutesFloat = (absolute - degrees) * 60;
		let minutes = Math.floor(minutesFloat);
		const secondsFloat = (minutesFloat - minutes) * 60;
		let seconds = Math.floor(secondsFloat);
		let subSeconds = Math.round((secondsFloat - seconds) * 100);
		if (subSeconds >= 100) {
			seconds += 1;
			subSeconds -= 100;
		}
		if (seconds >= 60) {
			minutes += 1;
			seconds -= 60;
		}
		if (minutes >= 60) {
			degrees += 1;
			minutes -= 60;
		}
		const subSecondsString = `.${subSeconds}`.replace(/[.0]+$/, '');

		const twoDigits = (n: number) => n.toString().padStart(2, '0');
		let dms = `${degrees}°${twoDigits(minutes)}'${twoDigits(seconds)}${subSecondsString}"`;
		dms = dms.replace(/(00['"])+$/, '');
		if (!showCardinal) return `${sign}${dms}`;

		// Add cardinal directions if requested
		if (isLatitude) {
			return `${dms}${value >= 0 ? 'N' : 'S'}`;
		} else {
			return `${dms}${value >= 0 ? 'E' : 'W'}`;
		}
	}
}
