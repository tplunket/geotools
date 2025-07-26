/// <reference types="@vitest/browser/matchers" />
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import PointList from './PointList.svelte';
import { globals } from '$lib/global-data.svelte';

describe('PointList Component - Basic Tests', () => {
	beforeEach(() => {
		// Clear global state before each test
		globals.points.length = 0;
	});

	describe('Component Rendering', () => {
		it('should render without errors', async () => {
			render(PointList);
			
			// Just verify the component renders
			expect(true).toBe(true);
		});

		it('should render coordinate input section', async () => {
			render(PointList);
			
			// Check that "Added Points" text is visible
			const addedPointsText = page.getByText('Added Points');
			await expect(addedPointsText).toBeVisible();
		});

		it('should render format controls', async () => {
			render(PointList);
			
			// Check for radio button labels
			const decimalLabel = page.getByText('Decimal Degrees');
			const dmsLabel = page.getByText('DMS');
			
			await expect(decimalLabel).toBeVisible();
			await expect(dmsLabel).toBeVisible();
		});

		it('should render cardinal directions checkbox', async () => {
			render(PointList);
			
			const cardinalLabel = page.getByText('Show Cardinal Directions');
			await expect(cardinalLabel).toBeVisible();
		});
	});

	describe('Interactive Controls', () => {
		it('should start with decimal format selected', async () => {
			render(PointList);
			
			const decimalRadio = page.getByLabelText('Decimal Degrees');
			await expect(decimalRadio).toBeChecked();
		});

		it('should switch to DMS format when clicked', async () => {
			render(PointList);
			
			const dmsRadio = page.getByLabelText('DMS');
			await dmsRadio.click();
			
			await expect(dmsRadio).toBeChecked();
		});

		it('should toggle cardinal directions checkbox', async () => {
			render(PointList);
			
			const cardinalCheckbox = page.getByLabelText('Show Cardinal Directions');
			
			// Initially unchecked
			await expect(cardinalCheckbox).not.toBeChecked();
			
			// Click to enable
			await cardinalCheckbox.click();
			await expect(cardinalCheckbox).toBeChecked();
		});

		it('should programmatically add coordinates to global state', async () => {
			// Test global state integration (bypassing UI for now)
			expect(globals.points).toHaveLength(0);
			
			globals.points.push({ latitude: 40.7589, longitude: -73.9851 });
			expect(globals.points).toHaveLength(1);
			expect(globals.points[0]).toEqual({
				latitude: 40.7589,
				longitude: -73.9851
			});
		});
	});
});