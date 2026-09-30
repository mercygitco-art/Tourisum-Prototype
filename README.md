# Ceylon — Discover Sri Lanka

A responsive tourism website prototype for exploring Sri Lankan destinations and sketching a trip.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run lint
npm test
npm run build
```

## What works

- Destination cards can be filtered by culture, highlands, coast, and wildlife.
- Selecting a destination opens the trip planner with that place as the route starting point.
- The planner builds an illustrative route based on available destinations, trip length, travel pace, and the selected coast.
- The destination section includes an interactive OpenStreetMap view; destination filters also filter map pins, and each pin can start a trip idea.
- A generated itinerary can be plotted as numbered stops with a schematic dashed connector. Visitors can optionally center the map on their current browser location; the site does not store it.
- A generated route can be saved in browser storage, copied, or downloaded as a text file.
- Place links open the selected destination in Google Maps.
- Hero motion respects the system reduced-motion setting; the poster image remains available if the video cannot play.

The planner is a front-end prototype. It does not book travel, check live conditions, calculate transfer times, or send data to a travel operator. Map pins are approximate points of interest, and dashed itinerary connectors are straight schematic lines, not routes or navigation directions; the wildlife marker indicates Yala National Park as one example. Current location is only requested after the visitor selects “Use my location”; it is not saved by this site. The interactive map loads tiles from OpenStreetMap and requires an internet connection. For production traffic, use a tile provider whose usage policy and capacity match the service. Verify local transport, opening hours, weather, and availability before making plans. Saved plans stay in the current browser on the current device.

## Image credits

The destination photographs in `public/images` are bundled locally from Wikimedia Commons and Unsplash. Wikimedia author, source page, and license details are listed in the site footer. Images are presented under their respective licenses. The hero video and its poster are served locally; the video is used under the Pexels License.
