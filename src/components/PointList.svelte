<script lang="ts">
	import { formatCoordinate, isValidCoordinate } from '$lib/coordinates';
	import ErrorMessage from '$components/ErrorMessage.svelte';
	import type { LatLon, Point, CoordinateFormat } from '$lib/types';
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
	let showCardinal = $state(false);
	let inputOrder = $state<'lat-lon' | 'lon-lat'>('lat-lon');
	let currentError: { message: string; target: HTMLElement } | null =
		$state(null);
	
	// Computed values for the display order
	let firstValue = $derived(inputOrder === 'lat-lon' ? my_state.latitude : my_state.longitude);
	let secondValue = $derived(inputOrder === 'lat-lon' ? my_state.longitude : my_state.latitude);
	
	function setFirstValue(value: string) {
		if (inputOrder === 'lat-lon') {
			my_state.latitude = value;
		} else {
			my_state.longitude = value;
		}
	}
	
	function setSecondValue(value: string) {
		if (inputOrder === 'lat-lon') {
			my_state.longitude = value;
		} else {
			my_state.latitude = value;
		}
	}

	function removePoint(index: number) {
		my_state.points.splice(index, 1);
		globals.points.splice(index, 1);
	}

	function addPoint() {
		const { latitude, longitude } = my_state;
		
		if (
			!isValidCoordinate(latitude, true) ||
			!isValidCoordinate(longitude, false)
		) {
			alert(
				'Please enter valid coordinates:\nLatitude: -90 to +90\nLongitude: -180 to +180'
			);
			return;
		}
		my_state.points.push({
			latitude: latitude,
			longitude: longitude
		});
		globals.points.push({
			latitude: parseFloat(latitude),
			longitude: parseFloat(longitude)
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

	function copyToClipboard(point: LatLon) {
		let text: string;
		if (inputOrder === 'lat-lon') {
			text = `${formatCoordinate(point.latitude, true, displayFormat, showCardinal)}, ${formatCoordinate(point.longitude, false, displayFormat, showCardinal)}`;
		} else {
			text = `${formatCoordinate(point.longitude, false, displayFormat, showCardinal)}, ${formatCoordinate(point.latitude, true, displayFormat, showCardinal)}`;
		}
		navigator.clipboard.writeText(text).catch((err) => {
			console.error('Failed to copy text: ', err);
		});
	}

	async function pasteFromClipboard() {
		try {
			const text = await navigator.clipboard.readText();
			const coords = text.trim().split(/[,\s]+/);
			
			if (coords.length >= 2) {
				// Parse the first two coordinate values
				const first = coords[0].trim();
				const second = coords[1].trim();
				
				// Apply based on input order - first input gets first value, second input gets second value
				if (inputOrder === 'lat-lon') {
					my_state.latitude = first;
					my_state.longitude = second;
				} else {
					my_state.longitude = first;  // First input is longitude in lon/lat mode
					my_state.latitude = second;  // Second input is latitude in lon/lat mode
				}
			}
		} catch (err) {
			console.error('Failed to paste from clipboard: ', err);
		}
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
					<div class="coord-display">
						{inputOrder === 'lat-lon' ? 
							formatCoordinate(point.latitude, true, displayFormat, showCardinal) : 
							formatCoordinate(point.longitude, false, displayFormat, showCardinal)}
					</div>
					<div class="coord-display">
						{inputOrder === 'lat-lon' ? 
							formatCoordinate(point.longitude, false, displayFormat, showCardinal) : 
							formatCoordinate(point.latitude, true, displayFormat, showCardinal)}
					</div>
					<button onclick={() => removePoint(i)} class="remove-button">-</button>
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
		<input
			type="text"
			placeholder={inputOrder === 'lat-lon' ? 'Latitude' : 'Longitude'}
			value={firstValue}
			class="coord-input"
			onkeydown={(e) => handleKeydown(e, inputOrder === 'lat-lon' ? 'latitude' : 'longitude')}
			oninput={(e) => setFirstValue(e.target.value)}
		/>
		<input
			type="text"
			placeholder={inputOrder === 'lat-lon' ? 'Longitude' : 'Latitude'}
			value={secondValue}
			class="coord-input"
			onkeydown={(e) => handleKeydown(e, inputOrder === 'lat-lon' ? 'longitude' : 'latitude')}
			oninput={(e) => setSecondValue(e.target.value)}
		/>
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
	</div>
	{#if currentError}
		<ErrorMessage
			message={currentError.message}
			targetElement={currentError.target}
			parentElement={document.querySelector('#coordinate-controls')}
		/>
	{/if}
</div>

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
</style>
