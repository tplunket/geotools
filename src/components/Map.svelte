<script lang="ts">
	import 'ol/ol.css';
	import Map from 'ol/Map';
	import View from 'ol/View';
	import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
	import { OSM } from 'ol/source';
	import { Vector as VectorSource } from 'ol/source';
	import { type Point } from '$lib/types';
	import { Point as OlPoint } from 'ol/geom';
	import { Feature } from 'ol';
	import { fromLonLat } from 'ol/proj';
	import { Style, Icon } from 'ol/style';

	let my_state: { points: Point[] } = $props();

	let map: Map;
	let vectorSource: VectorSource;
	let vectorLayer: VectorLayer;
	let mapElement: HTMLElement;

	$effect(() => {
		vectorSource = new VectorSource();
		vectorLayer = new VectorLayer({
			source: vectorSource
		});

		map = new Map({
			target: mapElement,
			layers: [
				new TileLayer({
					source: new OSM()
				}),
				vectorLayer
			],
			view: new View({
				center: fromLonLat([0, 0]),
				zoom: 2,
				minZoom: 0
			}),
			controls: [] // Remove default controls if you don't need them
		});

		return () => {};
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
</style>
