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
                <path d="M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3zM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8z"/>
                <path d="M8 1V0h2v1h2v2h-1v2H9V3H7v2H5V3H4V1h2V0h2z"/>
                <path d="M1 7v2h2V7H1zm12 0v2h2V7h-2zM8 13v2h2v-2H8z"/>
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