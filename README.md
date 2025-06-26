# Tom's GeoTools

Since I got into "mapping" I've had a few utilities that I've wanted to implement to make my own
life easier so that's what this is. I've never done any web development so it is what it is; this
project's key components are Svelte 5 and OpenLayers. I removed TailwindCSS from the default
SvelteKit installation because it exerts too much control over the way divs resize when the browser
does. I can understand why it does that but it's super annoying for an application like this.

## Features

- Click on the map to place markers, which creates an entry in the location list
- Manually add a location to the list, which creates a marker
- Colors cycle as markers are created, entries in the location list and the markers on the map share the same color for easy identification
- Hovering items in the location list or on the map highlights the corresponding other item
- Pasting into a new entry in the location list accepts either a single latitude or longitude, a lat/lon pair, or a list of latitudes and longitudes and the software creates as many entries as necessary
- Individual entries in the location list can be swapped (lat<-\>lon) in case the source has them reversed
- The location list can show latitude/longitude or longitude/latitude depending on your needs
- Pasted lat/lons can be in decimal degrees or DMS and the rendered representation can also be switched between these modes
- The degrees and quote marks for DMS can be used or the letters 'dms' can be used instead
- The list of lat/lons can be copied to the clipboard to facilitate use in your own applications
