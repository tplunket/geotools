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

	//function forceMapResize() {
	//	if (map) {
	//		// Force multiple size updates to ensure proper rendering
	//		//map.updateSize();
	//		//setTimeout(() => map.updateSize(), 50);
	//		console.log(`pre: ${map.getSize()}`);
	//		map.setSize(map.getSize());
	//		setTimeout(() => map.updateSize(), 200);
	//		console.log(`post: ${map.getSize()}`);
	//	}
	//}

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
				zoom: 2
			}),
			controls: [] // Remove default controls if you don't need them
		});

		//const updateSize = () => {
		//	requestAnimationFrame(() => {
		//		if (map) {
		//			console.log(
		//				`size: ${mapElement.clientWidth}x${mapElement.clientHeight}`
		//			);
		//			//map.updateSize();
		//			forceMapResize();
		//		}
		//	});
		//};

		map.on('change:size', () => {
			const viewport = map.getViewport();
			const view = map.getView();
			const mapSize = map.getSize();
			console.log(
				`map size: ${mapSize} viewport size: ${viewport.clientWidth}x${viewport.clientHeight}`
			);
		});
		//const resizeObserver = new ResizeObserver(updateSize);
		//resizeObserver.observe(mapElement);

		return () => {
			//resizeObserver.disconnect();
		};
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
		width: 100vw;
		height: 100vh;
	}
</style>
