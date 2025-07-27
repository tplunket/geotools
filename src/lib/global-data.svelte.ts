import type { Point, CoordinateFormat } from './types';

export const globals: {
	points: Point[];
	displayFormat: CoordinateFormat;
} = $state({
	points: [],
	displayFormat: 'decimal'
});
