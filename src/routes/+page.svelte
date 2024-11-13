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
			!latitude ||
			!longitude ||
			isNaN(parseFloat(latitude)) ||
			isNaN(parseFloat(longitude))
		) {
			alert('Please enter valid latitude and longitude values');
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

	function isValidCoordinate(value: string): boolean {
		return value !== '' && !isNaN(parseFloat(value));
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

		if (field === 'latitude') {
			if (isValidCoordinate(my_state.latitude)) {
				if (isValidCoordinate(my_state.longitude)) {
					addPoint();
				} else {
					longitudeInput?.focus();
				}
			}
		} else {
			if (isValidCoordinate(my_state.longitude)) {
				if (isValidCoordinate(my_state.latitude)) {
					addPoint();
				} else {
					latitudeInput?.focus();
				}
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

			const dms = `${degrees}° ${minutes}' ${seconds}"`;
			if (!showCardinal) return dms;

			// Add cardinal directions if requested
			if (isLatitude) {
				return `${dms} ${value >= 0 ? 'N' : 'S'}`;
			} else {
				return `${dms} ${value >= 0 ? 'E' : 'W'}`;
			}
		}
	}
</script>

<div class="container">
	<div class="sidebar">
		<div class="points-list">
			<h3>Added Points</h3>
			{#each my_state.points as point, i}
				<div class="input-group">
					<input
						type="text"
						value={formatCoordinate(point.latitude, true)}
						class="coord-input"
						readonly
					/>
					<input
						type="text"
						value={formatCoordinate(point.longitude, false)}
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
		flex: 0 0 300px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		overflow-y: auto;
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
	}

	.input-group {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-bottom: 8px;
	}

	.input-group:last-child {
		margin-bottom: 0;
	}

	.coord-input {
		width: 120px;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 14px;
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
</style>
