import { Control } from 'ol/control';
import type Map from 'ol/Map';
import type { VectorSource } from 'ol/source';

export class FitMarkersControl extends Control {
	private map: Map | null = null;
	private vectorSource: VectorSource | null = null;

	constructor(getVectorSource: () => VectorSource | null) {
		const button = document.createElement('button');
		button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <rect x="2" y="3" width="12" height="10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2,2"/>
                <path d="M2 3L1 2h2v2zm11 0l1-1h-2v2zM2 13l-1 1h2v-2zm11 0l1 1h-2v-2z" fill="currentColor"/>
            </svg>`;
		button.title = 'Fit to All Markers';

		const element = document.createElement('div');
		element.className = 'ol-control ol-unselectable fit-markers-control';
		element.appendChild(button);

		super({
			element: element,
			target: undefined
		});

		button.addEventListener('click', () => {
			this.fitToAllMarkers(getVectorSource());
		});
	}

	setMap(map: Map | null) {
		super.setMap(map);
		this.map = map;
	}

	private fitToAllMarkers(vectorSource: VectorSource | null) {
		if (!this.map || !vectorSource) {
			console.warn('Map or vector source not available');
			return;
		}

		const features = vectorSource.getFeatures();
		if (features.length === 0) {
			console.warn('No markers to fit to');
			return;
		}

		const extent = vectorSource.getExtent();
		if (!extent || extent.some((val) => !isFinite(val))) {
			console.warn('Invalid extent:', extent);
			return;
		}

		const padding = 50;
		const maxZoom = features.length === 1 ? 10 : 18; // Zoom closer for single marker

		this.map.getView().fit(extent, {
			size: this.map.getSize(),
			padding: [padding, padding, padding, padding],
			duration: 1000,
			maxZoom: maxZoom,
			callback: (complete: boolean) => {
				if (!complete) {
					console.warn('Fit to markers animation was interrupted');
				}
			}
		});
	}
}