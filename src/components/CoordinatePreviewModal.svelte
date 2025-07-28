<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { 
		EditableCoordinatePair, 
		ExactCoordinate, 
		PairingAnalysis 
	} from '$lib/types';
	import { 
		parseCoordinateExact, 
		exactToDisplayString,
		parseCoordinateStream,
		analyzeCoordinateStream,
		pairCoordinates,
		validateCardinalRange,
		validateInferredRange,
		exactToDecimal
	} from '$lib/enhanced-coordinates';

	export let isOpen = false;
	export let pairs: EditableCoordinatePair[] = [];
	export let unpaired: ExactCoordinate[] = [];
	export let analysis: PairingAnalysis;
	export let originalText = '';
	export let userOrder: 'lat-lon' | 'lon-lat' = 'lat-lon';

	const dispatch = createEventDispatcher<{
		accept: { pairs: EditableCoordinatePair[] };
		reject: void;
		retry: { text: string };
	}>();

	let editedText = originalText;
	let showRawEditor = false;

	function validateCoordinatePair(pair: EditableCoordinatePair): boolean {
		// Validate individual coordinates
		const latValid = validateCardinalRange(pair.latitude);
		const lonValid = validateCardinalRange(pair.longitude);
		
		if (!latValid.isValid || !lonValid.isValid) {
			return false;
		}

		// Validate inferred ranges
		const latInferredValid = validateInferredRange(pair.latitude, 'latitude');
		const lonInferredValid = validateInferredRange(pair.longitude, 'longitude');

		return latInferredValid.isValid && lonInferredValid.isValid;
	}

	function handleCellEdit(pairId: string, field: 'latitude' | 'longitude', newText: string) {
		const pairIndex = pairs.findIndex(p => p.id === pairId);
		if (pairIndex === -1) return;

		const updatedPair = { ...pairs[pairIndex] };
		updatedPair[`${field}Text`] = newText;

		// Re-parse the coordinate
		const newCoord = parseCoordinateExact(newText);
		if (newCoord) {
			updatedPair[field] = newCoord;
			updatedPair.errors = updatedPair.errors.filter(e => !e.includes(field));
		} else {
			updatedPair.errors = [...updatedPair.errors.filter(e => !e.includes(field)), 
							   `Invalid ${field} format`];
		}

		// Validate the pair
		updatedPair.isValid = validateCoordinatePair(updatedPair);

		pairs[pairIndex] = updatedPair;
		pairs = [...pairs]; // Trigger reactivity
	}

	function addNewPair() {
		const newPair: EditableCoordinatePair = {
			id: `new-${Date.now()}`,
			latitude: { degrees: 0, numerator: 0, denominator: 1, isNegative: false, isExplicit: false },
			longitude: { degrees: 0, numerator: 0, denominator: 1, isNegative: false, isExplicit: false },
			latitudeText: '',
			longitudeText: '',
			isValid: false,
			errors: [],
			confidence: 0
		};

		pairs = [...pairs, newPair];
	}

	function removePair(pairId: string) {
		pairs = pairs.filter(p => p.id !== pairId);
	}

	function handleAccept() {
		const validPairs = pairs.filter(p => p.isValid);
		if (validPairs.length === 0) {
			alert('Please fix validation errors before accepting');
			return;
		}

		dispatch('accept', { pairs: validPairs });
	}

	function handleRetry() {
		dispatch('retry', { text: editedText });
	}

	$: allValid = pairs.length > 0 && pairs.every(p => p.isValid);
	$: hasErrors = pairs.some(p => p.errors.length > 0);
	$: validCount = pairs.filter(p => p.isValid).length;
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={() => dispatch('reject')} role="dialog" aria-modal="true" tabindex="-1">
		<div class="modal-content" on:click|stopPropagation>
			<!-- Header -->
			<div class="modal-header">
				<h2>Review Parsed Coordinates</h2>
				<button class="close-button" on:click={() => dispatch('reject')} aria-label="Close modal">×</button>
			</div>

			<!-- Analysis Summary -->
			<div class="analysis-summary">
				<div class="summary-stats">
					<span class="stat">📍 {pairs.length} coordinate pairs</span>
					<span class="stat">🎯 {(analysis.confidence * 100).toFixed(0)}% confidence</span>
					<span class="stat">📊 Strategy: {analysis.suggestedStrategy}</span>
				</div>

				{#if analysis.warnings.length > 0}
					<div class="warnings">
						{#each analysis.warnings as warning}
							<div class="warning">⚠️ {warning}</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Coordinate Table -->
			<div class="coordinate-table-container">
				<table class="coordinate-table">
					<thead>
						<tr>
							<th>Row</th>
							<th>Latitude</th>
							<th>Longitude</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each pairs as pair, index (pair.id)}
							<tr class:invalid={!pair.isValid} class:low-confidence={pair.confidence < 0.5}>
								<td class="row-number">{index + 1}</td>

								<!-- Latitude Cell -->
								<td class="coordinate-cell">
									<input
										type="text"
										value={pair.latitudeText}
										on:input={(e) => handleCellEdit(pair.id, 'latitude', (e.target as HTMLInputElement).value)}
										class="coordinate-input"
										class:error={pair.errors.some(e => e.includes('latitude'))}
										placeholder="e.g., 45°30'N or 45.5"
									/>
									<div class="coordinate-preview">
										{exactToDisplayString(pair.latitude)}
									</div>
								</td>

								<!-- Longitude Cell -->
								<td class="coordinate-cell">
									<input
										type="text"
										value={pair.longitudeText}
										on:input={(e) => handleCellEdit(pair.id, 'longitude', (e.target as HTMLInputElement).value)}
										class="coordinate-input"
										class:error={pair.errors.some(e => e.includes('longitude'))}
										placeholder="e.g., 122°15'W or -122.25"
									/>
									<div class="coordinate-preview">
										{exactToDisplayString(pair.longitude)}
									</div>
								</td>

								<!-- Status Cell -->
								<td class="status-cell">
									{#if pair.isValid}
										<span class="status-valid">✅ Valid</span>
									{:else}
										<span class="status-invalid">❌ Invalid</span>
										{#if pair.errors.length > 0}
											<ul class="error-list">
												{#each pair.errors as error}
													<li>{error}</li>
												{/each}
											</ul>
										{/if}
									{/if}

									{#if pair.confidence < 0.7}
										<div class="confidence-warning">
											⚠️ Low confidence ({(pair.confidence * 100).toFixed(0)}%)
										</div>
									{/if}
								</td>

								<!-- Actions Cell -->
								<td class="actions-cell">
									<button
										class="remove-button"
										on:click={() => removePair(pair.id)}
										title="Remove this coordinate pair"
										aria-label="Remove coordinate pair {index + 1}"
									>
										🗑️
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- Add New Pair Button -->
				<button class="add-pair-button" on:click={addNewPair}>
					➕ Add Coordinate Pair
				</button>
			</div>

			<!-- Unpaired Coordinates -->
			{#if unpaired.length > 0}
				<div class="unpaired-section">
					<h3>Unpaired Coordinates</h3>
					<div class="unpaired-list">
						{#each unpaired as coord}
							<span class="unpaired-coord">{exactToDisplayString(coord)}</span>
						{/each}
					</div>
					<p class="unpaired-help">
						These coordinates couldn't be paired automatically. Consider editing the text below and retrying.
					</p>
				</div>
			{/if}

			<!-- Raw Text Editor -->
			<div class="raw-editor-section">
				<button 
					class="toggle-editor"
					on:click={() => showRawEditor = !showRawEditor}
					aria-expanded={showRawEditor}
				>
					{showRawEditor ? '▼' : '▶'} Edit Original Text
				</button>

				{#if showRawEditor}
					<textarea
						bind:value={editedText}
						class="raw-text-editor"
						placeholder="Paste coordinate data here..."
						rows="6"
					></textarea>
					<button class="retry-button" on:click={handleRetry}>
						🔄 Re-parse Text
					</button>
				{/if}
			</div>

			<!-- Footer Actions -->
			<div class="modal-footer">
				<button class="cancel-button" on:click={() => dispatch('reject')}>
					Cancel
				</button>
				<button 
					class="accept-button" 
					on:click={handleAccept}
					disabled={!allValid && validCount === 0}
					class:warning={hasErrors}
				>
					{#if hasErrors && validCount > 0}
						Accept Valid Coordinates ({validCount})
					{:else if allValid}
						Accept All Coordinates ({pairs.length})
					{:else}
						No Valid Coordinates
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal-content {
		background: white;
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		max-width: 90vw;
		max-height: 90vh;
		overflow-y: auto;
		width: 800px;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
		color: #1f2937;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #6b7280;
		padding: 4px;
		border-radius: 4px;
	}

	.close-button:hover {
		background-color: #f3f4f6;
		color: #374151;
	}

	.analysis-summary {
		padding: 16px 24px;
		background-color: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	.summary-stats {
		display: flex;
		gap: 16px;
		margin-bottom: 8px;
		flex-wrap: wrap;
	}

	.stat {
		font-size: 14px;
		color: #374151;
		background-color: #e5e7eb;
		padding: 4px 8px;
		border-radius: 4px;
	}

	.warnings {
		margin-top: 8px;
	}

	.warning {
		color: #d97706;
		font-size: 14px;
		margin-bottom: 4px;
	}

	.coordinate-table-container {
		padding: 16px 24px;
		max-height: 400px;
		overflow-y: auto;
	}

	.coordinate-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 16px;
	}

	.coordinate-table th,
	.coordinate-table td {
		padding: 8px 12px;
		text-align: left;
		border: 1px solid #e5e7eb;
	}

	.coordinate-table th {
		background-color: #f9fafb;
		font-weight: 600;
		color: #374151;
	}

	.coordinate-table tr.invalid {
		background-color: #fef2f2;
	}

	.coordinate-table tr.low-confidence {
		background-color: #fffbeb;
	}

	.row-number {
		width: 50px;
		text-align: center;
		font-weight: 500;
	}

	.coordinate-cell {
		width: 200px;
	}

	.coordinate-input {
		width: 100%;
		padding: 6px 8px;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 14px;
		font-family: monospace;
	}

	.coordinate-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.coordinate-input.error {
		border-color: #ef4444;
		background-color: #fef2f2;
	}

	.coordinate-preview {
		font-size: 12px;
		color: #6b7280;
		margin-top: 4px;
		font-family: monospace;
	}

	.status-cell {
		width: 150px;
	}

	.status-valid {
		color: #059669;
		font-weight: 500;
	}

	.status-invalid {
		color: #dc2626;
		font-weight: 500;
	}

	.error-list {
		margin: 4px 0 0 0;
		padding-left: 16px;
		font-size: 12px;
		color: #dc2626;
	}

	.confidence-warning {
		font-size: 12px;
		color: #d97706;
		margin-top: 4px;
	}

	.actions-cell {
		width: 80px;
		text-align: center;
	}

	.remove-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		font-size: 16px;
	}

	.remove-button:hover {
		background-color: #fef2f2;
	}

	.add-pair-button {
		background-color: #f3f4f6;
		border: 1px dashed #9ca3af;
		color: #6b7280;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		width: 100%;
	}

	.add-pair-button:hover {
		background-color: #e5e7eb;
		border-color: #6b7280;
		color: #374151;
	}

	.unpaired-section {
		padding: 16px 24px;
		background-color: #fef3c7;
		border-top: 1px solid #e5e7eb;
	}

	.unpaired-section h3 {
		margin: 0 0 8px 0;
		font-size: 16px;
		color: #92400e;
	}

	.unpaired-list {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 8px;
	}

	.unpaired-coord {
		background-color: #fbbf24;
		color: #92400e;
		padding: 4px 8px;
		border-radius: 4px;
		font-family: monospace;
		font-size: 14px;
	}

	.unpaired-help {
		margin: 0;
		font-size: 14px;
		color: #92400e;
	}

	.raw-editor-section {
		padding: 16px 24px;
		border-top: 1px solid #e5e7eb;
	}

	.toggle-editor {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 14px;
		color: #3b82f6;
		padding: 4px 0;
		margin-bottom: 8px;
	}

	.raw-text-editor {
		width: 100%;
		padding: 8px;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-family: monospace;
		font-size: 14px;
		resize: vertical;
		margin-bottom: 8px;
	}

	.retry-button {
		background-color: #f3f4f6;
		border: 1px solid #d1d5db;
		color: #374151;
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
	}

	.retry-button:hover {
		background-color: #e5e7eb;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding: 16px 24px;
		border-top: 1px solid #e5e7eb;
		background-color: #f9fafb;
	}

	.cancel-button {
		background-color: #f3f4f6;
		border: 1px solid #d1d5db;
		color: #374151;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
	}

	.cancel-button:hover {
		background-color: #e5e7eb;
	}

	.accept-button {
		background-color: #3b82f6;
		border: 1px solid #3b82f6;
		color: white;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
	}

	.accept-button:hover:not(:disabled) {
		background-color: #2563eb;
		border-color: #2563eb;
	}

	.accept-button:disabled {
		background-color: #9ca3af;
		border-color: #9ca3af;
		cursor: not-allowed;
	}

	.accept-button.warning {
		background-color: #d97706;
		border-color: #d97706;
	}

	.accept-button.warning:hover:not(:disabled) {
		background-color: #b45309;
		border-color: #b45309;
	}
</style>