<script lang="ts">
	import {
		formatCoordinate,
		isValidCoordinate,
		validateLatitude
	} from '$lib/coordinates';
	import {
		parseCoordinateStream,
		analyzeCoordinateStream,
		pairCoordinates,
		exactToDecimal
	} from '$lib/enhanced-coordinates';
	import ErrorMessage from '$components/ErrorMessage.svelte';
	import CoordinatePreviewModal from '$components/CoordinatePreviewModal.svelte';
	import type { LatLon, Point, CoordinateFormat, EditableCoordinatePair } from '$lib/types';
	import { globals } from '$lib/global-data.svelte';

	type State = {
		latitude: string;
		longitude: string;
		points: LatLon[];
	};
	let my_state = $state<State>({
		latitude: '',
		longitude: '',
		points: []
	});

	let displayFormat = $state<CoordinateFormat>('decimal');

	// Sync display format with global state for map tooltips
	$effect(() => {
		globals.displayFormat = displayFormat;
	});
	let showCardinal = $state(false);
	let inputOrder = $state<'lat-lon' | 'lon-lat'>('lat-lon');
	let currentError: { message: string; target: HTMLElement } | null =
		$state(null);

	// Enhanced coordinate system state
	let showPreviewModal = $state(false);
	let modalPairs: EditableCoordinatePair[] = $state([]);
	let modalUnpaired: any[] = $state([]);
	let modalAnalysis: any = $state(null);
	let modalOriginalText = $state('');

	function removePoint(index: number) {
		my_state.points.splice(index, 1);
		globals.points.splice(index, 1);
	}

	function addPoint() {
		const { latitude, longitude } = my_state;

		// Basic validation for both coordinates
		if (
			!isValidCoordinate(latitude, true) ||
			!isValidCoordinate(longitude, false)
		) {
			alert(
				'Please enter valid coordinates:\nLatitude: -90 to +90\nLongitude: -180 to +180'
			);
			return;
		}

		// Special validation for latitude polar regions
		const latValidation = validateLatitude(latitude);
		if (!latValidation.isValid) {
			alert('Invalid latitude value');
			return;
		}

		let finalLatitude = parseFloat(latitude);

		// Handle polar clamping and warning
		if (latValidation.clampedValue !== undefined) {
			const proceed = confirm(
				`${latValidation.warning}\n\nProceed with clamped value?`
			);
			if (!proceed) {
				return;
			}
			finalLatitude = latValidation.clampedValue;
		}

		const finalLongitude = parseFloat(longitude);

		my_state.points.push({
			latitude: finalLatitude.toString(),
			longitude: longitude
		});
		globals.points.push({
			latitude: finalLatitude,
			longitude: finalLongitude
		});
		my_state.latitude = '';
		my_state.longitude = '';

		// Focus the first input after adding a point
		const firstInput = document.querySelector(
			'.input-section input[type="text"]'
		) as HTMLInputElement;
		firstInput?.focus();
	}

	function handleKeydown(
		event: KeyboardEvent,
		field: 'latitude' | 'longitude'
	) {
		if (event.key !== 'Enter') return;

		const latitudeInput = document.querySelector(
			'input[placeholder="Latitude"]'
		) as HTMLInputElement;
		const longitudeInput = document.querySelector(
			'input[placeholder="Longitude"]'
		) as HTMLInputElement;

		const showError = (message: string) => {
			const input = field === 'latitude' ? latitudeInput : longitudeInput;
			if (input) {
				// Set error state
				currentError = { message, target: input };

				// Flash invalid input border
				input.style.transition = 'border-color 1.0s';
				input.style.borderColor = '#e24a4a';
				setTimeout(() => {
					input.style.borderColor = '';
				}, 2000);

				// Clear error after delay
				setTimeout(() => {
					currentError = null;
				}, 2000);
			}
		};

		if (field === 'latitude') {
			if (isValidCoordinate(my_state.latitude, true)) {
				if (isValidCoordinate(my_state.longitude, false)) {
					addPoint();
				} else {
					longitudeInput?.focus();
				}
			} else {
				showError('Invalid latitude');
			}
		} else {
			if (isValidCoordinate(my_state.longitude, false)) {
				if (isValidCoordinate(my_state.latitude, true)) {
					addPoint();
				} else {
					latitudeInput?.focus();
				}
			} else {
				showError('Invalid longitude');
			}
		}
	}

	function getPointFormatter(): (point: LatLon) => string {
		if (inputOrder === 'lat-lon') {
			return (point: LatLon) =>
				`${formatCoordinate(point.latitude, true, displayFormat, showCardinal)}, ${formatCoordinate(point.longitude, false, displayFormat, showCardinal)}`;
		} else {
			return (point: LatLon) =>
				`${formatCoordinate(point.longitude, false, displayFormat, showCardinal)}, ${formatCoordinate(point.latitude, true, displayFormat, showCardinal)}`;
		}
	}

	function copyToClipboard(point: LatLon) {
		const formatter = getPointFormatter();
		const text = formatter(point);
		navigator.clipboard.writeText(text).catch((err) => {
			console.error('Failed to copy text: ', err);
		});
	}

	async function pasteFromClipboard() {
		try {
			const text = await navigator.clipboard.readText();
			
			// Try enhanced coordinate parsing for multiple coordinates
			const coords = parseCoordinateStream(text);
			
			if (coords.length >= 2) {
				// Multiple coordinates detected - use enhanced system
				handleEnhancedPaste(text);
				return;
			}
			
			// Fallback to simple parsing for single coordinate pair
			const simpleCoords = text.trim().split(/[,\s]+/);
			if (simpleCoords.length >= 2) {
				// Parse the first two coordinate values
				const first = simpleCoords[0].trim();
				const second = simpleCoords[1].trim();

				// Apply based on input order - first input gets first value, second input gets second value
				if (inputOrder === 'lat-lon') {
					my_state.latitude = first;
					my_state.longitude = second;
				} else {
					my_state.longitude = first; // First input is longitude in lon/lat mode
					my_state.latitude = second; // Second input is latitude in lon/lat mode
				}
			}
		} catch (err) {
			console.error('Failed to paste from clipboard: ', err);
		}
	}

	function copyAllToClipboard() {
		if (my_state.points.length === 0) {
			alert('No coordinates to copy');
			return;
		}

		const lines = my_state.points.map(getPointFormatter());
		const text = lines.join('\n');
		navigator.clipboard
			.writeText(text)
			.then(() => {
				// Optional: Show success feedback
			})
			.catch((err) => {
				console.error('Failed to copy all coordinates: ', err);
				alert('Failed to copy coordinates to clipboard');
			});
	}

	function handleEnhancedPaste(text: string) {
		const coords = parseCoordinateStream(text);
		const analysis = analyzeCoordinateStream(coords);
		const pairingResult = pairCoordinates(coords, analysis, inputOrder);
		
		// Convert to editable format
		modalPairs = pairingResult.pairs.map((pair, index) => ({
			id: `pair-${index}`,
			latitude: pair.first,
			longitude: pair.second,
			latitudeText: exactToDecimal(pair.first).toString(),
			longitudeText: exactToDecimal(pair.second).toString(),
			isValid: true,
			errors: [],
			confidence: pair.confidence
		}));
		
		modalUnpaired = pairingResult.unpaired;
		modalAnalysis = analysis;
		modalOriginalText = text;
		showPreviewModal = true;
	}

	function handleModalAccept(event: CustomEvent<{ pairs: EditableCoordinatePair[] }>) {
		const validPairs = event.detail.pairs;
		
		for (const pair of validPairs) {
			const latitude = exactToDecimal(pair.latitude);
			const longitude = exactToDecimal(pair.longitude);
			
			// Add to local state
			my_state.points.push({
				latitude: latitude.toString(),
				longitude: longitude.toString()
			});
			
			// Add to global state
			globals.points.push({
				latitude,
				longitude
			});
		}
		
		showPreviewModal = false;
	}

	function handleModalReject() {
		showPreviewModal = false;
	}

	function handleModalRetry(event: CustomEvent<{ text: string }>) {
		showPreviewModal = false;
		setTimeout(() => {
			handleEnhancedPaste(event.detail.text);
		}, 100);
	}
</script>

<div class="coordinate-table">
	<!-- Point rows -->
	{#if my_state.points.length > 0}
		<div class="points-section">
			{#each my_state.points as point, i}
				<div class="point-row">
					<button
						onclick={() => copyToClipboard(point)}
						class="copy-button"
						title="Copy to clipboard"
					>
						📋
					</button>
					{#if inputOrder === 'lat-lon'}
						<div class="coord-display">
							{formatCoordinate(
								point.latitude,
								true,
								displayFormat,
								showCardinal
							)}
						</div>
					{/if}
					<div class="coord-display">
						{formatCoordinate(
							point.longitude,
							false,
							displayFormat,
							showCardinal
						)}
					</div>
					{#if inputOrder !== 'lat-lon'}
						<div class="coord-display">
							{formatCoordinate(
								point.latitude,
								true,
								displayFormat,
								showCardinal
							)}
						</div>
					{/if}
					<button onclick={() => removePoint(i)} class="remove-button">-</button
					>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Input row (always last) -->
	<div class="input-section">
		<button
			onclick={pasteFromClipboard}
			class="paste-button"
			title="Paste coordinates from clipboard"
		>
			📋
		</button>
		{#if inputOrder === 'lat-lon'}
			<input
				type="text"
				placeholder="Latitude"
				value={my_state.latitude}
				class="coord-input"
				onkeydown={(e) => handleKeydown(e, 'latitude')}
				oninput={(e) => (my_state.latitude = (e.target as HTMLInputElement).value)}
			/>
		{/if}
		<input
			type="text"
			placeholder="Longitude"
			value={my_state.longitude}
			class="coord-input"
			onkeydown={(e) => handleKeydown(e, 'longitude')}
			oninput={(e) => (my_state.longitude = (e.target as HTMLInputElement).value)}
		/>
		{#if inputOrder !== 'lat-lon'}
			<input
				type="text"
				placeholder="Latitude"
				value={my_state.latitude}
				class="coord-input"
				onkeydown={(e) => handleKeydown(e, 'latitude')}
				oninput={(e) => (my_state.latitude = (e.target as HTMLInputElement).value)}
			/>
		{/if}
		<button onclick={addPoint} class="add-button">+</button>
	</div>
</div>

<div class="controls" id="coordinate-controls">
	<div class="display-controls">
		<div class="input-order-control">
			<label>
				<input
					type="radio"
					name="inputOrder"
					value="lat-lon"
					checked={inputOrder === 'lat-lon'}
					onclick={() => (inputOrder = 'lat-lon')}
				/>
				Latitude / Longitude
			</label>
			<label>
				<input
					type="radio"
					name="inputOrder"
					value="lon-lat"
					checked={inputOrder === 'lon-lat'}
					onclick={() => (inputOrder = 'lon-lat')}
				/>
				Longitude / Latitude
			</label>
		</div>

		<div class="format-control">
			<label>
				<input
					type="radio"
					name="format"
					value="decimal"
					checked={displayFormat === 'decimal'}
					onclick={() => (displayFormat = 'decimal')}
				/>
				Decimal Degrees
			</label>
			<label>
				<input
					type="radio"
					name="format"
					value="dms"
					checked={displayFormat === 'dms'}
					onclick={() => (displayFormat = 'dms')}
				/>
				DMS
			</label>
		</div>

		<div class="cardinal-control">
			<label>
				<input
					type="checkbox"
					checked={showCardinal}
					onclick={() => (showCardinal = !showCardinal)}
				/>
				Show Cardinal Directions
			</label>
		</div>

		<div class="copy-all-control">
			<button
				onclick={copyAllToClipboard}
				class="copy-all-button"
				disabled={my_state.points.length === 0}
				title="Copy all coordinates to clipboard"
			>
				📋 Copy All
			</button>
		</div>
	</div>
	{#if currentError}
		<ErrorMessage
			message={currentError.message}
			targetElement={currentError.target}
			parentElement={document.querySelector('#coordinate-controls')}
		/>
	{/if}
</div>

<!-- Enhanced Coordinate Preview Modal -->
<CoordinatePreviewModal
	bind:isOpen={showPreviewModal}
	bind:pairs={modalPairs}
	bind:unpaired={modalUnpaired}
	bind:analysis={modalAnalysis}
	bind:originalText={modalOriginalText}
	bind:userOrder={inputOrder}
	on:accept={handleModalAccept}
	on:reject={handleModalReject}
	on:retry={handleModalRetry}
/>

<style>
	.coordinate-table {
		flex-grow: 1;
		background-color: #f5f5f5;
		border-radius: 4px;
		padding: 12px 16px;
	}

	.input-section {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-top: 8px;
		padding: 8px;
		background-color: white;
		border-radius: 4px;
		border: 1px solid #e5e7eb;
	}

	.points-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 8px;
	}

	.point-row {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 8px;
		background-color: white;
		border-radius: 4px;
		border: 1px solid #e5e7eb;
	}

	.coord-display {
		flex: 1;
		padding: 8px;
		background-color: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		font-family: monospace;
		font-size: 14px;
		color: #374151;
	}

	.controls {
		position: relative;
		flex-shrink: 0;
		padding: 16px;
		background-color: #f5f5f5;
		border-radius: 4px;
		width: 100%;
		box-sizing: border-box;
		margin-top: 12px;
	}

	.coord-input {
		flex: 1;
		min-width: 60px;
		height: 32px;
		padding: 0 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		font-family: monospace;
	}

	.coord-input:focus {
		outline: none;
		border-color: #4a90e2;
		box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
	}

	.add-button {
		background-color: #4a90e2;
		color: white;
		border: none;
		border-radius: 4px;
		width: 32px;
		height: 32px;
		font-size: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.add-button:hover {
		background-color: #357abd;
	}

	.copy-button,
	.paste-button,
	.remove-button {
		background-color: #e5e7eb;
		color: #6b7280;
		border: none;
		border-radius: 4px;
		width: 32px;
		height: 32px;
		font-size: 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition: all 0.2s ease;
	}

	.copy-button:hover,
	.paste-button:hover {
		background-color: #4a90e2;
		color: white;
	}

	.remove-button {
		background-color: #e24a4a;
		color: white;
	}

	.remove-button:hover {
		background-color: #bd3535;
	}

	.display-controls {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid #ddd;
	}

	.input-order-control {
		margin-bottom: 12px;
		display: flex;
		gap: 16px;
	}

	.format-control {
		margin-bottom: 12px;
		display: flex;
		gap: 16px;
	}

	.input-order-control label,
	.format-control label,
	.cardinal-control label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	input[type='radio'],
	input[type='checkbox'] {
		cursor: pointer;
	}

	.copy-button {
		background-color: #e5e7eb;
		color: #6b7280;
		border: none;
		border-radius: 4px;
		width: 32px;
		height: 32px;
		font-size: 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition: all 0.2s ease;
	}

	.copy-button:hover {
		background-color: #4a90e2;
		color: white;
	}

	.copy-all-control {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid #ddd;
	}

	.copy-all-button {
		background-color: #4a90e2;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 8px;
		transition: all 0.2s ease;
		width: 100%;
		justify-content: center;
	}

	.copy-all-button:hover:not(:disabled) {
		background-color: #357abd;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.copy-all-button:disabled {
		background-color: #e5e7eb;
		color: #9ca3af;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
</style>
