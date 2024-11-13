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

	function formatCoordinate(value: number): string {
		return value.toFixed(6);
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
						value={formatCoordinate(point.latitude)}
						class="coord-input"
						readonly
					/>
					<input
						type="text"
						value={formatCoordinate(point.longitude)}
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
	}

	.sidebar {
		flex: 0 0 300px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.points-list {
		flex-grow: 1;
		background-color: #f5f5f5;
		border-radius: 4px;
		padding: 16px;
		overflow-y: auto;
	}

	.map-container {
		flex: 1;
		height: 100%;
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
</style>
