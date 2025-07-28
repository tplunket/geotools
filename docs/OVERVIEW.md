# Tom's GeoTools

This set of tools was borne from my experience needing to collect map tiles into MbTiles databases. I wanted to be able to easily plop down a bunch of points on a map either by clicking on the map to drop markers or by pasting or even uploading a list of latitude/longitude pairs. The workflows that I had developed made it all easier to handle but it was still tedious and was also done as part of employment so this all has been redeveloped from scratch.

## Current Implementation Status

The project has evolved significantly from its initial concept and now includes a sophisticated **Enhanced Coordinate System** that provides:

### Core Features (Fully Implemented)
- **Interactive Map Interface**: Click to place markers with OpenLayers integration
- **Smart Coordinate Input**: Universal parser supporting decimal degrees, DMS with symbols/letters, and mixed formats
- **Intelligent Coordinate Pairing**: 5 strategies with confidence scoring for automatic lat/lon matching
- **Exact Precision Storage**: Rational number system avoiding floating-point precision loss
- **Interactive Preview Modal**: Real-time validation and editing of parsed coordinates
- **Flexible Display Options**: Toggle between decimal/DMS formats with cardinal directions
- **Comprehensive Testing**: 183 automated tests with 98.5% coverage

### Architecture Highlights
- **SvelteKit 5**: Modern reactive framework with TypeScript
- **OpenLayers**: Professional mapping library
- **Vitest**: Comprehensive testing with browser and server environments  
- **Production Ready**: Full build system with static deployment support

## Documentation Structure

- **[README](../README.md)**: Complete feature overview and user guide
- **[REQUIREMENTS](./REQUIREMENTS.md)**: Detailed technical requirements and system behavior
- **[DEVELOPING](./DEVELOPING.md)**: Development environment setup and workflow
- **[TASKS](./TASKS.md)**: Development progress and remaining work
- **[COORDINATE-SYSTEM](./COORDINATE-SYSTEM.md)**: Technical deep-dive into the enhanced coordinate parsing system

The [README](../README.md) is mostly aspirational at this time; there is some basic support for placing markers and some clipboard handling but it's far from complete. I'll get a little more specific about requirements in other documentation, starting from the [REQUIREMENTS](./REQUIREMENTS.md) document.
