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
	import { Style, Icon } from 'ol/style';
	import { Control, defaults as defaultControls } from 'ol/control';

	let my_state: { points: Point[] } = $props();

	let map: Map;
	let vectorSource: VectorSource;
	let vectorLayer: VectorLayer;
	let tileDebugLayer: TileLayer;
	let mapElement: HTMLElement;

	let debugLayer = $state(true);

	const svg_alternatives: string[] = [
		// Original:
		'M1 1h4v4H1V1zm5 0h4v4H6V1zm5 0h4v4h-4V1zM1 6h4v4H1V6zm5 0h4v4H6V6zm5 0h4v4h-4V6zM1 11h4v4H1v-4zm5 0h4v4H6v-4zm5 0h4v4h-4v-4z',
		// Alternative 1: Simpler grid
		'M0 0v16h16V0H0zm5 1v4h-4V1h4zm5 0v4h-4V1h4zm5 0v4h-4V1h4zM1 6h4v4H1V6zm5 0h4v4H6V6zm5 0h4v4h-4V6zM1 11h4v4H1v-4zm5 0h4v4H6v-4zm5 0h4v4h-4v-4z',
		// Alternative 2: More detailed grid
		'M1 1v14h14V1H1zm13 13H2V2h12v12zM4 4h2v2H4V4zm3 0h2v2H7V4zm3 0h2v2h-2V4zM4 7h2v2H4V7zm3 0h2v2H7V7zm3 0h2v2h-2V7zM4 10h2v2H4v-2zm3 0h2v2H7v-2zm3 0h2v2h-2v-2z',
		// Alternative 3: Minimal grid
		'M6 1v14M10 1v14M1 6h14M1 10h14'
	];
	class DebugLayerControl extends Control {
		constructor() {
			const button = document.createElement('button');
			button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path d="${svg_alternatives[1]}"/>
            </svg>`;
			button.title = 'Toggle Debug Grid'; // Tooltip on hover

			const element = document.createElement('div');
			element.className = 'ol-control ol-unselectable debug-layer-control';
			element.appendChild(button);

			super({
				element: element,
				target: undefined
			});

			button.addEventListener('click', () => {
				debugLayer = !debugLayer;
				button.classList.toggle('active');
			});
		}
	}

	$effect(() => {
		vectorSource = new VectorSource();
		vectorLayer = new VectorLayer({
			source: vectorSource
		});
		tileDebugLayer = new TileLayer({
			source: new TileDebug()
		});

		map = new Map({
			target: mapElement,
			layers: [
				new TileLayer({
					source: new OSM()
				}),
				tileDebugLayer,
				vectorLayer
			],
			view: new View({
				center: fromLonLat([0, 0]),
				zoom: 2,
				minZoom: 0
			}),
			controls: defaultControls().extend([new DebugLayerControl()])
		});

		return () => {};
	});

	$effect(() => {
		if (tileDebugLayer) {
			tileDebugLayer.setVisible(debugLayer);
			const button = document.querySelector('.debug-layer-control button');
			if (button) {
				button.classList.toggle('active', debugLayer);
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
					image: new Icon({
						src: 'https://openlayers.org/en/latest/examples/data/icon.png'
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
