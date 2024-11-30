<script lang="ts">
	import Map from '$components/Map.svelte';
	import PointList from '$components/PointList.svelte';
	import type { Point } from '$lib/types';
</script>

<div class="container">
	<div class="sidebar">
		<PointList />
	</div>
	<div class="map-container">
		<Map />
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

	.map-container {
		flex: 1 1 auto;
		position: relative;
		min-width: 0;
		overflow: hidden;
	}
</style>
