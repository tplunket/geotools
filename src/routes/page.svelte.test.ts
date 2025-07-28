import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render without errors', async () => {
		render(Page);
		
		// Just verify the component renders successfully
		expect(true).toBe(true);
	});

	it('should render expected UI elements', async () => {
		render(Page);

		// Check for format controls from PointList
		const decimalLabel = page.getByText('Decimal Degrees');
		const dmsLabel = page.getByText('DMS');
		const cardinalLabel = page.getByText('Show Cardinal Directions');
		
		await expect(decimalLabel).toBeVisible();
		await expect(dmsLabel).toBeVisible();
		await expect(cardinalLabel).toBeVisible();
	});
});
