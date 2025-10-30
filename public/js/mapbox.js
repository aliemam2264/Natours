/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiYWxpZW1hbTIyNjQiLCJhIjoiY21ncWdtMnIzMWFzODJqcXduNDA5cnhrNCJ9.UVBwz_X44bOZRWJkHHVdHw';

var map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/aliemam2264/cmgqhgx7n00cs01sbbsoy7rd6', // style URL
  scrollZoom: false,
  // center: [-118.113491, 34.111745], // starting position [lng, lat]
  // zoom: 8, // starting zoom
  // interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create Marker.
  const el = document.createElement('div');
  el.className = 'marker';

  // Add Marker.
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add Popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend the map bounds to include the current location.
  bounds.extend(loc.coordinates);
});

// fitting the map preview with our exact bounds.
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});

window.scrollTo(0, 0);
