import { describe, it, expect } from 'vitest';

describe.each([
	[1, 2, 3],
	[4, 5, 9],
	[6, 7, 13]
])('sum test', (a, b, expected) => {
	it(`adds ${a} + ${b} to equal ${expected}`, () => {
		expect(a + b).toBe(expected);
	});
});
