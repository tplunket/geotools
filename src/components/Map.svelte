<script lang="ts">
	import 'ol/ol.css';
	import Map from 'ol/Map';
	import View from 'ol/View';
	import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
	import { OSM, TileDebug } from 'ol/source';
	import { Vector as VectorSource } from 'ol/source';
	import { type Point } from '$lib/types';
	import { Point as OlPoint } from 'ol/geom';
	import { Feature } from 'ol';
	import { fromLonLat } from 'ol/proj';
	import { Style, Circle, Fill, Stroke } from 'ol/style';
	import { defaults as defaultControls } from 'ol/control';
	import { GridLayerControl } from '$lib/grid-layer-control';

	let my_state: { points: Point[] } = $props();

	let map: Map;
	let vectorSource: VectorSource;
	let vectorLayer: VectorLayer;
	let gridLayer: TileLayer;
	let mapElement: HTMLElement;

	let showGridLayer = $state(true);

	$effect(() => {
		vectorSource = new VectorSource();
		vectorLayer = new VectorLayer({
			source: vectorSource
		});
		gridLayer = new TileLayer({
			source: new TileDebug()
		});

		map = new Map({
			target: mapElement,
			layers: [
				new TileLayer({
					source: new OSM()
				}),
				gridLayer,
				vectorLayer
			],
			view: new View({
				center: fromLonLat([0, 0]),
				zoom: 2,
				minZoom: 0
			}),
			controls: defaultControls().extend([
				new GridLayerControl((value) => {
					showGridLayer = value;
				})
			])
		});

		return () => {};
	});

	$effect(() => {
		if (gridLayer) {
			gridLayer.setVisible(showGridLayer);
			const button = document.querySelector('.debug-layer-control button');
			if (button) {
				button.classList.toggle('active', showGridLayer);
			}
		}
	});

	$effect(() => {
		vectorSource.clear();
		my_state.points.forEach((point: Point) => {
			const feature = new Feature({
				geometry: new OlPoint(fromLonLat([point.longitude, point.latitude]))
			});
			feature.setStyle(
				new Style({
					image: new Circle({
						radius: 7,
						fill: new Fill({ color: 'red' }),
						stroke: new Stroke({ color: 'magenta', width: 2 })
					})
				})
			);
			vectorSource.addFeature(feature);
		});

		// If there are points, fit the view to show all of them
		if (my_state.points.length > 0) {
			// Wait for the vector source to update
			setTimeout(() => {
				const extent = vectorSource.getExtent();
				if (!extent || extent.some((val) => !isFinite(val))) {
					console.warn('Invalid extent:', extent);
					return;
				}
				const currentZoom = map.getView().getZoom() ?? 0;
				const naturalZoom = 6 + my_state.points.length;
				const newZoom = Math.min(18, Math.max(currentZoom, naturalZoom));
				const padding = 50;
				map.getView().fit(extent, {
					size: map.getSize(),
					padding: [padding, padding, padding, padding],
					duration: 1000,
					maxZoom: newZoom,
					callback: (complete: boolean) => {
						if (!complete) {
							console.warn('View fit animation was interrupted');
						}
					}
				});
			}, 100);
		}
	});
</script>

<div class="map-wrapper">
	<div id="map" bind:this={mapElement}></div>
</div>

<style>
	.map-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	#map {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100vh;
	}

	:global(.debug-layer-control) {
		top: 60px;
		left: 0.5em;
	}

	:global(.debug-layer-control button) {
		padding: 4px !important;
		display: flex !important;
		align-items: center;
		justify-content: center;
		background-color: rgba(255, 255, 255, 0.8) !important;
		color: rgb(96, 96, 96) !important;
		border: 1px solid #ccc !important;
	}

	:global(.debug-layer-control button.active) {
		background-color: rgb(173, 218, 255) !important;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15) !important;
	}

	:global(.debug-layer-control svg) {
		display: block;
		fill: currentColor;
	}

	:global(.debug-layer-control button:hover svg) {
		fill: #333;
	}

	:global(.ol-attribution) {
		bottom: 42px;
		right: 2px;
		border-radius: 10px 0 0;
	}
</style>
