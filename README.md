# Tom's GeoTools

Since I got into "mapping" I've had a few utilities that I've wanted to implement to make my own
life easier so that's what this is. I've never done any web development so it is what it is; this
project's key components are Svelte 5 and OpenLayers. I removed TailwindCSS from the default
SvelteKit installation because it exerts too much control over the way divs resize when the browser
does. I can understand why it does that but it's super annoying for an application like this.

## Development

With `npm` installed, I think it's just `npm install` to get dependencies installed and then `npm
run dev` to spin up a Vite-backed development server. Alternatively, the `npm test` command will run
a file-watching unit test harness and `npm test run` will run the tests one-shot.

## Deployment

Just do `npm run build` and copy the contents of the `build` directory somewhere that can serve it.

# Caveat

I have no idea what I'm doing.
