<script lang="ts">
	import type { Point } from '$lib/types';
	import Map from '../components/Map.svelte';

	type State = {
		latitude: string;
		longitude: string;
		points: Point[];
	};
	let my_state = $state<State>({
		latitude: '',
		longitude: '',
		points: []
	});

	let displayFormat = $state('decimal'); // 'decimal' or 'dms'
	let showCardinal = $state(false);

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
			latitude: parseFloat(latitude),
			longitude: parseFloat(longitude)
		});
		my_state.latitude = '';
		my_state.longitude = '';

		// Focus the latitude input after adding a point
		const latitudeInput = document.querySelector(
			'input[placeholder="Latitude"]'
		) as HTMLInputElement;
		latitudeInput?.focus();
	}

	function isValidCoordinate(value: string, isLatitude: boolean): boolean {
		if (value === '' || isNaN(parseFloat(value))) return false;

		const num = parseFloat(value);
		if (isLatitude) {
			return num >= -90 && num <= 90;
		} else {
			return num >= -180 && num <= 180;
		}
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
			const errorDiv = document.createElement('div');
			errorDiv.textContent = message;
			errorDiv.className = 'error-message';

			// Get the triggering input element and its position
			const input = field === 'latitude' ? latitudeInput : longitudeInput;
			if (input) {
				const inputRect = input.getBoundingClientRect();
				const controlsRect = input.parentElement?.getBoundingClientRect();

				if (controlsRect) {
					errorDiv.style.left = `${inputRect.left - controlsRect.left + 16}px`;
					errorDiv.style.top = `${inputRect.height + 16 + 4}px`; // 4px gap
				}

				input.style.transition = 'border-color 0.5s';
				input.style.borderColor = '#e24a4a';
				setTimeout(() => {
					input.style.borderColor = '';
				}, 1000);
			}

			const controls = document.querySelector('.controls');
			if (controls) {
				(controls as HTMLElement).style.position = 'relative';
				controls.appendChild(errorDiv);
			}

			setTimeout(() => errorDiv.remove(), 2000);
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

	function formatCoordinate(value: number, isLatitude: boolean): string {
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
			const absolute = Math.abs(value);
			const degrees = Math.floor(absolute);
			const minutesFloat = (absolute - degrees) * 60;
			const minutes = Math.floor(minutesFloat);
			const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

			const dms = `${degrees}°${minutes}'${seconds}"`;
			if (!showCardinal) return dms;

			// Add cardinal directions if requested
			if (isLatitude) {
				return `${dms}${value >= 0 ? 'N' : 'S'}`;
			} else {
				return `${dms}${value >= 0 ? 'E' : 'W'}`;
			}
		}
	}

	async function copyToClipboard(point: Point) {
		const text = `${formatCoordinate(point.latitude, true)}, ${formatCoordinate(point.longitude, false)}`;
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	}
</script>

<div class="container">
	<div class="sidebar">
		<div class="points-list">
			<h3>Added Points</h3>
			{#each my_state.points as point, i}
				<div class="input-group">
					<button
						onclick={() => copyToClipboard(point)}
						class="copy-button"
						title="Copy to clipboard"
					>
						📋
					</button>
					<input
						type="text"
						value={`${formatCoordinate(point.latitude, true)}, ${formatCoordinate(point.longitude, false)}`}
						class="coord-input"
						readonly
					/>
					<button
						onclick={() => {
							const newPoints = my_state.points.filter(
								(_, index) => index !== i
							);
							my_state.points = newPoints;
						}}
						class="remove-button">-</button
					>
				</div>
			{/each}
		</div>
		<div class="controls">
			<div class="input-group">
				<input
					type="text"
					placeholder="Latitude"
					bind:value={my_state.latitude}
					class="coord-input"
					onkeydown={(e) => handleKeydown(e, 'latitude')}
				/>
				<input
					type="text"
					placeholder="Longitude"
					bind:value={my_state.longitude}
					class="coord-input"
					onkeydown={(e) => handleKeydown(e, 'longitude')}
				/>
				<button onclick={addPoint} class="add-button">+</button>
			</div>
			<div class="display-controls">
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
		</div>
	</div>
	<div class="map-container">
		<Map points={my_state.points} />
	</div>
</div>

<style>
	.container {
		display: flex;
		width: 100%;
		height: 100vh;
		gap: 20px;
		padding: 20px;
		box-sizing: border-box;
	}

	.sidebar {
		flex: 0 0 350px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		overflow-y: auto;
		padding-right: 8px;
	}

	.points-list {
		flex-grow: 1;
		background-color: #f5f5f5;
		border-radius: 4px;
		padding: 16px;
	}

	.map-container {
		flex: 1 1 auto;
		position: relative;
		min-width: 0;
		overflow: hidden;
	}

	.controls {
		flex-shrink: 0;
		padding: 16px;
		background-color: #f5f5f5;
		border-radius: 4px;
		width: 100%;
		box-sizing: border-box;
	}

	.input-group {
		display: flex;
		gap: 8px;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
	}

	.input-group:last-child {
		margin-bottom: 0;
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

	.remove-button {
		background-color: #e24a4a;
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

	.remove-button:hover {
		background-color: #bd3535;
	}

	.display-controls {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid #ddd;
	}

	.format-control {
		margin-bottom: 12px;
		display: flex;
		gap: 16px;
	}

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

	:global(.error-message) {
		position: absolute;
		background: #e24a4a;
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 14px;
		z-index: 1000;
		white-space: nowrap;
		pointer-events: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
</style>
