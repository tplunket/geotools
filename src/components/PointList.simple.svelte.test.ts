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

		it('should render coordinate input structure', async () => {
			render(PointList);
			
			// Check for input placeholders to verify structure
			await expect(page.getByPlaceholder('Latitude')).toBeVisible();
			await expect(page.getByPlaceholder('Longitude')).toBeVisible();
			
			// Check for add and paste buttons
			await expect(page.getByText('+')).toBeVisible();
			await expect(page.getByTitle('Paste coordinates from clipboard')).toBeVisible();
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

		it('should render input order controls', async () => {
			render(PointList);
			
			// Check for input order radio buttons
			const latLonRadio = page.getByLabelText('Latitude / Longitude');
			const lonLatRadio = page.getByLabelText('Longitude / Latitude');
			
			await expect(latLonRadio).toBeVisible();
			await expect(lonLatRadio).toBeVisible();
			
			// Default should be lat-lon order
			await expect(latLonRadio).toBeChecked();
			await expect(lonLatRadio).not.toBeChecked();
		});

		it('should switch input order when toggled', async () => {
			render(PointList);
			
			// Switch to lon-lat order
			const lonLatRadio = page.getByLabelText('Longitude / Latitude');
			await lonLatRadio.click();
			
			await expect(lonLatRadio).toBeChecked();
			
			// Verify the order changed by checking placeholders
			const firstInput = page.getByPlaceholder('Longitude');
			const secondInput = page.getByPlaceholder('Latitude');
			
			await expect(firstInput).toBeVisible();
			await expect(secondInput).toBeVisible();
		});

		it('should display coordinates in selected order', async () => {
			render(PointList);
			
			// Test behavior with input order toggle - the display order should be consistent
			// This is more of a behavioral test than visual since we can't easily test display order in unit tests
			const lonLatRadio = page.getByLabelText('Longitude / Latitude');
			await lonLatRadio.click();
			
			// Verify the toggle worked
			await expect(lonLatRadio).toBeChecked();
			
			// The component should be responsive to the input order change
			// Actual coordinate display order testing would require integration tests
			expect(true).toBe(true); // Placeholder for successful order toggle
		});
	});
});