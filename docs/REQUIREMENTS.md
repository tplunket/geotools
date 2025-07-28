# Features and Requirements

## Overview

The overall browser window is split into into left and right panels that are both "full height". The left panel is the Location List and related functionality and the Map view is on the right. The Map generally takes up most of the width of the window, although for smaller window sizes including some mobile applications the location list and map may each be full screen with controls to switch back and forth. The use of "location" throughout this document should be understood to mean "latitude/longitude pair" and there is an entry for a location in the location list and a marker on the map indicating where in the world it represents.

Buttons in the UI are as small as possible to hold icons that legibly define the operation. These buttons all have tooltips; these tooltips initially have just a concise "command name" but if the hover remains for five seconds the tooltip offers a more verbose description of the function.

## The Map

The map view takes up most of the browser frame. It shows a simple map view with map tiles from open sources, perhaps OpenStreetMap or perhaps hosted alongside this application. It can be scrolled by clicking and dragging the map. The scroll wheel or other suitable input can be used to change zoom levels on the map. The map also has controls for manually zooming in and out as well as fitting the map view to show all of the markers that are placed on the map. The map view is always north-up.

## The Location List

The left panel is broadly the location list, although it is split into a few sections. The top line is for entry of a new locations. The UI is two text edit fields followed by an "add" button, the button is as small as possible while remaining obvious for its function. Below the two text edit fields is a set of radio buttons to interpret the input as latitude/longitude or longitude/latitude.Below this is the actual list of locations, each location has individual text edit boxes for each location followed by two buttons, one which swaps the latitude and longitude and the other which deletes the location from the list (and its associated marker). A list of deleted locations is maintained and the UI can be toggled to show them to allow the user to undelete specific entries.

Below the list of locations are display format controls:
- **Format Toggle**: Radio buttons to switch between decimal degrees and DMS (degree, minute, second) display
- **Cardinal Directions**: Checkbox to show N/S/E/W cardinal directions after coordinates
- **Input Order**: Radio buttons to set whether new inputs are interpreted as lat/lon or lon/lat

**Enhanced Clipboard Integration**:
- **Copy All**: Button to copy the entire location list in the currently selected display format
- **Individual Copy**: Each location row has a copy button for single-coordinate copying
- **Format Consistency**: Copied coordinates match the current display format settings
- **Paste Intelligence**: Paste button automatically detects and processes multiple coordinate formats

## Enhanced Coordinate Input System

### Smart Paste Detection
The system automatically detects whether pasted content contains a single coordinate pair or multiple coordinates. Simple clipboard operations (1-2 coordinates) use the existing quick-fill logic, while complex data triggers the enhanced parsing system.

### Universal Format Support
The enhanced coordinate parser accepts "whatever" input format, supporting:
- **Decimal degrees**: `45.123456`, `-122.456789`
- **DMS with symbols**: `45°30'15.25"N`, `122°15'30"W`
- **DMS with letters**: `45d30m15.25sN`, `122d15m30sW`
- **Mixed notation**: `45°30mN` (degree symbol with minute letter)
- **Mixed formats**: Different coordinates can use different formats in the same input

### Intelligent Coordinate Pairing
The system uses 5 sophisticated strategies to pair coordinates with confidence scoring:

1. **Explicit Cardinals** (95% confidence): When coordinates have N/S/E/W directions
2. **Mixed Cardinals** (85% confidence): Some coordinates explicit, others inferred
3. **Alternating Pattern Detection** (75% confidence): Automatically detects lat-lon-lat-lon sequences
4. **Range Inference** (70% confidence): Values >90° are likely longitude
5. **User Order Fallback** (50% confidence): Respects UI lat/lon vs lon/lat preference

### Interactive Preview Modal
For multiple coordinates, an interactive modal displays:
- **Parsed Results Table**: Shows all coordinate pairs with real-time validation
- **Confidence Scoring**: Visual indicators for pairing confidence levels
- **Editable Coordinates**: Click any coordinate to edit and re-validate
- **Strategy Display**: Shows which pairing strategy was used
- **Warning System**: Alerts for odd numbers of coordinates or unbalanced cardinals
- **Raw Text Editor**: Allows editing original input and re-parsing
- **Accept/Reject Options**: User can accept valid pairs or cancel entirely

### Validation and Error Handling
- **Cardinal Range Validation**: N/S coordinates validated against ±90°, E/W against ±180°
- **Inferred Range Validation**: Non-cardinal coordinates validated based on inferred type
- **Real-time Feedback**: Immediate validation with error highlighting
- **Graceful Degradation**: Invalid coordinates marked but don't prevent valid ones from being accepted

## Marker colors

Marker colors cycle the color wheel in a meaningful way to maximize discrimination. To the left of each location in the location list there is a color swatch that matches the associated marker's color. This color swatch can be clicked to bring up a color selector, which would change the marker color and the color of the swatch.

## Enhanced Precision Storage System

### ExactCoordinate Data Structure
Internally, all coordinates are stored using the `ExactCoordinate` interface which maintains exact mathematical precision:

```typescript
interface ExactCoordinate {
  degrees: number;        // Whole degrees (always positive)
  numerator: number;      // Fractional part numerator
  denominator: number;    // Base: 1, 10, 60, 3600, 10^n, etc.
  isNegative: boolean;    // Sign stored separately
  cardinal?: 'N'|'S'|'E'|'W';  // Optional cardinal direction
  isExplicit: boolean;    // Whether coordinate type was explicitly specified
}
```

### Precision Preservation
- **Decimal Input**: Denominator = 10^(decimal places). E.g., `45.123456` → numerator: 123456, denominator: 1000000
- **DMS Input**: Base denominators of 60 (minutes) or 3600 (seconds), multiplied by powers of 10 for decimal components
- **High Precision**: Supports arbitrary precision limited only by JavaScript's number range
- **Exact Representation**: No floating-point precision loss during storage or calculations

### Mathematical Operations
All coordinate math is performed using exact rational arithmetic:
- **Storage**: `coordinate_value = degrees + (numerator / denominator)`
- **Sign Handling**: `final_value = isNegative ? -coordinate_value : coordinate_value`
- **Display Conversion**: Rational-to-decimal conversion only occurs at display time
- **Format Preservation**: Original input format characteristics are maintained

### Validation Integration
The precision system integrates with validation:
- **Range Checking**: Performed on exact rational values, not floating-point approximations
- **Cardinal Constraints**: N/S limited to 0°-90°, E/W to 0°-180° (cardinal determines sign)
- **Type Inference**: Range validation assists in coordinate type determination
