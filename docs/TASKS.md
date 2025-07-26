# The task list

## Current Status (Updated 2025-01-27)

### ✅ Recently Completed
- **Testing Infrastructure**: Full automated test suite with 96 passing tests
- **UI Components**: Radio buttons (Decimal/DMS), Cardinal directions checkbox
- **Coordinate System**: Complete validation and formatting logic
- **Two-Panel Layout**: Responsive sidebar and map layout working
- **Dynamic Table Interface**: Points display as table rows with input row always available
- **Input Order Toggle**: Radio buttons for lat/lon vs lon/lat interpretation

### 🔄 In Progress
- **Copy All to Clipboard**: Export functionality for complete coordinate list

### 🎯 Next Up (Phase 1 Priority)
- **Copy to Clipboard**: Export current coordinate list functionality
- **Marker Tooltips**: Show coordinate info on map marker hover

---

## Development Plan

This plan outlines the steps to implement the remaining features for the GeoTools project, focusing on a phased approach to ensure quality and manage complexity.

### Phase 1: Core Functionality and User Experience

1.  **UI Layout & Polish:** Refine the overall user interface.
    - [x] ~~Implement the responsive two-panel layout (Location List and Map).~~ **COMPLETED** ✅
    - [ ] Implement two-stage tooltips for all UI buttons (concise, then verbose).
    - [ ] Add visual cues for user interactions (e.g., hovering over list items highlights the map marker and vice-versa).
    - [x] ~~**Testing:** Manual testing and UI automation to ensure visual consistency and responsiveness.~~ **COMPLETED** ✅ (94 tests passing)
2.  **Map View:** Implement core map features.
    - [ ] Add a "fit to all markers" button to the map controls. **IN PROGRESS** 🔄
    - [ ] Implement tooltips for markers on the map to display point information.
    - [x] ~~**Testing:** Write unit and integration tests for map controls.~~ **COMPLETED** ✅
3.  **Location List (Display & Interaction):** Implement the display and basic interaction features of the location list.
    - [x] ~~Add radio buttons to toggle the display format between Decimal Degrees and DMS.~~ **COMPLETED** ✅
    - [x] ~~Add a checkbox to toggle the display of cardinal directions (N, S, E, W).~~ **COMPLETED** ✅
    - [ ] Add a button to copy the entire visible location list to the clipboard. **NEXT PRIORITY** 🎯
    - [x] ~~**Testing:** Create unit tests for coordinate formatting functions and integration tests for the UI controls.~~ **COMPLETED** ✅ (80 coordinate tests + 8 UI tests)

### Phase 2: Advanced Features and Data Management

1.  **Location List (Editing & Management):** Enhance the list with editing capabilities.
    - [ ] Allow editing of coordinates directly within the list.
    - [ ] Add a "swap" button for each entry to swap its latitude and longitude.
    - [ ] Add a "delete" button for each entry.
    - [ ] Implement the "undelete" functionality, allowing users to view and restore deleted locations.
    - [ ] **Testing:** Write unit and integration tests for editing, swapping, deleting, and undeleting locations.
2.  **Marker and Swatch Colors:** Implement the color selection feature.
    - [ ] Ensure new markers cycle through a visually distinct set of colors.
    - [ ] Add a color swatch to each item in the location list that matches its map marker.
    - [ ] Implement a color picker that appears when the swatch is clicked, allowing the user to change the color of the marker and swatch.
    - [ ] **Testing:** Test color generation and user-selected color updates.
3.  **Advanced Data Entry:** Implement manual and paste-based data entry.
    - [x] ~~Create the top entry form (two text fields, "add" button).~~ **COMPLETED** ✅
    - [ ] Add radio buttons to interpret manual input as lat/lon or lon/lat.
    - [ ] Implement the full paste logic (Ctrl-V) to handle single/multiple locations in various formats (Decimal, DMS).
    - [ ] Implement validation for pasted data, including prompting the user to swap inconsistent coordinates.
    - [x] ~~**Testing:** Create an extensive test suite for the data parsing and validation logic.~~ **COMPLETED** ✅ (Comprehensive coordinate validation tests)

### Phase 3: Architecture and Finalization

1.  **Internal Precision Storage:** Implement the high-precision storage model.
    - [ ] Refactor internal location storage to use a numerator/denominator model to maintain precision.
    - [ ] Ensure input is truncated at 16 decimal places as per the requirement.
    - [ ] **Testing:** Write unit tests to verify the precision of mathematical operations.
2.  **Data Persistence:** Implement a mechanism to store and retrieve point data between sessions.
    - [ ] Choose a suitable storage solution (e.g., Local Storage for simplicity).
    - [ ] Create functions for saving and loading the location list.
    - [ ] **Testing:** Integration tests to verify data saving and loading functionality.
3.  **GeoJSON Support:** Add support for importing and exporting data in GeoJSON format.
    - [ ] Implement functions to convert between internal point data and GeoJSON.
    - [ ] Create UI elements for importing and exporting GeoJSON files.
    - [ ] **Testing:** Unit and integration tests to validate GeoJSON import/export.
4.  **Refinement, Documentation, and Deployment**
    - [ ] Conduct thorough code reviews and refactor as needed.
    - [ ] Update all documentation (README, DEVELOPING, etc.) to reflect all implemented features.
    - [ ] Perform comprehensive end-to-end testing.
    - [ ] Prepare the application for deployment.

### Phase 4: Future Extensions

1.  **Report tile ranges for MbTiles creation:** Facilitate the creation of MbTiles files.
    - [ ] Create tile ranges to provide coverage of the points with map tiles at different zoom levels
    - [ ] Create SQL script to create the database from another source
    - [ ] Create script with GDAL commands to create the database from image sources
    - [ ] **Testing:** Extensive unit and integration tests for database creation.

This plan provides a structured approach to developing the remaining features.

**Note:** Remember to create feature branches (prefixed with "g/") for each development task and follow the development guidelines outlined in the documentation.
