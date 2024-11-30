import type { Point } from './types';

export const globals: {
	points: Point[];
} = $state({
	points: []
});
