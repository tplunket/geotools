# Tom's GeoTools

Since I got into "mapping" I've had a few utilities that I've wanted to implement to make my own
life easier so that's what this is. I've never done any web development so it is what it is; this
project's key components are Svelte 5 and OpenLayers. I removed TailwindCSS from the default
SvelteKit installation because it exerts too much control over the way divs resize when the browser
does. I can understand why it does that but it's super annoying for an application like this.

## Features

### Interactive Map & Location Management
- Click on the map to place markers, which creates an entry in the location list
- Manually add locations to the list, which creates corresponding markers
- Colors cycle as markers are created, entries in the location list and markers share the same color for easy identification
- Hovering items in the location list or on the map highlights the corresponding other item
- Individual entries in the location list can be swapped (lat↔lon) in case the source has them reversed

### Enhanced Coordinate Input System
- **Smart Paste Detection**: Automatically detects single coordinates vs. multiple coordinate sets
- **Universal Format Support**: Handles decimal degrees (`45.123`), DMS with symbols (`45°30'15"N`), and DMS with letters (`45d30m15s`)
- **Intelligent Pairing**: Uses 5 strategies to pair coordinates with confidence scoring:
  - Explicit cardinals (N/S/E/W determine coordinate type)
  - Mixed cardinals (some coordinates have cardinals, others don't)
  - Alternating pattern detection (lat-lon-lat-lon sequences)
  - Range inference (coordinates >90° likely longitude)
  - User order preference (respects UI lat/lon vs lon/lat setting)
- **Interactive Preview Modal**: Shows parsed results in an editable table with:
  - Real-time validation and error highlighting
  - Confidence scores for coordinate pairs
  - Ability to edit individual coordinates
  - Raw text editor for retry functionality
  - Warning display for potential parsing issues

### Precision & Display Options
- **Exact Precision Storage**: Uses rational number representation (degrees + numerator/denominator) to avoid floating-point precision loss
- **Flexible Display**: Toggle between decimal degrees and DMS formats
- **Cardinal Direction Support**: Optional N/S/E/W display for both decimal and DMS formats
- **Input Order Control**: Switch between latitude/longitude and longitude/latitude ordering
- **Bulk Operations**: Copy entire coordinate list to clipboard in your preferred format

### Comprehensive Testing
- 183 automated tests covering all coordinate parsing scenarios
- 98.5% test coverage ensuring reliability
- Production-ready build system with TypeScript validation
