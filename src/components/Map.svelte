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
	import Overlay from 'ol/Overlay';
	import { GridLayerControl } from '$lib/grid-layer-control';
	import { FitMarkersControl } from '$lib/fit-markers-control';
	import { formatCoordinate } from '$lib/coordinates';
	import { globals } from '$lib/global-data.svelte';

	let map: Map;
	let vectorSource: VectorSource;
	let vectorLayer: VectorLayer;
	let gridLayer: TileLayer;
	let mapElement: HTMLElement;
	let tooltipElement: HTMLElement;
	let tooltipOverlay: Overlay;

	let showGridLayer = $state(true);

	$effect(() => {
		vectorSource = new VectorSource();
		vectorLayer = new VectorLayer({
			source: vectorSource
		});
		gridLayer = new TileLayer({
			source: new TileDebug()
		});

		// Create tooltip overlay
		tooltipOverlay = new Overlay({
			element: tooltipElement,
			offset: [15, 0],
			positioning: 'center-left'
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
				}),
				new FitMarkersControl(() => vectorSource)
			]),
			overlays: [tooltipOverlay]
		});

		// Add tooltip interaction
		map.on('pointermove', (event) => {
			const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
			
			if (feature && feature.get('isMarker')) {
				const coordinates = feature.get('coordinates');
				if (coordinates) {
					const { latitude, longitude } = coordinates;
					
					// Always display in lat-lon order with cardinal directions
					const latText = formatCoordinate(latitude.toString(), true, globals.displayFormat, true);
					const lonText = formatCoordinate(longitude.toString(), false, globals.displayFormat, true);
					
					tooltipElement.innerHTML = `${latText}, ${lonText}`;
					tooltipOverlay.setPosition(event.coordinate);
					tooltipElement.style.display = 'block';
				}
			} else {
				tooltipElement.style.display = 'none';
			}
		});

		// Force map to recalculate its size after container is properly set up
		setTimeout(() => {
			map.updateSize();
		}, 100);

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
		globals.points.forEach((point: Point) => {
			const feature = new Feature({
				geometry: new OlPoint(fromLonLat([point.longitude, point.latitude]))
			});
			
			// Store coordinate data and marker flag for tooltip
			feature.set('isMarker', true);
			feature.set('coordinates', {
				latitude: point.latitude,
				longitude: point.longitude
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
		if (globals.points.length > 0) {
			// Wait for the vector source to update
			setTimeout(() => {
				const extent = vectorSource.getExtent();
				if (!extent || extent.some((val) => !isFinite(val))) {
					console.warn('Invalid extent:', extent);
					return;
				}
				const currentZoom = map.getView().getZoom() ?? 0;
				const naturalZoom = 6 + globals.points.length;
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
	<div class="tooltip" bind:this={tooltipElement}></div>
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
		height: 100%;
	}

	:global(.debug-layer-control) {
		top: 60px;
		left: 0.5em;
	}

	:global(.fit-markers-control) {
		top: 83px;
		left: 0.5em;
	}

	:global(.debug-layer-control button),
	:global(.fit-markers-control button) {
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

	:global(.debug-layer-control svg),
	:global(.fit-markers-control svg) {
		display: block;
		fill: currentColor;
	}

	:global(.debug-layer-control button:hover svg),
	:global(.fit-markers-control button:hover svg) {
		fill: #333;
	}

	:global(.fit-markers-control button:hover) {
		background-color: rgba(255, 255, 255, 0.95) !important;
	}

	:global(.ol-attribution) {
		bottom: 42px;
		right: 2px;
		border-radius: 10px 0 0;
	}

	.tooltip {
		background-color: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 6px 10px;
		border-radius: 4px;
		font-family: monospace;
		font-size: 12px;
		font-weight: 500;
		white-space: nowrap;
		pointer-events: none;
		display: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.2);
		z-index: 1000;
	}
</style>
