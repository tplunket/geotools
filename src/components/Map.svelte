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

	let my_state: { points: Point[] } = $props();

	let map;
	let vectorSource: VectorSource;
	let vectorLayer: VectorLayer;
	let debugLayer: TileLayer;
	let debug = $state(false);

	$effect(() => {
		if (debugLayer) {
			debugLayer.setVisible(debug);
		}
	});

	$effect(() => {
		vectorSource = new VectorSource();
		vectorLayer = new VectorLayer({
			source: vectorSource
		});

		debugLayer = new TileLayer({
			source: new TileDebug(),
			visible: false
		});

		map = new Map({
			target: 'map',
			layers: [
				new TileLayer({
					source: new OSM()
				}),
				debugLayer,
				vectorLayer
			],
			view: new View({
				center: fromLonLat([0, 0]),
				zoom: 2
			})
		});
	});

	$effect(() => {
		if (my_state.points.length) {
			console.log('num points:' + my_state.points.length);
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
		}
	});
</script>

<div id="map">
	<input
		type="checkbox"
		id="enable-debug"
		onclick={() => (debug = !debug)}
		value={debug}
	/>
	<label for="enable-debug">Enable Debug</label>
</div>

<style>
	#map {
		width: 100%;
		height: 512px;
	}
</style>
