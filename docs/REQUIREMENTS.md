# Features and Requirements

## Overview

The overall browser window is split into into left and right panels that are both "full height". The left panel is the Location List and related functionality and the Map view is on the right. The Map generally takes up most of the width of the window, although for smaller window sizes including some mobile applications the location list and map may each be full screen with controls to switch back and forth. The use of "location" throughout this document should be understood to mean "latitude/longitude pair" and there is an entry for a location in the location list and a marker on the map indicating where in the world it represents.

Buttons in the UI are as small as possible to hold icons that legibly define the operation. These buttons all have tooltips; these tooltips initially have just a concise "command name" but if the hover remains for five seconds the tooltip offers a more verbose description of the function.

## The Map

The map view takes up most of the browser frame. It shows a simple map view with map tiles from open sources, perhaps OpenStreetMap or perhaps hosted alongside this application. It can be scrolled by clicking and dragging the map. The scroll wheel or other suitable input can be used to change zoom levels on the map. The map also has controls for manually zooming in and out as well as fitting the map view to show all of the markers that are placed on the map. The map view is always north-up.

## The Location List

The left panel is broadly the location list, although it is split into a few sections. The top line is for entry of a new locations. The UI is two text edit fields followed by an "add" button, the button is as small as possible while remaining obvious for its function. Below the two text edit fields is a set of radio buttons to interpret the input as latitude/longitude or longitude/latitude.Below this is the actual list of locations, each location has individual text edit boxes for each location followed by two buttons, one which swaps the latitude and longitude and the other which deletes the location from the list (and its associated marker). A list of deleted locations is maintained and the UI can be toggled to show them to allow the user to undelete specific entries.

Below the list of locations is a pair of radio buttons to toggle between showing decimal degrees and DMS (degree, minute, second) coordinates, and then after that is a checkbox to show the "cardinal directions," e.g. N, E, S, or W after each coordinate.

The entire location list, as displayed based on the various toggles, can be copied to the clipboard with a button in the UI.

## Pasting locations

The user can paste locations at any time, as long as the browser window has focus, Ctrl-V (or otherwise as appropriate to the platform) can be used to paste a single location or multiple locations. The input is parsed as pairs of coordinates and validated to ensure that latitude and longitude ordering is appropriate (as latitudes cannot exceed +/- 90 degrees); if the data is "consistently inconsistent" versus the UI setting then a popup tells the user this and offers to switch them all. Otherwise, only "bad" latitudes are swapped with the longitudes, still only after alerting the user. Pasted data can be in decimal degrees or DMS, or some mixture thereof. Pasted data may also have cardinal directions specified which will be used along with the numerical value for validation.

## Marker colors

Marker colors cycle the color wheel in a meaningful way to maximize discrimination. To the left of each location in the location list there is a color swatch that matches the associated marker's color. This color swatch can be clicked to bring up a color selector, which would change the marker color and the color of the swatch.

## Internal storage

Internally, locations are stored exactly as they were entered by the user to maintain precision. The values are converted as appropriate when displayed in the UI or when "rendered" to the clipboard. The math is done as integers, where values represented as a numerator and a denominator,where the denominator is ten raised to the power of the number of digits following the decimal point. E.g. if the user pastes eight digits following the decimal point, that value is stored as the numerator and 10e8 is stored as the denominator. The whole part is included in the numerator. Input data is truncated at 16 digits to prevent overflow, this is the only persistent change made to the input values but this should be fine as it still maintains precision to about four nanometers.
