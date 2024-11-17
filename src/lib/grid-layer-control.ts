import { Control } from 'ol/control';

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

export class GridLayerControl extends Control {
	constructor(onToggle: (value: boolean) => void) {
		const button = document.createElement('button');
		button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path d="${svg_alternatives[1]}"/>
            </svg>`;
		button.title = 'Toggle Debug Grid';

		const element = document.createElement('div');
		element.className = 'ol-control ol-unselectable debug-layer-control';
		element.appendChild(button);

		super({
			element: element,
			target: undefined
		});

		button.addEventListener('click', () => {
			const newValue = !button.classList.contains('active');
			button.classList.toggle('active');
			onToggle(newValue);
		});
	}
}
